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
	flags := []string{"lie", "cheat", "discriminat", "plagiar", "harass", "bypass policy"}
	for _, flag := range flags {
		if strings.Contains(lower, flag) {
			status = "unethical"
			message = "The answer contains language that may violate ethical communication guidelines."
			break
		}
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
