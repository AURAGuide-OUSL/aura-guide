package service

import (
	"context"

	badge "aura-backend/badge-module"
	"aura-backend/badge-module/dao"
)

func GetEarnedBadges(ctx context.Context, email string) ([]badge.Badge, error) {
	return dao.GetEarnedBadges(ctx, email)
}
