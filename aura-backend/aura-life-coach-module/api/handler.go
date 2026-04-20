package api

import (
	"encoding/json"
	"net/http"

	auralifecoach "aura-backend/aura-life-coach-module"
	"aura-backend/aura-life-coach-module/service"
	"aura-backend/common/middleware"
)

func GetProfessionalCommunicationQuestionsHandler(w http.ResponseWriter, r *http.Request) {
	writeQuestions(w, r, service.ProfessionalCommunicationTopic)
}

func GetBehavioralInterviewQuestionsHandler(w http.ResponseWriter, r *http.Request) {
	writeQuestions(w, r, service.BehavioralInterviewTopic)
}

func GetReflectionSelfAssessmentQuestionsHandler(w http.ResponseWriter, r *http.Request) {
	writeQuestions(w, r, service.ReflectionSelfAssessmentTopic)
}

func GetCodeUnderstandingQuestionsHandler(w http.ResponseWriter, r *http.Request) {
	writeQuestions(w, r, service.CodeUnderstandingTopic)
}

func GetDebuggingReasoningQuestionsHandler(w http.ResponseWriter, r *http.Request) {
	writeQuestions(w, r, service.DebuggingReasoningTopic)
}

func GetAlgorithmicThinkingQuestionsHandler(w http.ResponseWriter, r *http.Request) {
	writeQuestions(w, r, service.AlgorithmicThinkingTopic)
}

func GetGitConceptKnowledgeQuestionsHandler(w http.ResponseWriter, r *http.Request) {
	writeQuestions(w, r, service.GitConceptKnowledgeTopic)
}

func GetBehavioralInterviewFeedbackHandler(w http.ResponseWriter, r *http.Request) {
	feedback := service.GetBehavioralInterviewFeedback()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(feedback)
}

func UploadCVHandler(w http.ResponseWriter, r *http.Request) {
	email, ok := r.Context().Value(middleware.UserEmailKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req auralifecoach.CVUploadRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	response, err := service.UploadCV(email, req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func AnalyzeCVHandler(w http.ResponseWriter, r *http.Request) {
	email, ok := r.Context().Value(middleware.UserEmailKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	response, err := service.AnalyzeCV(email)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func GetCVFeedbackHandler(w http.ResponseWriter, r *http.Request) {
	email, ok := r.Context().Value(middleware.UserEmailKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	feedback, err := service.GetCVFeedback(email)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(feedback)
}

func writeQuestions(w http.ResponseWriter, r *http.Request, topic string) {
	questions := service.GetQuestions(topic)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(questions)
}
