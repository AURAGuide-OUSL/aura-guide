package agentclient

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

// BaseURL is the FastAPI AI agent (Ollama bridge). Override with AI_AGENT_URL.
func BaseURL() string {
	u := strings.TrimSpace(os.Getenv("AI_AGENT_URL"))
	if u == "" {
		return "http://127.0.0.1:8001"
	}
	return strings.TrimRight(u, "/")
}

type CVAnalyzeRequest struct {
	CVText    string `json:"cv_text"`
	FileName  string `json:"file_name"`
	SessionID *int   `json:"session_id,omitempty"`
}

type CVAnalyzeResponse struct {
	Strengths    []string `json:"strengths"`
	Weaknesses   []string `json:"weaknesses"`
	Improvements []string `json:"improvements"`
	ChatSummary  string   `json:"chat_summary,omitempty"`
}

// PostCVAnalyze forwards extracted PDF text to the Python agent using the user's JWT.
func PostCVAnalyze(ctx context.Context, jwt string, reqBody CVAnalyzeRequest) (*CVAnalyzeResponse, error) {
	body, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, BaseURL()+"/agent/cv-analyze", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+strings.TrimPrefix(jwt, "Bearer "))

	client := &http.Client{Timeout: 180 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(resp.Body)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		msg := sanitizeAgentError(string(bytes.TrimSpace(raw)))
		return nil, fmt.Errorf("agent %s: %s", resp.Status, msg)
	}

	var out CVAnalyzeResponse
	if err := json.Unmarshal(raw, &out); err != nil {
		return nil, fmt.Errorf("decode agent response: %w", err)
	}
	return &out, nil
}

func sanitizeAgentError(body string) string {
	trim := strings.TrimSpace(body)
	if trim == "" {
		return "empty response from AI agent"
	}
	lower := strings.ToLower(trim)
	if strings.HasPrefix(lower, "<!doctype") || strings.HasPrefix(lower, "<html") {
		return "AI agent URL misconfigured (received an HTML page instead of JSON). Set AI_AGENT_URL to the FastAPI service (e.g. http://127.0.0.1:8001)."
	}
	if len(trim) > 400 {
		return trim[:400] + "…"
	}
	return trim
}
