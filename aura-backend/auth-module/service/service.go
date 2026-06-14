package service

import (
	"context"
	"errors"
	"net/mail"
	"net/http"
	"strings"
	"time"

	"aura-backend/auth-module/dao"
	"aura-backend/common/middleware"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidEmail = errors.New("invalid email format")
	ErrEmailExists  = errors.New("user exists for the given email")
)

func Signup(
	ctx context.Context,
	email, password, firstName, lastName, degreeProgram, university, technicalSkillLevel, softSkillLevel, availabilityType string,
	availabilityHours, goalID, studyYear int,
) error {
	normalizedEmail, err := validateEmailForSignup(ctx, email)
	if err != nil {
		return err
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	_, err = dao.CreateUser(
		ctx,
		normalizedEmail,
		string(hashedPassword),
		firstName,
		lastName,
		degreeProgram,
		university,
		technicalSkillLevel,
		softSkillLevel,
		availabilityType,
		availabilityHours,
		goalID,
		studyYear,
	)
	return err
}

func ValidateEmailForSignup(ctx context.Context, email string) error {
	_, err := validateEmailForSignup(ctx, email)
	return err
}

func isValidEmail(value string) bool {
	addr, err := mail.ParseAddress(value)
	if err != nil {
		return false
	}
	return strings.EqualFold(addr.Address, value)
}

func Login(ctx context.Context, email, password string) (string, error) {
	user, err := dao.GetUserByEmail(ctx, strings.TrimSpace(strings.ToLower(email)))
	if err != nil {
		return "", errors.New("invalid credentials")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))
	if err != nil {
		return "", errors.New("invalid credentials")
	}

	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &jwt.RegisteredClaims{
		Subject:   user.Email,
		ExpiresAt: jwt.NewNumericDate(expirationTime),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(middleware.JwtKey)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func validateEmailForSignup(ctx context.Context, email string) (string, error) {
	normalizedEmail := strings.TrimSpace(strings.ToLower(email))
	if !isValidEmail(normalizedEmail) {
		return "", ErrInvalidEmail
	}

	_, err := dao.GetUserByEmail(ctx, normalizedEmail)
	if err == nil {
		return "", ErrEmailExists
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		return "", err
	}
	return normalizedEmail, nil
}

func Signout(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    "",
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   true,
		Path:     "/",
	})
}
