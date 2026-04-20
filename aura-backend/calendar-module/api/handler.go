package api

import (
	"encoding/json"
	"net/http"

	calendar "aura-backend/calendar-module"
	"aura-backend/calendar-module/service"
	"aura-backend/common/middleware"
)

func GetEventsHandler(w http.ResponseWriter, r *http.Request) {
	email, ok := r.Context().Value(middleware.UserEmailKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	events := service.GetEvents(email)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(events)
}

func AddEventHandler(w http.ResponseWriter, r *http.Request) {
	email, ok := r.Context().Value(middleware.UserEmailKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req calendar.AddEventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	event, err := service.AddEvent(email, req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(event)
}
