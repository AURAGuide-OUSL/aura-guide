package service

import (
	"fmt"

	auralifecoach "aura-backend/aura-life-coach-module"
	"aura-backend/aura-life-coach-module/dao"
)

const (
	ProfessionalCommunicationTopic = "Professional Communication"
	BehavioralInterviewTopic       = "Behavioral Interview"
	ReflectionSelfAssessmentTopic  = "Reflection and Self Assessment"
	CodeUnderstandingTopic         = "Code Understanding"
	DebuggingReasoningTopic        = "Debugging Reasoning"
	AlgorithmicThinkingTopic       = "Algorithmic Thinking"
	GitConceptKnowledgeTopic       = "Git Concept Knowledge"
)

func GetQuestions(topic string) auralifecoach.QuestionSet {
	return auralifecoach.QuestionSet{Topic: topic, Questions: dao.GetQuestions(topic)}
}

func GetBehavioralInterviewFeedback() auralifecoach.FeedbackResponse {
	return auralifecoach.FeedbackResponse{Topic: BehavioralInterviewTopic, Feedback: dao.GetBehavioralInterviewFeedback()}
}

func UploadCV(email string, req auralifecoach.CVUploadRequest) (*auralifecoach.CVUploadResponse, error) {
	if req.FileName == "" || req.Content == "" {
		return nil, fmt.Errorf("file_name and content are required")
	}
	return dao.StoreCV(email, req)
}

func AnalyzeCV(email string) (*auralifecoach.CVAnalysisResponse, error) {
	return dao.AnalyzeCV(email)
}

func GetCVFeedback(email string) (*auralifecoach.FeedbackResponse, error) {
	feedback, err := dao.GetCVFeedback(email)
	if err != nil {
		return nil, err
	}
	return &auralifecoach.FeedbackResponse{Topic: "CV Feedback", Feedback: feedback}, nil
}
