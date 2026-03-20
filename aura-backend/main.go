package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"aura-backend/common/db"
	"aura-backend/common/middleware"
	authApi "aura-backend/auth-module/api"
	userApi "aura-backend/user-module/api"
	skillApi "aura-backend/skill-module/api"
	goalApi "aura-backend/goal-module/api"

	"github.com/go-chi/chi/v5"
	mid "github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Initialize Database
	if err := db.InitDB(); err != nil {
		log.Fatalf("Database initialization failed: %v", err)
	}
	defer db.CloseDB()

	// Initialize Router
	r := chi.NewRouter()

	// CORS Setup
	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	c := cors.New(cors.Options{
		AllowedOrigins:   strings.Split(allowedOrigins, ","),
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		AllowCredentials: true,
		MaxAge:           300,
	})
	r.Use(c.Handler)

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
