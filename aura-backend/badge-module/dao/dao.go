package dao

import (
	"context"
	"time"

	badge "aura-backend/badge-module"
	progressdao "aura-backend/progress-module/dao"
)

func GetEarnedBadges(ctx context.Context, email string) ([]badge.Badge, error) {
	overview, err := progressdao.GetOverview(ctx, email)
	if err != nil {
		return nil, err
	}

	now := time.Now().UTC()
	badges := make([]badge.Badge, 0)
	if overview.CompletedTasks >= 1 {
		badges = append(badges, badge.Badge{Name: "Task Starter", Criteria: "Complete your first task.", IssuedDate: now})
	}
	if overview.CompletedTasks >= 5 {
		badges = append(badges, badge.Badge{Name: "Consistency Builder", Criteria: "Complete five tasks.", IssuedDate: now})
	}
	if overview.CompletedTasks >= 10 {
		badges = append(badges, badge.Badge{Name: "Goal Chaser", Criteria: "Complete ten tasks.", IssuedDate: now})
	}
	return badges, nil
}
