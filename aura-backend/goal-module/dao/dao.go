package dao

import (
	"context"
	"log"

	"aura-backend/common/db"
	"aura-backend/common/skillsmetrics"
	"aura-backend/goal-module"
	taskdao "aura-backend/task-plan-module/dao"
)

func GetAllGoals(ctx context.Context) ([]goal.Goal, error) {
	query := `SELECT id, name FROM goals`
	rows, err := db.Pool.Query(ctx, query)
	if err != nil {
		log.Printf("GetAllGoals Query error: %v", err)
		return nil, err
	}
	defer rows.Close()

	var goals []goal.Goal
	for rows.Next() {
		var g goal.Goal
		err := rows.Scan(&g.ID, &g.Name)
		if err != nil {
			log.Printf("GetAllGoals Scan error: %v", err)
			return nil, err
		}
		goals = append(goals, g)
	}
	return goals, nil
}

func GetGoalSummaryByEmail(ctx context.Context, email string) (*goal.GoalSummaryResponse, error) {
	result := &goal.GoalSummaryResponse{}
	var userID int
	var goalID *int
	if err := db.Pool.QueryRow(ctx, `SELECT u.id, u.goal_id, COALESCE(g.name, '')
		FROM user_student u LEFT JOIN goals g ON g.id = u.goal_id WHERE u.email = $1`, email).Scan(&userID, &goalID, &result.CareerTitle); err != nil {
		return nil, err
	}

	cnt, err := taskdao.CountCompletedTasks(ctx, userID)
	if err != nil {
		return nil, err
	}
	result.CompletedTasks = cnt

	am, err := skillsmetrics.ForUser(ctx, userID)
	if err != nil {
		return nil, err
	}
	result.AuraScorePercent = am.Percent
	result.SkillAverage = am.Average
	result.SkillReadinessLabel = am.ReadinessLabel

	if goalID == nil {
		return result, nil
	}

	rows, err := db.Pool.Query(ctx, `SELECT s.id, s.name, COALESCE(c.name, ''), gsm.score_id,
		COALESCE(us.score_id, 0), COALESCE(req.level, ''), COALESCE(cur.level, '')
		FROM goal_skill_matrix gsm
		JOIN skills s ON s.id = gsm.skill_id
		LEFT JOIN category c ON c.id = s.category_id
		LEFT JOIN user_skills us ON us.user_id = $1 AND us.skill_id = gsm.skill_id
		LEFT JOIN skill_matrix_levels req ON req.score_id = gsm.score_id
		LEFT JOIN skill_matrix_levels cur ON cur.score_id = us.score_id
		WHERE gsm.goal_id = $2
		ORDER BY c.name, s.name`, userID, *goalID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		item := goal.GoalSkillProgress{}
		if err := rows.Scan(
			&item.SkillID,
			&item.SkillName,
			&item.CategoryName,
			&item.RequiredScore,
			&item.CurrentScore,
			&item.RequiredLevel,
			&item.CurrentLevel,
		); err != nil {
			return nil, err
		}
		item.RequiredPct = scoreToPercent(item.RequiredScore)
		item.CurrentPct = scoreToPercent(item.CurrentScore)
		result.Skills = append(result.Skills, item)
	}
	return result, rows.Err()
}

func scoreToPercent(score int) int {
	switch score {
	case 1:
		return 33
	case 2:
		return 67
	case 3:
		return 100
	default:
		return 0
	}
}
