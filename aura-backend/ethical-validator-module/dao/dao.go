package dao

import (
	"regexp"
	"sync"
	"time"

	ethicalvalidator "aura-backend/ethical-validator-module"
)

var (
	validationMu sync.RWMutex
	validations  = map[string]ethicalvalidator.ValidationStatus{}
)

// Whole-word / phrase patterns only — avoids false positives like "lying" in "applying".
var ethicalPatterns = []*regexp.Regexp{
	regexp.MustCompile(`(?i)\blies\b`),
	regexp.MustCompile(`(?i)\blie\b`),
	regexp.MustCompile(`(?i)\blied\b`),
	regexp.MustCompile(`(?i)\blying\b`),
	regexp.MustCompile(`(?i)\bcheat(?:s|d|ing)?\b`),
	regexp.MustCompile(`(?i)\bplagiar(?:y|ize|ized|izing|ise|ised|ising)\b`),
	regexp.MustCompile(`(?i)\bdiscriminat(?:e|es|ed|ing|ion|ory)\b`),
	regexp.MustCompile(`(?i)\bharass(?:es|ed|ing|ment)?\b`),
	regexp.MustCompile(`(?i)\bbypass\s+(?:policy|security|rules)\b`),
	regexp.MustCompile(`(?i)\bdishonest(?:y)?\b`),
	regexp.MustCompile(`(?i)\bsteal(?:ing|s)?\b`),
	regexp.MustCompile(`(?i)\bstolen\b`),
	regexp.MustCompile(`(?i)\btheft\b`),
	regexp.MustCompile(`(?i)\bfraud(?:ulent)?\b`),
	regexp.MustCompile(`(?i)\bmisrepresent(?:ed|ing|ation)?\b`),
	regexp.MustCompile(`(?i)\bdeceiv(?:e|es|ed|ing)?\b`),
	regexp.MustCompile(`(?i)\bdeception\b`),
	regexp.MustCompile(`(?i)\bcover[- ]?up\b`),
	regexp.MustCompile(`(?i)\bcompromis(?:e|es|ed|ing)\s+(?:the\s+)?(?:logging|records|audit|integrity)\b`),
	regexp.MustCompile(`(?i)\bskip(?:ping)?\s+(?:maintenance|proper|records|documentation|logging)\b`),
	regexp.MustCompile(`(?i)\bignore\s+debugging\b`),
}

func ValidateAnswer(email, answer string) ethicalvalidator.ValidationStatus {
	status := "ethical"
	message := "The answer passed the ethical validation checks."

	for _, pattern := range ethicalPatterns {
		if pattern.MatchString(answer) {
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
