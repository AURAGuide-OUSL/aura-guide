package db

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

var Pool *pgxpool.Pool

func InitDB() error {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5432/aura"
	}

	var err error
	Pool, err = pgxpool.New(context.Background(), dbURL)
	if err != nil {
		return fmt.Errorf("unable to connect to database: %v", err)
	}

	// Test connection
	err = Pool.Ping(context.Background())
	if err != nil {
		return fmt.Errorf("unable to ping database: %v", err)
	}

	if err := ensureUserCVAnalysisTable(context.Background()); err != nil {
		log.Printf("user_cv_analysis migration skipped: %v", err)
	}

	// Best-effort seed data. We keep the backend running even if seeding fails,
	// because schema migrations/ownership are handled separately.
	if err := runSeeds(context.Background()); err != nil {
		log.Printf("seed data skipped/failed: %v", err)
	}

	return nil
}

func CloseDB() {
	if Pool != nil {
		Pool.Close()
	}
}

func ensureUserCVAnalysisTable(ctx context.Context) error {
	_, err := Pool.Exec(ctx, `
CREATE TABLE IF NOT EXISTS user_cv_analysis (
   user_id INT PRIMARY KEY REFERENCES user_student(id),
   file_name VARCHAR(512),
   uploaded_at TIMESTAMP WITH TIME ZONE,
   strengths JSONB DEFAULT '[]'::jsonb,
   weaknesses JSONB DEFAULT '[]'::jsonb,
   improvements JSONB DEFAULT '[]'::jsonb
)`)
	return err
}

func runSeeds(ctx context.Context) error {
	// Only seed if common tasks are empty, since that gates task generation.
	var commonCount int
	if err := Pool.QueryRow(ctx, "SELECT COUNT(*) FROM common_tasks").Scan(&commonCount); err != nil {
		return err
	}
	if commonCount > 0 {
		return nil
	}

	// Status
	_ = ensureSingleRowCount(ctx, "status", "pending")

	// Categories
	// (no unique constraints; only insert if empty)
	var categoryCount int
	if err := Pool.QueryRow(ctx, "SELECT COUNT(*) FROM category").Scan(&categoryCount); err == nil && categoryCount == 0 {
		if _, err := Pool.Exec(ctx, `INSERT INTO category (name) VALUES ('Technical'), ('Soft Skills'), ('Academic')`); err != nil {
			return err
		}
	}

	// Skill levels
	var levelCount int
	if err := Pool.QueryRow(ctx, "SELECT COUNT(*) FROM skill_matrix_levels").Scan(&levelCount); err == nil && levelCount == 0 {
		if _, err := Pool.Exec(ctx, `INSERT INTO skill_matrix_levels (score_id, level)
			VALUES (1, 'Low / Beginner'), (2, 'Moderate / Developing'), (3, 'Strong / Industry-Ready')`); err != nil {
			return err
		}
	}

	// Goals
	// Ensure goal tracks exist even if some rows already exist.
	for _, name := range []string{"Software Engineer", "Backend Developer", "QA Engineer", "DevOps Engineer"} {
		if _, err := Pool.Exec(ctx, `INSERT INTO goals (name)
			SELECT $1 WHERE NOT EXISTS (SELECT 1 FROM goals WHERE name = $1)`, name); err != nil {
			return err
		}
	}

	// Skills
	var skillsCount int
	if err := Pool.QueryRow(ctx, "SELECT COUNT(*) FROM skills").Scan(&skillsCount); err == nil && skillsCount == 0 {
		// Technical
		tech := []string{"Code Understanding", "Debugging Reasoning", "Algorithmic Thinking", "Git Concept Knowledge"}
		for _, name := range tech {
			if _, err := Pool.Exec(ctx, `INSERT INTO skills (name, category_id)
				SELECT $1, c.id FROM category c WHERE c.name='Technical' AND NOT EXISTS (SELECT 1 FROM skills s WHERE s.name=$1)`, name); err != nil {
				return err
			}
		}
		// Soft
		soft := []string{"Professional Communication", "Behavioral Interview Skills", "Reflection and Self Assessment"}
		for _, name := range soft {
			if _, err := Pool.Exec(ctx, `INSERT INTO skills (name, category_id)
				SELECT $1, c.id FROM category c WHERE c.name='Soft Skills' AND NOT EXISTS (SELECT 1 FROM skills s WHERE s.name=$1)`, name); err != nil {
				return err
			}
		}
	}

	// Common tasks (1 per skill, sufficient for planner)
	if _, err := Pool.Exec(ctx, `INSERT INTO common_tasks (skill_id, task)
		SELECT s.id, t.task
		FROM (VALUES
			('Code Understanding', 'Read and summarize a module in your project'),
			('Debugging Reasoning', 'Reproduce a bug and write a step-by-step diagnosis plan'),
			('Algorithmic Thinking', 'Solve a DP problem and explain the recurrence'),
			('Git Concept Knowledge', 'Use branches and split commits into small reviewable units'),
			('Professional Communication', 'Write a short weekly status update for your team'),
			('Behavioral Interview Skills', 'Draft a STAR answer for a teamwork scenario'),
			('Reflection and Self Assessment', 'Reflect on what slowed you down and set one habit change')
		) AS t(skill_name, task)
		JOIN skills s ON s.name = t.skill_name
		WHERE NOT EXISTS (
			SELECT 1 FROM common_tasks ct WHERE ct.skill_id = s.id AND ct.task = t.task
		)`); err != nil {
		return err
	}

	// Goal-skill mapping: map all goal tracks to all skills with score_id=1
	var gsmCount int
	if err := Pool.QueryRow(ctx, "SELECT COUNT(*) FROM goal_skill_matrix").Scan(&gsmCount); err != nil {
		return err
	}
	if gsmCount == 0 {
		if _, err := Pool.Exec(ctx, `INSERT INTO goal_skill_matrix (goal_id, skill_id, score_id)
			SELECT g.id, s.id, 1
			FROM goals g
			JOIN skills s ON TRUE
			WHERE NOT EXISTS (
				SELECT 1 FROM goal_skill_matrix gsm WHERE gsm.goal_id=g.id AND gsm.skill_id=s.id
			);`); err != nil {
			return err
		}
	}

	return nil
}

func ensureSingleRowCount(ctx context.Context, table string, name string) error {
	// Helper for status insertion; best-effort.
	var count int
	if err := Pool.QueryRow(ctx, fmt.Sprintf("SELECT COUNT(*) FROM %s WHERE name=$1", table), name).Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	_, err := Pool.Exec(ctx, fmt.Sprintf("INSERT INTO %s (name) VALUES ($1)", table), name)
	return err
}
