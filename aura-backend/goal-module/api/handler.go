package api

import (
	"encoding/json"
	"net/http"

	"aura-backend/common/middleware"
	"aura-backend/goal-module/service"
)

func GetGoalsHandler(w http.ResponseWriter, r *http.Request) {
	goals, err := service.GetGoals(r.Context())
	if err != nil {
		http.Error(w, "Error fetching goals", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(goals)
}

func GetGoalSummaryHandler(w http.ResponseWriter, r *http.Request) {
	email, ok := r.Context().Value(middleware.UserEmailKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	summary, err := service.GetGoalSummary(r.Context(), email)
	if err != nil {
		http.Error(w, "Error fetching goal summary", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(summary)
}
