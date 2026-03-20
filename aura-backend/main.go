package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"aura-backend/common/db"
	"aura-backend/common/middleware"
	authApi "aura-backend/auth-module/api"
	userApi "aura-backend/user-module/api"
	skillApi "aura-backend/skill-module/api"
	goalApi "aura-backend/goal-module/api"

	"github.com/go-chi/chi/v5"
	mid "github.com/go-chi/chi/v5/middleware"
)

func main() {
	// Initialize Database
	if err := db.InitDB(); err != nil {
		log.Fatalf("Database initialization failed: %v", err)
	}
	defer db.CloseDB()

	// Initialize Router
	r := chi.NewRouter()

	// Global Middleware
	r.Use(mid.Logger)
	r.Use(mid.Recoverer)

	// Auth Routes (Public)
	r.Post("/signup", authApi.SignupHandler)
	r.Post("/login", authApi.LoginHandler)

	// Protected Routes (User Module)
	r.Group(func(r chi.Router) {
		r.Use(middleware.AuthMiddleware)
		
		r.Get("/user", userApi.GetUserHandler)
		r.Put("/user", userApi.UpdateUserHandler)
		r.Get("/users", userApi.GetAllUsersHandler)
		r.Get("/skills", skillApi.GetSkillsHandler)
		r.Get("/skill/categories", skillApi.GetCategoriesHandler)
		r.Get("/goals", goalApi.GetGoalsHandler)
	})

	// Start Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("AURA Backend starting on port %s...\n", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
