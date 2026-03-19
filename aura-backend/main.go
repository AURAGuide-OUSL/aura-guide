package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
)

// UserStudent model matches the user_student table
type UserStudent struct {
	ID            int     `json:"id"`
	GoalID        int     `json:"goal_id"`
	Email         string  `json:"email"`
	FirstName     string  `json:"first_name"`
	LastName      string  `json:"last_name"`
	DegreeProgram string  `json:"degree_program"`
	StudyYear     int     `json:"study_year"`
	University    string  `json:"university"`
	CurrentScore  int     `json:"current_score"`
	Recommendation *string `json:"recommendation"`
}

var dbPool *pgxpool.Pool

func main() {
	// Database connection string
	// Format: postgres://username:password@localhost:5432/database_namedd
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5432/aura"
	}

	var err error
	dbPool, err = pgxpool.New(context.Background(), dbURL)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to database: %v\n", err)
		os.Exit(1)
	}
	defer dbPool.Close()

	// Initialize Router
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Routes
	r.Get("/user", getUser)

	// Start Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server starting on port %s...\n", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}

func getUser(w http.ResponseWriter, r *http.Request) {
	email := r.URL.Query().Get("email")
	if email == "" {
		http.Error(w, "Email query parameter is required", http.StatusBadRequest)
		return
	}

	var user UserStudent
	query := `SELECT id, goal_id, email, first_name, last_name, degree_program, study_year, university, current_score, recommendation 
	          FROM user_student WHERE email = $1`

	err := dbPool.QueryRow(context.Background(), query, email).Scan(
		&user.ID, &user.GoalID, &user.Email, &user.FirstName, &user.LastName,
		&user.DegreeProgram, &user.StudyYear, &user.University, &user.CurrentScore, &user.Recommendation,
	)

	if err != nil {
		log.Printf("Query error: %v", err)
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}
