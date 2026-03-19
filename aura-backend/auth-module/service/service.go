package service

import (
	"context"
	"errors"
	"time"

	"aura-backend/auth-module/dao"
	"aura-backend/common/middleware"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

func Signup(ctx context.Context, email, password, firstName, lastName, degreeProgram, university string, goalID, studyYear int) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	_, err = dao.CreateUser(ctx, email, string(hashedPassword), firstName, lastName, degreeProgram, university, goalID, studyYear)
	return err
}

func Login(ctx context.Context, email, password string) (string, error) {
	user, err := dao.GetUserByEmail(ctx, email)
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
