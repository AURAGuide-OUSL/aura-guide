package dao

import (
	"context"
	"errors"
	"fmt"
	"time"

	"aura-backend/common/db"
	"aura-backend/common/skillsmetrics"
	taskplan "aura-backend/task-plan-module"
)

// ErrTaskNotFound indicates no matching task row for this user.
var ErrTaskNotFound = errors.New("task not found")

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
	userCtx, err := getUserContext(ctx, email)
	if err != nil {
		return nil, err
	}
	m, err := skillsmetrics.ForUser(ctx, userCtx.UserID)
	if err != nil {
		return nil, err
	}
	return &taskplan.SkillScoreResponse{
		CurrentScore: m.Percent,
		SkillLevel:   m.ReadinessLabel,
		SkillAverage: m.Average,
	}, nil
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

	q := `
SELECT id, task_origin, skill_id, skill_name, task_text, status_name, start_date_time, end_date_time FROM (
	SELECT uct.id, 'custom'::text AS task_origin, uct.skill_id,
		COALESCE(sk.name, '') AS skill_name,
		uct.task AS task_text,
		COALESCE(st.name, 'pending') AS status_name, uct.start_date_time, uct.end_date_time
	FROM user_custom_tasks uct
	LEFT JOIN status st ON st.id = uct.status_id
	LEFT JOIN skills sk ON sk.id = uct.skill_id
	WHERE uct.user_id = $1
	UNION ALL
	SELECT ucm.id, 'agent'::text AS task_origin, ct.skill_id,
		COALESCE(sk2.name, '') AS skill_name,
		ct.task AS task_text,
		COALESCE(st2.name, 'pending') AS status_name, ucm.start_date_time, ucm.end_date_time
	FROM user_common_tasks ucm
	JOIN common_tasks ct ON ct.id = ucm.common_task_id
	LEFT JOIN status st2 ON st2.id = ucm.status_id
	LEFT JOIN skills sk2 ON sk2.id = ct.skill_id
	WHERE ucm.user_id = $1
) x
ORDER BY start_date_time NULLS LAST, id`

	rows, err := db.Pool.Query(ctx, q, userCtx.UserID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tasks []taskplan.Task
	for rows.Next() {
		var task taskplan.Task
		if err := rows.Scan(&task.ID, &task.TaskOrigin, &task.SkillID, &task.SkillName, &task.Task, &task.Status, &task.StartDateTime, &task.EndDateTime); err != nil {
			return nil, err
		}
		task.IsCustom = task.TaskOrigin == "custom" && task.SkillID == nil
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
		if record.SkillID != nil {
			return fmt.Errorf("status updates for generated tasks are managed by the agent")
		}
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

// DeleteTask removes a row from user_custom_tasks or, if no match, user_common_tasks
// (IDs can collide across tables, but deleting by user-owned row is correct for merged task lists).
func DeleteTask(ctx context.Context, email string, taskID int) error {
	userCtx, err := getUserContext(ctx, email)
	if err != nil {
		return err
	}
	ct, err := db.Pool.Exec(ctx, `DELETE FROM user_custom_tasks WHERE id = $1 AND user_id = $2`, taskID, userCtx.UserID)
	if err != nil {
		return err
	}
	if ct.RowsAffected() > 0 {
		return nil
	}
	at, err := db.Pool.Exec(ctx, `DELETE FROM user_common_tasks WHERE id = $1 AND user_id = $2`, taskID, userCtx.UserID)
	if err != nil {
		return err
	}
	if at.RowsAffected() == 0 {
		return ErrTaskNotFound
	}
	return nil
}

// CountCompletedTasks returns rows in user_custom_tasks and user_common_tasks with status completed.
func CountCompletedTasks(ctx context.Context, userID int) (int, error) {
	var n int
	err := db.Pool.QueryRow(ctx, `
SELECT COALESCE((SELECT COUNT(*)::int FROM user_custom_tasks uct
    JOIN status s ON s.id = uct.status_id
    WHERE uct.user_id = $1 AND LOWER(s.name) = 'completed'), 0)
+ COALESCE((SELECT COUNT(*)::int FROM user_common_tasks ucm
    JOIN status s2 ON s2.id = ucm.status_id
    WHERE ucm.user_id = $1 AND LOWER(s2.name) = 'completed'), 0)`,
		userID).Scan(&n)
	if err != nil {
		return 0, err
	}
	return n, nil
}

func DeleteAgentTask(ctx context.Context, email string, userCommonTaskID int) error {
	// Same semantics as DeleteTask - try custom first then agent linkage.
	return DeleteTask(ctx, email, userCommonTaskID)
}

func AddTask(ctx context.Context, email string, req taskplan.AddTaskRequest) (*taskplan.Task, error) {
	userCtx, err := getUserContext(ctx, email)
	if err != nil {
		return nil, err
	}

	statusName := req.Status
	if statusName == "" {
		statusName = "pending"
	}
	statusID, err := getStatusID(ctx, statusName)
	if err != nil {
		return nil, err
	}

	start := req.StartDateTime
	if start == nil {
		now := time.Now().UTC()
		start = &now
	}

	var id int
	err = db.Pool.QueryRow(ctx, `INSERT INTO user_custom_tasks (skill_id, user_id, task, start_date_time, end_date_time, status_id)
		VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
		req.SkillID, userCtx.UserID, req.Task, start, req.EndDateTime, statusID,
	).Scan(&id)
	if err != nil {
		return nil, err
	}

	record, err := getTaskRecord(ctx, email, id)
	if err != nil {
		return nil, err
	}

	return &taskplan.Task{
		ID:            record.ID,
		SkillID:       record.SkillID,
		IsCustom:      record.SkillID == nil,
		Task:          record.Task,
		Status:        statusName,
		StartDateTime: record.StartDateTime,
		EndDateTime:   record.EndDateTime,
	}, nil
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
