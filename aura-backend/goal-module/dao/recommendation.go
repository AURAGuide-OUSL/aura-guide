package dao

import (
	"context"
	"fmt"
	"strings"

	"aura-backend/common/db"
)

func isIndustryReady(label string, avg float64) bool {
	if avg >= 2.5 {
		return true
	}
	l := strings.ToLower(strings.TrimSpace(label))
	return strings.Contains(l, "industry")
}

type goalFit struct {
	ID   int
	Name string
	Met  int
	Total int
}

func bestGoalFit(ctx context.Context, userID int) (*goalFit, error) {
	rows, err := db.Pool.Query(ctx, `
SELECT g.id, g.name,
  COUNT(*)::int AS total,
  COUNT(*) FILTER (WHERE COALESCE(us.avg_score, 0) >= gsm.score_id::float8)::int AS met
FROM goals g
JOIN goal_skill_matrix gsm ON gsm.goal_id = g.id
LEFT JOIN LATERAL (
  SELECT AVG(us2.score_id::double precision) AS avg_score
  FROM user_skills us2
  WHERE us2.user_id = $1 AND us2.skill_id = gsm.skill_id
) us ON true
GROUP BY g.id, g.name
ORDER BY met DESC, total DESC, g.id ASC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var best *goalFit
	for rows.Next() {
		var g goalFit
		if err := rows.Scan(&g.ID, &g.Name, &g.Total, &g.Met); err != nil {
			return nil, err
		}
		if best == nil || g.Met > best.Met || (g.Met == best.Met && g.Total > best.Total) {
			copy := g
			best = &copy
		}
	}
	return best, rows.Err()
}

// UpdateCareerRecommendationIfReady writes a career-track recommendation when the user is industry ready.
func UpdateCareerRecommendationIfReady(ctx context.Context, userID int, currentGoalID *int, currentGoalName, readinessLabel string, skillAvg float64) (string, error) {
	if !isIndustryReady(readinessLabel, skillAvg) {
		return "", nil
	}

	best, err := bestGoalFit(ctx, userID)
	if err != nil || best == nil || best.Total == 0 {
		return "", err
	}

	current := strings.TrimSpace(currentGoalName)
	if current == "" && currentGoalID != nil {
		_ = db.Pool.QueryRow(ctx, `SELECT name FROM goals WHERE id = $1`, *currentGoalID).Scan(&current)
	}
	if current == "" {
		current = "your selected track"
	}

	var rec string
	sameTrack := currentGoalID != nil && *currentGoalID == best.ID
	if sameTrack || strings.EqualFold(current, best.Name) {
		rec = fmt.Sprintf(
			"You are industry-ready for %s. Your skill profile meets the requirements for this track (%d of %d competencies at target). Next: refine your portfolio, practice behavioral interviews in AI Coach, and target internships aligned with %s roles in Sri Lanka.",
			best.Name, best.Met, best.Total, best.Name,
		)
	} else {
		rec = fmt.Sprintf(
			"You are industry-ready. Your strongest alignment is with %s (%d of %d skills at target). You selected %s — consider exploring %s roles or doubling down on your current track if that remains your goal.",
			best.Name, best.Met, best.Total, current, best.Name,
		)
	}

	_, err = db.Pool.Exec(ctx, `UPDATE user_student SET recommendation = $1 WHERE id = $2`, rec, userID)
	if err != nil {
		return "", err
	}
	return rec, nil
}
