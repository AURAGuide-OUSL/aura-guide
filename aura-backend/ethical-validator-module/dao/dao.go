package dao

import (
	"strings"
	"sync"
	"time"

	ethicalvalidator "aura-backend/ethical-validator-module"
)

var (
	validationMu sync.RWMutex
	validations  = map[string]ethicalvalidator.ValidationStatus{}
)

func ValidateAnswer(email, answer string) ethicalvalidator.ValidationStatus {
	status := "ethical"
	message := "The answer passed the ethical validation checks."
	lower := strings.ToLower(answer)
	flags := []string{
		"lie", "cheat", "discriminat", "plagiar", "harass", "bypass policy",
		"chatgpt wrote", "copy pasted", "fake experience", "fabricated", "made up story",
	}
	for _, flag := range flags {
		if strings.Contains(lower, flag) {
			status = "unethical"
			message = "Please answer in your own words with honest, original examples. Avoid copied, AI-generated, or misleading content."
			break
		}
	}

	trimmed := strings.TrimSpace(answer)
	if len(trimmed) > 40 && (strings.Count(trimmed, "\n") > 8 || strings.Count(trimmed, "•") > 5) {
		status = "unethical"
		message = "Your reply looks like pasted or bulk-generated text. Share one concise, authentic example instead."
	}

	result := ethicalvalidator.ValidationStatus{Status: status, Message: message, CheckedAt: time.Now().UTC()}
	validationMu.Lock()
	validations[email] = result
	validationMu.Unlock()
	return result
}

func GetValidationStatus(email string) ethicalvalidator.ValidationStatus {
	validationMu.RLock()
	status, ok := validations[email]
	validationMu.RUnlock()
	if ok {
		return status
	}
	return ethicalvalidator.ValidationStatus{Status: "unknown", Message: "No answer has been validated yet.", CheckedAt: time.Now().UTC()}
}
