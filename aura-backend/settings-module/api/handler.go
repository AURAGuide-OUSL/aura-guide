package api

import (
	"encoding/json"
	"net/http"

	"aura-backend/common/middleware"
	settings "aura-backend/settings-module"
	"aura-backend/settings-module/service"
)

func UpdatePreferencesHandler(w http.ResponseWriter, r *http.Request) {
	email, ok := r.Context().Value(middleware.UserEmailKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req settings.Preferences
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	service.UpdatePreferences(email, req)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(settings.SettingsResponse{Message: "User preferences updated successfully"})
}

func UpdateNotificationPreferencesHandler(w http.ResponseWriter, r *http.Request) {
	email, ok := r.Context().Value(middleware.UserEmailKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req settings.NotificationPreferences
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	service.UpdateNotificationPreferences(email, req)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(settings.SettingsResponse{Message: "Notification preferences updated successfully"})
}
