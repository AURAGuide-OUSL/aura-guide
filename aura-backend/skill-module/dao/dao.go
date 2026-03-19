package dao

import (
	"context"
	"log"
	"aura-backend/common/db"
	"aura-backend/skill-module"
)

func GetAllSkills(ctx context.Context) ([]skill.Skill, error) {
	query := `SELECT id, name, category_id FROM skills`
	rows, err := db.Pool.Query(ctx, query)
	if err != nil {
		log.Printf("GetAllSkills Query error: %v", err)
		return nil, err
	}
	defer rows.Close()

	var skills []skill.Skill
	for rows.Next() {
		var s skill.Skill
		err := rows.Scan(&s.ID, &s.Name, &s.CategoryID)
		if err != nil {
			log.Printf("GetAllSkills Scan error: %v", err)
			return nil, err
		}
		skills = append(skills, s)
	}
	return skills, nil
}

func GetAllCategories(ctx context.Context) ([]skill.Category, error) {
	query := `SELECT id, name FROM category`
	rows, err := db.Pool.Query(ctx, query)
	if err != nil {
		log.Printf("GetAllCategories Query error: %v", err)
		return nil, err
	}
	defer rows.Close()

	var categories []skill.Category
	for rows.Next() {
		var c skill.Category
		err := rows.Scan(&c.ID, &c.Name)
		if err != nil {
			log.Printf("GetAllCategories Scan error: %v", err)
			return nil, err
		}
		categories = append(categories, c)
	}
	return categories, nil
}
