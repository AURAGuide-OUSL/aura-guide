package skillsmetrics

import (
	"context"
	"math"

	"aura-backend/common/db"
)

// AuraMetrics summarizes user_skills (7 core competencies, score_id 1–3).
type AuraMetrics struct {
	Average         float64 `json:"skill_average"`          // avg of assessed skills only
	Percent         int     `json:"skill_score_percent"`     // average mapped to 0–100 vs max 3
	ReadinessLabel  string  `json:"skill_readiness_label"` // Beginner / Developing / Industry-ready band
	AssessedSkills  int     `json:"assessed_skills"`       // how many skill rows exist
	MaxSkills       int     `json:"-"`
}

func ForUser(ctx context.Context, userID int) (AuraMetrics, error) {
	var avg *float64
	var cnt int
	err := db.Pool.QueryRow(ctx, `
SELECT AVG(us.score_id::double precision)::float8,
       COUNT(us.score_id)::int
FROM user_skills us
WHERE us.user_id = $1
  AND us.skill_id IN (SELECT id FROM skills WHERE name IN (
    'Professional Communication',
    'Behavioral Interview Skills',
    'Reflection and Self Assessment',
    'Code Understanding',
    'Debugging Reasoning',
    'Algorithmic Thinking',
    'Git Concept Knowledge'
  ))`,
		userID,
	).Scan(&avg, &cnt)
	if err != nil {
		return AuraMetrics{}, err
	}

	m := AuraMetrics{MaxSkills: 7}
	if avg == nil || cnt == 0 {
		m.ReadinessLabel = "Not assessed yet"
		m.Percent = 0
		m.Average = 0
		m.AssessedSkills = 0
		return m, nil
	}

	m.AssessedSkills = cnt
	m.Average = math.Round((*avg)*100) / 100
	m.Percent = int(math.Round((*avg / 3.0) * 100))
	if m.Percent < 0 {
		m.Percent = 0
	}
	if m.Percent > 100 {
		m.Percent = 100
	}
	m.ReadinessLabel = readinessFromAverage(*avg)
	return m, nil
}

func readinessFromAverage(avg float64) string {
	if avg < 1.7 {
		return "Beginner"
	}
	if avg < 2.5 {
		return "Developing"
	}
	return "Industry ready"
}
