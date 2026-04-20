package service

import (
	"context"

	skillgapanalysis "aura-backend/skill-gap-analysis-module"
	"aura-backend/skill-gap-analysis-module/dao"
)

func GetSkillLevels(ctx context.Context, email string) ([]skillgapanalysis.SkillLevel, error) {
	return dao.GetSkillLevels(ctx, email)
}

func GetSkillGap(ctx context.Context, email string) ([]skillgapanalysis.SkillGap, error) {
	return dao.GetSkillGap(ctx, email)
}
