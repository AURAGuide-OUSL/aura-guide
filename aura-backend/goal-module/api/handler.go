package api

import (
	"encoding/json"
	"net/http"

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
