package dao

import (
	"context"

	"aura-backend/common/db"
	skillgapanalysis "aura-backend/skill-gap-analysis-module"
)

func GetSkillLevels(ctx context.Context, email string) ([]skillgapanalysis.SkillLevel, error) {
	rows, err := db.Pool.Query(ctx, `SELECT s.id, s.name, c.name, COALESCE(us.score_id, 0), COALESCE(sml.level, 'Beginner')
		FROM user_student u
		JOIN user_skills us ON us.user_id = u.id
		JOIN skills s ON s.id = us.skill_id
		LEFT JOIN category c ON c.id = s.category_id
		LEFT JOIN skill_matrix_levels sml ON sml.score_id = us.score_id
		WHERE u.email = $1
		ORDER BY s.name`, email)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make([]skillgapanalysis.SkillLevel, 0)
	for rows.Next() {
		var row skillgapanalysis.SkillLevel
		if err := rows.Scan(&row.SkillID, &row.SkillName, &row.Category, &row.Score, &row.Level); err != nil {
			return nil, err
		}
		result = append(result, row)
	}
	return result, rows.Err()
}

func GetSkillGap(ctx context.Context, email string) ([]skillgapanalysis.SkillGap, error) {
	rows, err := db.Pool.Query(ctx, `SELECT s.id,
		s.name,
		COALESCE(gsm.score_id, 0) AS required_score,
		COALESCE(us.score_id, 0) AS current_score,
		COALESCE(req.level, 'Unknown') AS required_level,
		COALESCE(cur.level, 'Beginner') AS current_level
		FROM user_student u
		JOIN goal_skill_matrix gsm ON gsm.goal_id = u.goal_id
		JOIN skills s ON s.id = gsm.skill_id
		LEFT JOIN user_skills us ON us.user_id = u.id AND us.skill_id = gsm.skill_id
		LEFT JOIN skill_matrix_levels req ON req.score_id = gsm.score_id
		LEFT JOIN skill_matrix_levels cur ON cur.score_id = us.score_id
		WHERE u.email = $1
		ORDER BY s.name`, email)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make([]skillgapanalysis.SkillGap, 0)
	for rows.Next() {
		var row skillgapanalysis.SkillGap
		if err := rows.Scan(&row.SkillID, &row.SkillName, &row.RequiredScore, &row.CurrentScore, &row.RequiredLevel, &row.CurrentLevel); err != nil {
			return nil, err
		}
		row.Gap = row.RequiredScore - row.CurrentScore
		if row.Gap < 0 {
			row.Gap = 0
		}
		result = append(result, row)
	}
	return result, rows.Err()
}
