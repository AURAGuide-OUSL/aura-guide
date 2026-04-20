package service

import (
	"context"

	onboarding "aura-backend/onboarding-module"
	"aura-backend/onboarding-module/dao"
)

func UpdateOnboarding(ctx context.Context, email string, req onboarding.Request) error {
	return dao.UpdateOnboarding(ctx, email, req)
}
