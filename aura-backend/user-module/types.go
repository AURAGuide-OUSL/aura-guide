package user

type UserStudent struct {
	ID                  int      `json:"id"`
	GoalID              *int     `json:"goal_id"`
	Email               string   `json:"email"`
	FirstName           *string  `json:"first_name"`
	LastName            *string  `json:"last_name"`
	DegreeProgram       *string  `json:"degree_program"`
	StudyYear           *int     `json:"study_year"`
	University          *string  `json:"university"`
	TechnicalSkill      *string  `json:"technical_skill_level"`
	SoftSkill           *string  `json:"soft_skill_level"`
	Availability        *string  `json:"availability_type"`
	AvailabilityH       *int     `json:"availability_hours"`
	CurrentScore        *int     `json:"current_score"`
	SkillScorePercent   *int     `json:"skill_score_percent,omitempty"`
	SkillAverage        *float64 `json:"skill_average,omitempty"`
	SkillReadinessLabel *string  `json:"skill_readiness_label,omitempty"`
	Recommendation      *string  `json:"recommendation"`
}
