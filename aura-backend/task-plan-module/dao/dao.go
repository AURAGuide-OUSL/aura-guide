package dao

import (
	"context"
	"fmt"
	"time"

	"aura-backend/common/db"
	taskplan "aura-backend/task-plan-module"
)

type userContext struct {
	UserID       int
	GoalID       *int
	CurrentScore int
}

type taskSeed struct {
	SkillID *int
	Task    string
}

type taskRecord struct {
	ID            int
	UserID        int
	SkillID       *int
	Task          string
	StatusID      int
	StartDateTime *time.Time
	EndDateTime   *time.Time
}

func GetCareerPath(ctx context.Context, email string) (*taskplan.CareerPathResponse, error) {
	var response taskplan.CareerPathResponse
	response.User = email
	query := `SELECT u.goal_id, COALESCE(g.name, 'Not selected')
		FROM user_student u
		LEFT JOIN goals g ON g.id = u.goal_id
		WHERE u.email = $1`
	if err := db.Pool.QueryRow(ctx, query, email).Scan(&response.GoalID, &response.CareerPath); err != nil {
		return nil, err
	}
	return &response, nil
}

func GetSkillScore(ctx context.Context, email string) (*taskplan.SkillScoreResponse, error) {
	var score int
	if err := db.Pool.QueryRow(ctx, `SELECT COALESCE(current_score, 0) FROM user_student WHERE email = $1`, email).Scan(&score); err != nil {
		return nil, err
	}
	return &taskplan.SkillScoreResponse{CurrentScore: score, SkillLevel: deriveSkillLevel(score)}, nil
}

func GeneratePlan(ctx context.Context, email string) ([]taskplan.Task, error) {
	existing, err := GetTaskPlan(ctx, email)
	if err == nil && len(existing) > 0 {
		return existing, nil
	}

	userCtx, err := getUserContext(ctx, email)
	if err != nil {
		return nil, err
	}

	seeds, err := getSuggestedTasks(ctx, userCtx)
	if err != nil {
		return nil, err
	}
	if len(seeds) == 0 {
		return []taskplan.Task{}, nil
	}

	pendingStatusID, err := getStatusID(ctx, "pending")
	if err != nil {
		return nil, err
	}

	now := time.Now().UTC()
	for index, seed := range seeds {
		start := now.AddDate(0, 0, index)
		end := start.Add(48 * time.Hour)
		if _, err := db.Pool.Exec(ctx,
			`INSERT INTO user_custom_tasks (skill_id, user_id, task, start_date_time, end_date_time, status_id)
			 VALUES ($1, $2, $3, $4, $5, $6)`,
			seed.SkillID, userCtx.UserID, seed.Task, start, end, pendingStatusID,
		); err != nil {
			return nil, err
		}
	}

	return GetTaskPlan(ctx, email)
}

