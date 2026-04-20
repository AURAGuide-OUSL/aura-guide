package auralifecoach

import "time"

type QuestionSet struct {
	Topic     string   `json:"topic"`
	Questions []string `json:"questions"`
}

type FeedbackResponse struct {
	Topic    string   `json:"topic"`
	Feedback []string `json:"feedback"`
}

type CVUploadRequest struct {
	FileName string `json:"file_name"`
	Content  string `json:"content"`
}

type CVUploadResponse struct {
	Message    string    `json:"message"`
	FileName   string    `json:"file_name"`
	UploadedAt time.Time `json:"uploaded_at"`
}

type CVAnalysisResponse struct {
	Score        int      `json:"score"`
	Summary      string   `json:"summary"`
	Strengths    []string `json:"strengths"`
	Improvements []string `json:"improvements"`
}
