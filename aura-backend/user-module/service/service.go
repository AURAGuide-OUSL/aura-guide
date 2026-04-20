package service

import (
	"context"
	"net/http"
	"time"

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

func DeleteProfile(ctx context.Context, email string) error {
	return dao.DeleteUserByEmail(ctx, email)
}

func ClearSession(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    "",
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   true,
		Path:     "/",
	})
}
