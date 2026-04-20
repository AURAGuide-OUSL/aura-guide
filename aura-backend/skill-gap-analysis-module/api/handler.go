package api

import (
	"encoding/json"
	"net/http"

	"aura-backend/common/middleware"
	"aura-backend/skill-gap-analysis-module/service"
)

func GetSkillLevelsHandler(w http.ResponseWriter, r *http.Request) {
	email, ok := r.Context().Value(middleware.UserEmailKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	levels, err := service.GetSkillLevels(r.Context(), email)
	if err != nil {
		http.Error(w, "Error fetching skill levels", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(levels)
}

func GetSkillGapHandler(w http.ResponseWriter, r *http.Request) {
	email, ok := r.Context().Value(middleware.UserEmailKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	levels, err := service.GetSkillGap(r.Context(), email)
	if err != nil {
		http.Error(w, "Error fetching skill gaps", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(levels)
}
