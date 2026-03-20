package dao

import (
	"context"
	"aura-backend/common/db"
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

func CreateUser(ctx context.Context, email, passwordHash, firstName, lastName, degreeProgram, university string, goalID, studyYear int) (int, error) {
	var id int
	query := `INSERT INTO user_student (email, password_hash, first_name, last_name, degree_program, study_year, university, goal_id) 
	          VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`
	err := db.Pool.QueryRow(ctx, query, email, passwordHash, firstName, lastName, degreeProgram, studyYear, university, goalID).Scan(&id)
	if err != nil {
		return 0, err
	}
	return id, nil
}
