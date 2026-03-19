package api

import (
	"encoding/json"
	"net/http"
	"time"

	"aura-backend/auth-module/service"
)

type AuthRequest struct {
	Email          string `json:"email"`
	Password       string `json:"password"`
	FirstName      string `json:"first_name"`
	LastName       string `json:"last_name"`
	DegreeProgram  string `json:"degree_program"`
	University     string `json:"university"`
	GoalID         int    `json:"goal_id"`
	StudyYear      int    `json:"study_year"`
}

func RegisterHandlers(mux http.Handler) {
	// Handlers are usually registered in main, but we can provide helpers
}

func SignupHandler(w http.ResponseWriter, r *http.Request) {
	var req AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if err := service.Signup(r.Context(), req.Email, req.Password, req.FirstName, req.LastName, req.DegreeProgram, req.University, req.GoalID, req.StudyYear); err != nil {
		http.Error(w, "Error creating user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "User created successfully"})
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var req AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	token, err := service.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    token,
		Expires:  time.Now().Add(24 * time.Hour),
		HttpOnly: true,
		Secure:   true, // Should be true in production
		Path:     "/",
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"token": token, "message": "Login successful"})
}
