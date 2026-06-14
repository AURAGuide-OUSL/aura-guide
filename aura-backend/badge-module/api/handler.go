package api

import (
	"encoding/json"
	"net/http"

	"aura-backend/badge-module/service"
	"aura-backend/common/middleware"
)

func GetEarnedBadgesHandler(w http.ResponseWriter, r *http.Request) {
	email, ok := r.Context().Value(middleware.UserEmailKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	badges, err := service.GetEarnedBadges(r.Context(), email)
	if err != nil {
		http.Error(w, "Error fetching badges", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(badges)
}
