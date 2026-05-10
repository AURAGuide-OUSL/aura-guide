package service

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"strings"

	auralifecoach "aura-backend/aura-life-coach-module"
	"aura-backend/aura-life-coach-module/dao"
	"aura-backend/common/agentclient"
	"aura-backend/common/middleware"
	"aura-backend/common/pdfutil"
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

func GetCVFeedback(ctx context.Context, email string) (*auralifecoach.FeedbackResponse, error) {
	row, err := dao.GetCVAnalysisRow(ctx, email)
	if err != nil {
		return nil, err
	}
	if row == nil || (len(row.Strengths) == 0 && len(row.Weaknesses) == 0 && len(row.Improvements) == 0 && row.FileName == "") {
		return &auralifecoach.FeedbackResponse{
			Topic:    "CV Feedback",
			Feedback: []string{"Upload a PDF from AI Coach to see strengths and growth areas."},
		}, nil
	}

	var fb []string
	for _, s := range row.Strengths {
		fb = append(fb, s)
	}
	for _, s := range row.Weaknesses {
		fb = append(fb, s)
	}
	return &auralifecoach.FeedbackResponse{
		Topic:        "CV Feedback",
		Feedback:     fb,
		Strengths:    row.Strengths,
		Weaknesses:   row.Weaknesses,
		Improvements: row.Improvements,
	}, nil
}

func ListCVs(ctx context.Context, email string) ([]auralifecoach.CVMeta, error) {
	return dao.ListCVAnalysisMeta(ctx, email)
}

func jwtForAgentForwarding(ctx context.Context, r *http.Request) string {
	if t := middleware.RawJWT(ctx); t != "" {
		return t
	}
	ah := strings.TrimSpace(r.Header.Get("Authorization"))
	if len(ah) >= 7 && strings.EqualFold(ah[:7], "Bearer ") {
		return strings.TrimSpace(ah[7:])
	}
	if c, err := r.Cookie("token"); err == nil && c.Value != "" {
		return strings.TrimSpace(c.Value)
	}
	return ""
}

func sniffPDFMagic(data []byte) bool {
	if len(data) < 4 {
		return false
	}
	d := data
	if len(d) >= 3 && d[0] == 0xEF && d[1] == 0xBB && d[2] == 0xBF {
		d = d[3:]
	}
	if len(d) >= 4 && bytes.Equal(d[:4], []byte("%PDF")) {
		return true
	}
	head := min(4096, len(d))
	return bytes.Contains(d[:head], []byte("%PDF"))
}

// readPdfFromMultipart finds the first PDF part in the request (any field name; tolerates empty filenames).
func readPdfFromMultipart(r *http.Request) ([]byte, string, error) {
	const maxMemory = int64(64 << 20)
	const maxFile = int64(35 << 20)
	if err := r.ParseMultipartForm(maxMemory); err != nil {
		return nil, "", fmt.Errorf("multipart invalid (use multipart/form-data with a file part): %w", err)
	}
	if r.MultipartForm == nil || len(r.MultipartForm.File) == 0 {
		return nil, "", fmt.Errorf("no file part in upload — send the PDF as form field \"file\"")
	}
	for _, fhs := range r.MultipartForm.File {
		for _, fh := range fhs {
			if fh == nil {
				continue
			}
			part, err := fh.Open()
			if err != nil {
				continue
			}
			data, err := io.ReadAll(io.LimitReader(part, maxFile))
			_ = part.Close()
			if err != nil || len(data) == 0 {
				continue
			}
			if !sniffPDFMagic(data) {
				continue
			}
			name := strings.TrimSpace(fh.Filename)
			if name == "" || !strings.HasSuffix(strings.ToLower(name), ".pdf") {
				name = "upload.pdf"
			}
			return data, name, nil
		}
	}
	return nil, "", fmt.Errorf("no valid PDF found — upload a single .pdf file")
}

func fallbackCVPlainText(fileName string, parseErr error) string {
	msg := "[Could not extract readable text from this PDF on the server."
	if parseErr != nil {
		msg += fmt.Sprintf(" Parse detail: %s.", strings.TrimSpace(parseErr.Error()))
	}
	msg += fmt.Sprintf(
		"] File: %s. Infer likely sections (education, projects, skills, experience) and still return strengths, weaknesses, improvements as JSON based on a typical software engineering undergraduate CV.",
		strings.TrimSpace(fileName),
	)
	return msg
}

// AnalyzeCVPDF extracts text locally, then asks the FastAPI agent + Ollama to analyze and persist to user_cv_analysis.
func AnalyzeCVPDF(ctx context.Context, r *http.Request) (*agentclient.CVAnalyzeResponse, error) {
	data, fn, err := readPdfFromMultipart(r)
	if err != nil {
		return nil, err
	}

	token := jwtForAgentForwarding(ctx, r)
	if token == "" {
		return nil, fmt.Errorf("authorization required")
	}

	text, err := pdfutil.PlainText(data, 15<<20)
	if err != nil || strings.TrimSpace(text) == "" {
		text = fallbackCVPlainText(fn, err)
	}

	return agentclient.PostCVAnalyze(ctx, token, agentclient.CVAnalyzeRequest{
		CVText:   text,
		FileName: fn,
	})
}
