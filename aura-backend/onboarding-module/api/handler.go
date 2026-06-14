package api

import (
	"encoding/json"
	"net/http"

	"aura-backend/common/middleware"
	onboarding "aura-backend/onboarding-module"
	"aura-backend/onboarding-module/service"

	"github.com/go-chi/chi/v5"
)

func UpdateOnboardingHandler(w http.ResponseWriter, r *http.Request) {
	authEmail, ok := r.Context().Value(middleware.UserEmailKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	requestedUser := chi.URLParam(r, "userData")
	if requestedUser != "" && requestedUser != "me" && requestedUser != authEmail {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	var req onboarding.Request
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if err := service.UpdateOnboarding(r.Context(), authEmail, req); err != nil {
		http.Error(w, "Error updating onboarding", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Onboarding updated successfully"})
}
