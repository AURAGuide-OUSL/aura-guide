package onboarding

type Request struct {
	FirstName      *string `json:"first_name"`
	LastName       *string `json:"last_name"`
	DegreeProgram  *string `json:"degree_program"`
	StudyYear      *int    `json:"study_year"`
	University     *string `json:"university"`
	TechnicalSkill *string `json:"technical_skill_level"`
	SoftSkill      *string `json:"soft_skill_level"`
	Availability   *string `json:"availability_type"`
	AvailabilityH  *int    `json:"availability_hours"`
	GoalID         *int    `json:"goal_id"`
	CurrentScore   *int    `json:"current_score"`
	Recommendation *string `json:"recommendation"`
}
