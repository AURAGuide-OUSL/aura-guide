package dao

import (
	"context"

	"aura-backend/common/db"
	onboarding "aura-backend/onboarding-module"
)

func UpdateOnboarding(ctx context.Context, email string, req onboarding.Request) error {
	_, err := db.Pool.Exec(ctx, `UPDATE user_student SET
		first_name = COALESCE($1, first_name),
		last_name = COALESCE($2, last_name),
		degree_program = COALESCE($3, degree_program),
		study_year = COALESCE($4, study_year),
		university = COALESCE($5, university),
		technical_skill_level = COALESCE($6, technical_skill_level),
		soft_skill_level = COALESCE($7, soft_skill_level),
		availability_type = COALESCE($8, availability_type),
		availability_hours = COALESCE($9, availability_hours),
		goal_id = COALESCE($10, goal_id),
		current_score = COALESCE($11, current_score),
		recommendation = COALESCE($12, recommendation)
		WHERE email = $13`,
		req.FirstName, req.LastName, req.DegreeProgram, req.StudyYear, req.University,
		req.TechnicalSkill, req.SoftSkill, req.Availability, req.AvailabilityH,
		req.GoalID, req.CurrentScore, req.Recommendation, email)
	return err
}
