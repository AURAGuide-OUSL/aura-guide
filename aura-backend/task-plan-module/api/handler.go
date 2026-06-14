package api

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"aura-backend/common/middleware"
	taskplan "aura-backend/task-plan-module"
	taskdao "aura-backend/task-plan-module/dao"
	"aura-backend/task-plan-module/service"

	"github.com/go-chi/chi/v5"
)

func GetCareerPathHandler(w http.ResponseWriter, r *http.Request) {
	email, ok := r.Context().Value(middleware.UserEmailKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	response, err := service.GetCareerPath(r.Context(), email)
	if err != nil {
		http.Error(w, "Error fetching career path", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func GetSkillScoreHandler(w http.ResponseWriter, r *http.Request) {
	email, ok := r.Context().Value(middleware.UserEmailKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	response, err := service.GetSkillScore(r.Context(), email)
	if err != nil {
		http.Error(w, "Error fetching skill score", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func GeneratePlanHandler(w http.ResponseWriter, r *http.Request) {
	email, ok := r.Context().Value(middleware.UserEmailKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	response, err := service.GeneratePlan(r.Context(), email)
	if err != nil {
		http.Error(w, "Error generating task plan", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func GetTaskPlanHandler(w http.ResponseWriter, r *http.Request) {
	email, ok := r.Context().Value(middleware.UserEmailKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	tasks, err := service.GetTaskPlan(r.Context(), email)
	if err != nil {
		http.Error(w, "Error fetching task plan", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tasks)
}

func UpdateTaskPlanHandler(w http.ResponseWriter, r *http.Request) {
	updateTaskHandler(w, r)
}

func UpdateTaskHandler(w http.ResponseWriter, r *http.Request) {
	updateTaskHandler(w, r)
}

func CompleteTaskHandler(w http.ResponseWriter, r *http.Request) {
	email, ok := r.Context().Value(middleware.UserEmailKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	taskID, err := service.ParseTaskID(chi.URLParam(r, "taskId"))
	if err != nil {
		http.Error(w, "Invalid task id", http.StatusBadRequest)
		return
	}

	if err := service.CompleteTask(r.Context(), email, taskID); err != nil {
		http.Error(w, "Error completing task", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Task marked as completed"})
}

func DeleteTaskHandler(w http.ResponseWriter, r *http.Request) {
	email, ok := r.Context().Value(middleware.UserEmailKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	taskID, err := service.ParseTaskID(chi.URLParam(r, "taskId"))
	if err != nil {
		http.Error(w, "Invalid task id", http.StatusBadRequest)
		return
	}

	if err := service.DeleteTask(r.Context(), email, taskID); err != nil {
		if errors.Is(err, taskdao.ErrTaskNotFound) {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		http.Error(w, "Error deleting task", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Task deleted successfully"})
}

func DeleteAgentTaskHandler(w http.ResponseWriter, r *http.Request) {
	email, ok := r.Context().Value(middleware.UserEmailKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	taskID, err := service.ParseTaskID(chi.URLParam(r, "taskId"))
	if err != nil {
		http.Error(w, "Invalid task id", http.StatusBadRequest)
		return
	}

	if err := service.DeleteAgentTask(r.Context(), email, taskID); err != nil {
		if errors.Is(err, taskdao.ErrTaskNotFound) {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Agent task deleted successfully"})
}

func AddTaskHandler(w http.ResponseWriter, r *http.Request) {
	email, ok := r.Context().Value(middleware.UserEmailKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req taskplan.AddTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	if req.Task == "" {
		http.Error(w, "task is required", http.StatusBadRequest)
		return
	}

	task, err := service.AddTask(r.Context(), email, req)
	if err != nil {
		http.Error(w, "Error creating task", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(task)
}

func GetTasksForDateHandler(w http.ResponseWriter, r *http.Request) {
	email, ok := r.Context().Value(middleware.UserEmailKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	selectedDate, err := time.Parse("2006-01-02", chi.URLParam(r, "today"))
	if err != nil {
		http.Error(w, "Date must be in YYYY-MM-DD format", http.StatusBadRequest)
		return
	}

	tasks, err := service.GetTasksForDate(r.Context(), email, selectedDate)
	if err != nil {
		http.Error(w, "Error fetching daily tasks", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tasks)
}

func updateTaskHandler(w http.ResponseWriter, r *http.Request) {
	email, ok := r.Context().Value(middleware.UserEmailKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	taskID, err := service.ParseTaskID(chi.URLParam(r, "taskId"))
	if err != nil {
		http.Error(w, "Invalid task id", http.StatusBadRequest)
		return
	}

	var req taskplan.UpdateTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if err := service.UpdateTask(r.Context(), email, taskID, req); err != nil {
		http.Error(w, "Error updating task", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Task updated successfully"})
}
