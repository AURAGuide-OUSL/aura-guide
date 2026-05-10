package taskplan

import "time"

type CareerPathResponse struct {
	User       string `json:"user"`
	GoalID     *int   `json:"goal_id,omitempty"`
	CareerPath string `json:"career_path"`
}

type SkillScoreResponse struct {
	CurrentScore int     `json:"current_score"`
	SkillLevel   string  `json:"skill_level"`
	SkillAverage float64 `json:"skill_average"`
}

type Task struct {
	ID            int        `json:"id"`
	SkillID       *int       `json:"skill_id,omitempty"`
	SkillName     string     `json:"skill_name,omitempty"`
	IsCustom      bool       `json:"is_custom"`
	TaskOrigin    string     `json:"task_origin"` // "custom" (user_custom_tasks) or "agent" (user_common_tasks)
	Task          string     `json:"task"`
	Status        string     `json:"status"`
	StartDateTime *time.Time `json:"start_date_time,omitempty"`
	EndDateTime   *time.Time `json:"end_date_time,omitempty"`
}

type GeneratePlanResponse struct {
	Message string `json:"message"`
	Tasks   []Task `json:"tasks"`
}

type UpdateTaskRequest struct {
	Task          *string    `json:"task"`
	Status        *string    `json:"status"`
	StartDateTime *time.Time `json:"start_date_time"`
	EndDateTime   *time.Time `json:"end_date_time"`
}

type AddTaskRequest struct {
	Task          string     `json:"task"`
	Status        string     `json:"status"`
	SkillID       *int       `json:"skill_id"`
	StartDateTime *time.Time `json:"start_date_time"`
	EndDateTime   *time.Time `json:"end_date_time"`
}
