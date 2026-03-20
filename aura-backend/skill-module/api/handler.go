package api

import (
	"encoding/json"
	"net/http"

	"aura-backend/skill-module/service"
)

func GetSkillsHandler(w http.ResponseWriter, r *http.Request) {
	skills, err := service.GetSkills(r.Context())
	if err != nil {
		http.Error(w, "Error fetching skills", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(skills)
}

func GetCategoriesHandler(w http.ResponseWriter, r *http.Request) {
	categories, err := service.GetCategories(r.Context())
	if err != nil {
		http.Error(w, "Error fetching categories", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(categories)
}
