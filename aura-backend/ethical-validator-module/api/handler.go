package api

import (
	"encoding/json"
	"net/http"

	"aura-backend/common/middleware"
	ethicalvalidator "aura-backend/ethical-validator-module"
	"aura-backend/ethical-validator-module/service"
)

func ValidateAnswerHandler(w http.ResponseWriter, r *http.Request) {
	email, ok := r.Context().Value(middleware.UserEmailKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req ethicalvalidator.AnswerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	status := service.ValidateAnswer(email, req.Answer)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(status)
}

func GetValidationStatusHandler(w http.ResponseWriter, r *http.Request) {
	email, ok := r.Context().Value(middleware.UserEmailKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	status := service.GetValidationStatus(email)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(status)
}
