package service

import (
	"context"
	"aura-backend/user-module"
	"aura-backend/user-module/dao"
)

func GetUserProfile(ctx context.Context, email string) (*user.UserStudent, error) {
	return dao.GetUserByEmail(ctx, email)
}

func UpdateProfile(ctx context.Context, profile *user.UserStudent) error {
	return dao.UpdateUser(ctx, profile)
}

func GetAllUsersProfiles(ctx context.Context) ([]user.UserStudent, error) {
	return dao.GetAllUsers(ctx)
}
