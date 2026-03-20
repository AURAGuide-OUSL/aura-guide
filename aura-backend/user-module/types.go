package user

type UserStudent struct {
	ID            int     `json:"id"`
	GoalID        *int    `json:"goal_id"`
	Email         string  `json:"email"`
	FirstName     *string `json:"first_name"`
	LastName      *string `json:"last_name"`
	DegreeProgram *string `json:"degree_program"`
	StudyYear     *int    `json:"study_year"`
	University    *string `json:"university"`
	CurrentScore  *int    `json:"current_score"`
	Recommendation *string `json:"recommendation"`
}
