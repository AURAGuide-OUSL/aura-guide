package dao

import (
	"aura-backend/common/db"
	"context"
)

type UserCredentials struct {
	ID           int
	Email        string
	PasswordHash string
}

func GetUserByEmail(ctx context.Context, email string) (*UserCredentials, error) {
	var user UserCredentials
	query := `SELECT id, email, password_hash FROM user_student WHERE email = $1`
	err := db.Pool.QueryRow(ctx, query, email).Scan(&user.ID, &user.Email, &user.PasswordHash)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func CreateUser(
	ctx context.Context,
	email, passwordHash, firstName, lastName, degreeProgram, university, technicalSkillLevel, softSkillLevel, availabilityType string,
	availabilityHours, goalID, studyYear int,
) (int, error) {
	var id int
	query := `INSERT INTO user_student (email, password_hash, first_name, last_name, degree_program, study_year, university, technical_skill_level, soft_skill_level, availability_type, availability_hours, goal_id) 
	          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`
	err := db.Pool.QueryRow(
		ctx, query,
		email, passwordHash, firstName, lastName, degreeProgram, studyYear, university,
		technicalSkillLevel, softSkillLevel, availabilityType, availabilityHours, goalID,
	).Scan(&id)
	if err != nil {
		return 0, err
	}
	return id, nil
}
