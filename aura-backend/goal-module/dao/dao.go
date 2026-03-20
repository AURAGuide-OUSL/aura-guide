package dao

import (
	"context"
	"log"
	"aura-backend/common/db"
	"aura-backend/goal-module"
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
