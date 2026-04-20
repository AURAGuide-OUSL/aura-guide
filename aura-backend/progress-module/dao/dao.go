package dao

import (
	"context"
	"strings"

	progress "aura-backend/progress-module"
	taskdao "aura-backend/task-plan-module/dao"
)

func GetOverview(ctx context.Context, email string) (*progress.Overview, error) {
	tasks, err := taskdao.GetTaskPlan(ctx, email)
	if err != nil {
		return nil, err
	}

	overview := &progress.Overview{TotalTasks: len(tasks)}
	for _, task := range tasks {
		if strings.EqualFold(task.Status, "completed") {
			overview.CompletedTasks++
		} else {
			overview.PendingTasks++
		}
	}
	return overview, nil
}

func GetCurrentTask(ctx context.Context, email string) (*progress.Task, error) {
	tasks, err := taskdao.GetTaskPlan(ctx, email)
	if err != nil {
		return nil, err
	}

	for _, task := range tasks {
		if !strings.EqualFold(task.Status, "completed") {
			return &progress.Task{ID: task.ID, Task: task.Task, Status: task.Status}, nil
		}
	}
	return &progress.Task{}, nil
}

func GetCompletedTasks(ctx context.Context, email string) ([]progress.Task, error) {
	tasks, err := taskdao.GetTaskPlan(ctx, email)
	if err != nil {
		return nil, err
	}

	result := make([]progress.Task, 0)
	for _, task := range tasks {
		if strings.EqualFold(task.Status, "completed") {
			result = append(result, progress.Task{ID: task.ID, Task: task.Task, Status: task.Status})
		}
	}
	return result, nil
}
