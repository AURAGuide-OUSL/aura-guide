package dao

import (
	"context"
	"time"

	notification "aura-backend/notification-module"
	progressdao "aura-backend/progress-module/dao"
)

func GetDailyTaskReminder(ctx context.Context, email string) (*notification.Response, error) {
	currentTask, err := progressdao.GetCurrentTask(ctx, email)
	if err != nil {
		return nil, err
	}

	message := "You have no pending tasks today. Great job staying on track."
	if currentTask != nil && currentTask.Task != "" {
		message = "Today's focus: " + currentTask.Task
	}
	return &notification.Response{Message: message, Date: time.Now().UTC()}, nil
}

func GetMotivationalQuote() notification.Response {
	quotes := []string{
		"Small, consistent progress compounds into meaningful career growth.",
		"Clarity comes from practice, not from waiting for perfect confidence.",
		"Every finished task is proof that your future role is getting closer.",
	}
	index := time.Now().Day() % len(quotes)
	return notification.Response{Message: quotes[index], Date: time.Now().UTC()}
}
