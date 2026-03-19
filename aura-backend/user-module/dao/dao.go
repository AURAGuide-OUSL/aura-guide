package dao

import (
	"context"
	"log"
	"aura-backend/common/db"
	"aura-backend/user-module"
)

func GetUserByEmail(ctx context.Context, email string) (*user.UserStudent, error) {
	var u user.UserStudent
	query := `SELECT id, goal_id, email, first_name, last_name, degree_program, study_year, university, current_score, recommendation 
	          FROM user_student WHERE email = $1`

	err := db.Pool.QueryRow(ctx, query, email).Scan(
		&u.ID, &u.GoalID, &u.Email, &u.FirstName, &u.LastName,
		&u.DegreeProgram, &u.StudyYear, &u.University, &u.CurrentScore, &u.Recommendation,
	)

	if err != nil {
		return nil, err
	}
	return &u, nil
}

func UpdateUser(ctx context.Context, u *user.UserStudent) error {
	query := `UPDATE user_student SET 
		first_name = $1, last_name = $2, degree_program = $3, study_year = $4, university = $5, goal_id = $6
		WHERE email = $7`
	
	_, err := db.Pool.Exec(ctx, query, 
		u.FirstName, u.LastName, u.DegreeProgram, u.StudyYear, u.University, u.GoalID, u.Email)
	return err
}

func GetAllUsers(ctx context.Context) ([]user.UserStudent, error) {
	query := `SELECT id, goal_id, email, first_name, last_name, degree_program, study_year, university, current_score, recommendation 
	          FROM user_student`
	rows, err := db.Pool.Query(ctx, query)
	if err != nil {
		log.Printf("GetAllUsers Query error: %v", err)
		return nil, err
	}
	defer rows.Close()

	var users []user.UserStudent
	for rows.Next() {
		var u user.UserStudent
		err := rows.Scan(
			&u.ID, &u.GoalID, &u.Email, &u.FirstName, &u.LastName,
			&u.DegreeProgram, &u.StudyYear, &u.University, &u.CurrentScore, &u.Recommendation,
		)
		if err != nil {
			log.Printf("GetAllUsers Scan error: %v", err)
			return nil, err
		}
		users = append(users, u)
	}
	return users, nil
}
