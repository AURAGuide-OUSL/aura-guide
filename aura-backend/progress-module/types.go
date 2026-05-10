package progress

import "time"

type Task struct {
	ID            int        `json:"id"`
	Task          string     `json:"task"`
	Status        string     `json:"status"`
	StartDateTime *time.Time `json:"start_date_time,omitempty"`
	EndDateTime   *time.Time `json:"end_date_time,omitempty"`
}

type Overview struct {
	TotalTasks     int `json:"total_tasks"`
	CompletedTasks int `json:"completed_tasks"`
	PendingTasks   int `json:"pending_tasks"`
}

type DashboardSummary struct {
	FirstName           string `json:"first_name"`
	LastName            string `json:"last_name"`
	CurrentScore        int    `json:"current_score"`
	SkillAverage        float64 `json:"skill_average"`
	SkillReadinessLabel string `json:"skill_readiness_label"`
	DayStreak           int    `json:"day_streak"`
	CareerTitle         string `json:"career_title"`
	TodaysPlan          []Task `json:"todays_plan"`
	OngoingTasks        []Task `json:"ongoing_tasks"`
	CompletedTasks      int    `json:"completed_tasks"`
}
