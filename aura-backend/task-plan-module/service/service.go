package service

import (
	"context"
	"strconv"
	"time"

	taskplan "aura-backend/task-plan-module"
	"aura-backend/task-plan-module/dao"
)

func GetCareerPath(ctx context.Context, email string) (*taskplan.CareerPathResponse, error) {
	return dao.GetCareerPath(ctx, email)
}

func GetSkillScore(ctx context.Context, email string) (*taskplan.SkillScoreResponse, error) {
	return dao.GetSkillScore(ctx, email)
}

func GeneratePlan(ctx context.Context, email string) (*taskplan.GeneratePlanResponse, error) {
	tasks, err := dao.GeneratePlan(ctx, email)
	if err != nil {
		return nil, err
	}

	return &taskplan.GeneratePlanResponse{Message: "Task plan generated successfully", Tasks: tasks}, nil
}

func GetTaskPlan(ctx context.Context, email string) ([]taskplan.Task, error) {
	return dao.GetTaskPlan(ctx, email)
}

func UpdateTask(ctx context.Context, email string, taskID int, req taskplan.UpdateTaskRequest) error {
	return dao.UpdateTask(ctx, email, taskID, req)
}

func CompleteTask(ctx context.Context, email string, taskID int) error {
	return dao.CompleteTask(ctx, email, taskID)
}

func DeleteTask(ctx context.Context, email string, taskID int) error {
	return dao.DeleteTask(ctx, email, taskID)
}

func DeleteAgentTask(ctx context.Context, email string, userCommonTaskID int) error {
	return dao.DeleteAgentTask(ctx, email, userCommonTaskID)
}

func GetTasksForDate(ctx context.Context, email string, date time.Time) ([]taskplan.Task, error) {
	return dao.GetTasksForDate(ctx, email, date)
}

func AddTask(ctx context.Context, email string, req taskplan.AddTaskRequest) (*taskplan.Task, error) {
	return dao.AddTask(ctx, email, req)
}

func ParseTaskID(value string) (int, error) {
	return strconv.Atoi(value)
}
