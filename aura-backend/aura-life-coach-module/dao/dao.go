package dao

import (
	"fmt"
	"strings"
	"sync"
	"time"

	auralifecoach "aura-backend/aura-life-coach-module"
)

type storedCV struct {
	FileName string
	Content  string
	Uploaded time.Time
	Analysis *auralifecoach.CVAnalysisResponse
}

var (
	questionBank = map[string][]string{
		"Professional Communication": {
			"Describe a time you had to explain a technical concept to a non-technical stakeholder.",
			"How do you keep status updates concise but informative during a project?",
			"What would you say if you disagreed with a teammate's implementation approach?",
		},
		"Behavioral Interview": {
			"Tell me about a time you overcame a difficult deadline.",
			"Share an example of receiving critical feedback and how you responded.",
			"Describe a project where collaboration directly improved the outcome.",
		},
		"Reflection and Self Assessment": {
			"What recent learning experience most changed how you work?",
			"Which habit is currently slowing your growth and how will you improve it?",
			"What evidence shows that your communication skills are improving?",
		},
		"Code Understanding": {
			"How would you trace a request through an unfamiliar codebase?",
			"What clues help you understand the responsibilities of a module?",
			"How do you summarize a complex function after reading it once?",
		},
		"Debugging Reasoning": {
			"What is the first hypothesis you form when a feature regresses unexpectedly?",
			"How do you isolate whether an issue is caused by data, logic, or environment?",
			"Describe a debugging workflow that prevents random trial-and-error changes.",
		},
		"Algorithmic Thinking": {
			"How do you compare two possible algorithms for the same problem?",
			"What steps do you use to break a large problem into smaller operations?",
			"When is a simpler but slightly slower solution the better engineering choice?",
		},
		"Git Concept Knowledge": {
			"What problem does rebasing solve compared with merging?",
			"How would you recover when a commit was made to the wrong branch?",
			"Why are small, focused commits easier to review and maintain?",
		},
	}
	behavioralFeedback = []string{
		"Use the STAR structure so your answer has a clear beginning, middle, and outcome.",
		"Quantify impact where possible, especially when describing ownership and outcomes.",
		"End with what you learned so the interviewer sees growth, not just activity.",
	}
	cvStoreMu sync.RWMutex
	cvStore   = map[string]storedCV{}
)

func GetQuestions(topic string) []string {
	return questionBank[topic]
}

func GetBehavioralInterviewFeedback() []string {
	return behavioralFeedback
}

func StoreCV(email string, req auralifecoach.CVUploadRequest) (*auralifecoach.CVUploadResponse, error) {
	now := time.Now().UTC()
	cvStoreMu.Lock()
	cvStore[email] = storedCV{FileName: req.FileName, Content: req.Content, Uploaded: now}
	cvStoreMu.Unlock()

	return &auralifecoach.CVUploadResponse{Message: "CV uploaded successfully", FileName: req.FileName, UploadedAt: now}, nil
}

func AnalyzeCV(email string) (*auralifecoach.CVAnalysisResponse, error) {
	cvStoreMu.Lock()
	defer cvStoreMu.Unlock()

	stored, ok := cvStore[email]
	if !ok {
		return nil, fmt.Errorf("upload a CV before requesting analysis")
	}

	content := strings.ToLower(stored.Content)
	score := 55
	strengths := []string{}
	improvements := []string{}

	if strings.Contains(content, "project") {
		score += 10
		strengths = append(strengths, "Highlights project experience")
	} else {
		improvements = append(improvements, "Add at least one concrete project with impact")
	}
	if strings.Contains(content, "github") || strings.Contains(content, "portfolio") {
		score += 10
		strengths = append(strengths, "Includes supporting links for deeper review")
	} else {
		improvements = append(improvements, "Include GitHub or portfolio links to showcase work")
	}
	if strings.Contains(content, "%") || strings.Contains(content, "improved") || strings.Contains(content, "reduced") {
		score += 10
		strengths = append(strengths, "Uses impact-oriented language")
	} else {
		improvements = append(improvements, "Use measurable outcomes to strengthen accomplishment bullets")
	}
	if strings.Contains(content, "lead") || strings.Contains(content, "collaborat") {
		score += 5
		strengths = append(strengths, "Shows teamwork and leadership signals")
	}

	if len(strengths) == 0 {
		strengths = append(strengths, "The CV provides baseline academic or technical information")
	}
	if len(improvements) == 0 {
		improvements = append(improvements, "Tailor the summary and projects for the target role before applying")
	}

	analysis := &auralifecoach.CVAnalysisResponse{
		Score:        score,
		Summary:      "CV analysis completed using structure, impact, and evidence-based heuristics.",
		Strengths:    strengths,
		Improvements: improvements,
	}
	stored.Analysis = analysis
	cvStore[email] = stored
	return analysis, nil
}

func GetCVFeedback(email string) ([]string, error) {
	cvStoreMu.RLock()
	stored, ok := cvStore[email]
	cvStoreMu.RUnlock()
	if !ok {
		return nil, fmt.Errorf("upload a CV before requesting feedback")
	}
	if stored.Analysis == nil {
		analysis, err := AnalyzeCV(email)
		if err != nil {
			return nil, err
		}
		return append([]string{"Prioritize the top two improvements before your next application."}, analysis.Improvements...), nil
	}
	return append([]string{"Prioritize the top two improvements before your next application."}, stored.Analysis.Improvements...), nil
}
