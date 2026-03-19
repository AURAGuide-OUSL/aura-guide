package service

import (
	"context"
	"aura-backend/goal-module"
	"aura-backend/goal-module/dao"
)

func GetGoals(ctx context.Context) ([]goal.Goal, error) {
	return dao.GetAllGoals(ctx)
}