func GetTaskPlan(ctx context.Context, email string) ([]taskplan.Task, error) {
	userCtx, err := getUserContext(ctx, email)
	if err != nil {
		return nil, err
	}

	rows, err := db.Pool.Query(ctx, `SELECT uct.id, uct.skill_id, uct.task, COALESCE(s.name, 'pending'), uct.start_date_time, uct.end_date_time
		FROM user_custom_tasks uct
		LEFT JOIN status s ON s.id = uct.status_id
		WHERE uct.user_id = $1
		ORDER BY uct.start_date_time NULLS LAST, uct.id`, userCtx.UserID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tasks []taskplan.Task
	for rows.Next() {
		var task taskplan.Task
		if err := rows.Scan(&task.ID, &task.SkillID, &task.Task, &task.Status, &task.StartDateTime, &task.EndDateTime); err != nil {
			return nil, err
		}
		tasks = append(tasks, task)
	}
	return tasks, rows.Err()
}

func GetTasksForDate(ctx context.Context, email string, date time.Time) ([]taskplan.Task, error) {
	tasks, err := GetTaskPlan(ctx, email)
	if err != nil {
		return nil, err
	}

	selected := date.Format("2006-01-02")
	var filtered []taskplan.Task
	for _, task := range tasks {
		if task.StartDateTime == nil {
			continue
		}
		start := task.StartDateTime.Format("2006-01-02")
		end := start
		if task.EndDateTime != nil {
			end = task.EndDateTime.Format("2006-01-02")
		}
		if selected >= start && selected <= end {
			filtered = append(filtered, task)
		}
	}
	return filtered, nil
}

func UpdateTask(ctx context.Context, email string, taskID int, req taskplan.UpdateTaskRequest) error {
	record, err := getTaskRecord(ctx, email, taskID)
	if err != nil {
		return err
	}

	if req.Task != nil {
		record.Task = *req.Task
	}
	if req.StartDateTime != nil {
		record.StartDateTime = req.StartDateTime
	}
	if req.EndDateTime != nil {
		record.EndDateTime = req.EndDateTime
	}
	if req.Status != nil {
		statusID, err := getStatusID(ctx, *req.Status)
		if err != nil {
			return err
		}
		record.StatusID = statusID
	}

	_, err = db.Pool.Exec(ctx, `UPDATE user_custom_tasks
		SET task = $1, start_date_time = $2, end_date_time = $3, status_id = $4
		WHERE id = $5 AND user_id = $6`,
		record.Task, record.StartDateTime, record.EndDateTime, record.StatusID, record.ID, record.UserID)
	return err
}

func CompleteTask(ctx context.Context, email string, taskID int) error {
	record, err := getTaskRecord(ctx, email, taskID)
	if err != nil {
		return err
	}

	completedStatusID, err := getStatusID(ctx, "completed")
	if err != nil {
		return err
	}

	end := time.Now().UTC()
	if record.StartDateTime == nil {
		record.StartDateTime = &end
	}

	_, err = db.Pool.Exec(ctx, `UPDATE user_custom_tasks
		SET status_id = $1, end_date_time = $2, start_date_time = $3
		WHERE id = $4 AND user_id = $5`,
		completedStatusID, end, record.StartDateTime, record.ID, record.UserID)
	return err
}

func DeleteTask(ctx context.Context, email string, taskID int) error {
	userCtx, err := getUserContext(ctx, email)
	if err != nil {
		return err
	}
	_, err = db.Pool.Exec(ctx, `DELETE FROM user_custom_tasks WHERE id = $1 AND user_id = $2`, taskID, userCtx.UserID)
	return err
}

func getUserContext(ctx context.Context, email string) (*userContext, error) {
	var userCtx userContext
	if err := db.Pool.QueryRow(ctx, `SELECT id, goal_id, COALESCE(current_score, 0) FROM user_student WHERE email = $1`, email).Scan(&userCtx.UserID, &userCtx.GoalID, &userCtx.CurrentScore); err != nil {
		return nil, err
	}
	return &userCtx, nil
}

func getSuggestedTasks(ctx context.Context, userCtx *userContext) ([]taskSeed, error) {
	var seeds []taskSeed
	if userCtx.GoalID != nil {
		rows, err := db.Pool.Query(ctx, `SELECT DISTINCT ct.skill_id, ct.task
			FROM goal_skill_matrix gsm
			JOIN common_tasks ct ON ct.skill_id = gsm.skill_id
			LEFT JOIN user_skills us ON us.user_id = $1 AND us.skill_id = gsm.skill_id
			WHERE gsm.goal_id = $2 AND COALESCE(us.score_id, 0) < COALESCE(gsm.score_id, 0)
			ORDER BY ct.skill_id, ct.task
			LIMIT 5`, userCtx.UserID, *userCtx.GoalID)
		if err != nil {
			return nil, err
		}
		defer rows.Close()
		for rows.Next() {
			var seed taskSeed
			if err := rows.Scan(&seed.SkillID, &seed.Task); err != nil {
				return nil, err
			}
			seeds = append(seeds, seed)
		}
		if err := rows.Err(); err != nil {
			return nil, err
		}
	}

	if len(seeds) > 0 {
		return seeds, nil
	}

	rows, err := db.Pool.Query(ctx, `SELECT skill_id, task FROM common_tasks ORDER BY id LIMIT 5`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var seed taskSeed
		if err := rows.Scan(&seed.SkillID, &seed.Task); err != nil {
			return nil, err
		}
		seeds = append(seeds, seed)
	}
	return seeds, rows.Err()
}

func getStatusID(ctx context.Context, name string) (int, error) {
	var statusID int
	err := db.Pool.QueryRow(ctx, `SELECT id FROM status WHERE LOWER(name) = LOWER($1) LIMIT 1`, name).Scan(&statusID)
	if err == nil {
		return statusID, nil
	}

	if name == "pending" {
		return 0, fmt.Errorf("pending status not found: %w", err)
	}
	return getStatusID(ctx, "pending")
}

func getTaskRecord(ctx context.Context, email string, taskID int) (*taskRecord, error) {
	userCtx, err := getUserContext(ctx, email)
	if err != nil {
		return nil, err
	}

	var record taskRecord
	record.UserID = userCtx.UserID
	err = db.Pool.QueryRow(ctx, `SELECT uct.id, uct.skill_id, uct.task, uct.status_id, uct.start_date_time, uct.end_date_time
		FROM user_custom_tasks uct
		WHERE uct.id = $1 AND uct.user_id = $2`, taskID, userCtx.UserID).Scan(
		&record.ID, &record.SkillID, &record.Task, &record.StatusID, &record.StartDateTime, &record.EndDateTime,
	)
	if err != nil {
		return nil, err
	}
	return &record, nil
}

func deriveSkillLevel(score int) string {
	switch {
	case score >= 80:
		return "Advanced"
	case score >= 60:
		return "Intermediate"
	case score >= 40:
		return "Developing"
	default:
		return "Beginner"
	}
}
