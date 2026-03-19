package service

import (
	"context"
	"aura-backend/skill-module"
	"aura-backend/skill-module/dao"
)

func GetSkills(ctx context.Context) ([]skill.Skill, error) {
	return dao.GetAllSkills(ctx)
}

func GetCategories(ctx context.Context) ([]skill.Category, error) {
	return dao.GetAllCategories(ctx)
}
