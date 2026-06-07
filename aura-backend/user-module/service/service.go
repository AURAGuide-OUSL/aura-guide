package service

import (
	"context"
	"net/http"
	"time"

	goaldao "aura-backend/goal-module/dao"
	"aura-backend/common/skillsmetrics"
	"aura-backend/user-module"
	"aura-backend/user-module/dao"
)

func GetUserProfile(ctx context.Context, email string) (*user.UserStudent, error) {
	u, err := dao.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	m, err := skillsmetrics.ForUser(ctx, u.ID)
	if err != nil {
		return u, nil
	}
	p := m.Percent
	avg := m.Average
	label := m.ReadinessLabel
	u.CurrentScore = &p
	u.SkillScorePercent = &p
	u.SkillAverage = &avg
	u.SkillReadinessLabel = &label

	if rec, err := goaldao.UpdateCareerRecommendationIfReady(ctx, u.ID, u.GoalID, "", label, avg); err == nil && rec != "" {
		u.Recommendation = &rec
	}

	return u, nil
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
		Secure:   false,
		Path:     "/",
		SameSite: http.SameSiteLaxMode,
	})
}
