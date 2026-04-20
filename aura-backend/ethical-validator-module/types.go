package ethicalvalidator

import "time"

type AnswerRequest struct {
	Answer string `json:"answer"`
}

type ValidationStatus struct {
	Status    string    `json:"status"`
	Message   string    `json:"message"`
	CheckedAt time.Time `json:"checked_at"`
}
