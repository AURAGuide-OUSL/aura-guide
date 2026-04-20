package onboarding

type Request struct {
	FirstName      *string `json:"first_name"`
	LastName       *string `json:"last_name"`
	DegreeProgram  *string `json:"degree_program"`
	StudyYear      *int    `json:"study_year"`
	University     *string `json:"university"`
	GoalID         *int    `json:"goal_id"`
	CurrentScore   *int    `json:"current_score"`
	Recommendation *string `json:"recommendation"`
}
