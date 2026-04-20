package service

import (
	ethicalvalidator "aura-backend/ethical-validator-module"
	"aura-backend/ethical-validator-module/dao"
)

func ValidateAnswer(email, answer string) ethicalvalidator.ValidationStatus {
	return dao.ValidateAnswer(email, answer)
}

func GetValidationStatus(email string) ethicalvalidator.ValidationStatus {
	return dao.GetValidationStatus(email)
}
