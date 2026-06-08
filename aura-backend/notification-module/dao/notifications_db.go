package dao

import (
	"context"
	"fmt"
	"strings"
	"time"

	notification "aura-backend/notification-module"
	"aura-backend/common/db"
	progressdao "aura-backend/progress-module/dao"
	taskdao "aura-backend/task-plan-module/dao"
)

func lookupUserID(ctx context.Context, email string) (int, error) {
	var id int
	err := db.Pool.QueryRow(ctx, `SELECT id FROM user_student WHERE lower(trim(email)) = lower(trim($1))`, email).Scan(&id)
	return id, err
}

func ensureNotificationColumns(ctx context.Context) {
	_, _ = db.Pool.Exec(ctx, `
ALTER TABLE user_notification ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE user_notification ADD COLUMN IF NOT EXISTS notification_type VARCHAR(64) DEFAULT 'reminder';
`)
}

func insertIfNewToday(ctx context.Context, userID int, nType, title, message string) error {
	var exists int
	err := db.Pool.QueryRow(ctx, `
SELECT COUNT(*) FROM user_notification
WHERE user_id = $1 AND notification_type = $2 AND title = $3
  AND send_date_time::date = CURRENT_DATE`, userID, nType, title).Scan(&exists)
	if err != nil {
		return err
	}
	if exists > 0 {
		return nil
	}
	_, err = db.Pool.Exec(ctx, `
INSERT INTO user_notification (user_id, title, message, notification_type, send_date_time, is_read)
VALUES ($1, $2, $3, $4, NOW(), false)`, userID, title, message, nType)
	return err
}

func SyncUserNotifications(ctx context.Context, email string) ([]notification.Item, error) {
	ensureNotificationColumns(ctx)
	userID, err := lookupUserID(ctx, email)
	if err != nil {
		return nil, err
	}

	// Task-focused reminder
	if rem, err := GetDailyTaskReminder(ctx, email); err == nil && rem != nil {
		_ = insertIfNewToday(ctx, userID, "task", "Today's focus", rem.Message)
	}

	// Motivational / AI-style coaching nudge
	quote := GetMotivationalQuote()
	_ = insertIfNewToday(ctx, userID, "ai", "Coach insight", quote.Message)

	// Upcoming tasks (next 48h)
	tasks, err := taskdao.GetTaskPlan(ctx, email)
	if err == nil {
		now := time.Now()
		limit := now.Add(48 * time.Hour)
		for _, t := range tasks {
			if strings.EqualFold(t.Status, "completed") || t.EndDateTime == nil {
				continue
			}
			if t.EndDateTime.After(now) && t.EndDateTime.Before(limit) {
				title := "Upcoming deadline"
				msg := fmt.Sprintf("Due soon: %s", strings.TrimSpace(t.Task))
				_ = insertIfNewToday(ctx, userID, "task", title, msg)
			}
		}
	}

	// Streak milestone
	if streak, err := progressdao.GetDayStreak(ctx, userID); err == nil && streak > 0 {
		if streak == 3 || streak == 7 || streak == 14 || streak == 30 || streak%10 == 0 {
			msg := fmt.Sprintf("You have a %d-day login streak. Consistency builds career readiness — keep showing up.", streak)
			_ = insertIfNewToday(ctx, userID, "achievement", "Streak milestone", msg)
		}
	}

	return ListUserNotifications(ctx, userID)
}

func ListUserNotifications(ctx context.Context, userID int) ([]notification.Item, error) {
	ensureNotificationColumns(ctx)
	rows, err := db.Pool.Query(ctx, `
SELECT id, COALESCE(title, 'Update'), COALESCE(message, ''), COALESCE(notification_type, 'reminder'),
       COALESCE(is_read, false), send_date_time
FROM user_notification
WHERE user_id = $1
ORDER BY send_date_time DESC NULLS LAST, id DESC
LIMIT 50`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []notification.Item
	for rows.Next() {
		var item notification.Item
		var sent *time.Time
		if err := rows.Scan(&item.ID, &item.Title, &item.Message, &item.Type, &item.Read, &sent); err != nil {
			return nil, err
		}
		if sent != nil {
			item.Time = formatNotifTime(*sent)
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func MarkAllRead(ctx context.Context, email string) error {
	userID, err := lookupUserID(ctx, email)
	if err != nil {
		return err
	}
	_, err = db.Pool.Exec(ctx, `UPDATE user_notification SET is_read = true WHERE user_id = $1`, userID)
	return err
}

func formatNotifTime(t time.Time) string {
	now := time.Now()
	if t.Year() == now.Year() && t.YearDay() == now.YearDay() {
		return t.Format("3:04 PM")
	}
	if now.Sub(t) < 7*24*time.Hour {
		return t.Format("Mon 3:04 PM")
	}
	return t.Format("Jan 2")
}

func ListNotificationsByEmail(ctx context.Context, email string) ([]notification.Item, error) {
	return SyncUserNotifications(ctx, email)
}
