package api

import (
	"encoding/json"
	"net/http"
	"strings"

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

	feedback, err := service.GetCVFeedback(r.Context(), email)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(feedback)
}

func ListCVsHandler(w http.ResponseWriter, r *http.Request) {
	email, ok := r.Context().Value(middleware.UserEmailKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	items, err := service.ListCVs(r.Context(), email)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

func UploadCVPDFHandler(w http.ResponseWriter, r *http.Request) {
	_, ok := r.Context().Value(middleware.UserEmailKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	if !strings.EqualFold(r.Method, http.MethodPost) {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	res, err := service.AnalyzeCVPDF(r.Context(), r)
	if err != nil {
		msg := err.Error()
		code := http.StatusBadRequest
		if strings.Contains(strings.ToLower(msg), "agent") {
			code = http.StatusBadGateway
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(code)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": msg})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

func DownloadCVHandler(w http.ResponseWriter, r *http.Request) {
	email, ok := r.Context().Value(middleware.UserEmailKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	if err := service.ServeCVPDF(r.Context(), email, w, r); err != nil {
		code := http.StatusNotFound
		if strings.Contains(strings.ToLower(err.Error()), "unauthorized") {
			code = http.StatusUnauthorized
		}
		http.Error(w, err.Error(), code)
	}
}

func writeQuestions(w http.ResponseWriter, r *http.Request, topic string) {
	questions := service.GetQuestions(topic)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(questions)
}
