package core

import (
	"auth/config"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

func GenerateJWT(userID string, refresh bool, cfg config.Config) (string, error) {
	var claims jwt.MapClaims
	if refresh {
		claims = jwt.MapClaims{
			"id": uuid.New().String(),
			"type": "refresh",
			"sub": userID,
			"iss": cfg.API_GATEWAY_URL + "/auth",
			"iat": time.Now().Unix(),
			"exp": time.Now().Add(time.Hour * 24 * 30).Unix(),
		}
	} else {
		claims = jwt.MapClaims{
			"id": uuid.New().String(),
			"sub": userID,
			"iss": cfg.API_GATEWAY_URL + "/auth",
			"iat": time.Now().Unix(),
			"exp": time.Now().Add(time.Hour).Unix(),
		}
	}

	token := jwt.NewWithClaims(jwt.SigningMethodEdDSA, claims)

	signed, err := token.SignedString(cfg.JWT_SECRET)
	if err != nil {
		return "", err
	}

	return signed, nil
}

func VerifyJWT(tokenString string, cfg config.Config) (uuid.UUID, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodEd25519); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}
		return cfg.JWT_PUBLIC_KEY, nil
	})
	if err != nil {
		return uuid.Nil, fmt.Errorf("Failed to parse token: %w", err)
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		sub, ok := claims["sub"].(string)
		if !ok {
			return uuid.Nil, fmt.Errorf("Invalid or missing 'sub' claim")
		}
		uid, err := uuid.Parse(sub)
		if err != nil {
			return uuid.Nil, fmt.Errorf("Invalid user ID in 'sub': %w", err)
		}
		return uid, nil
	}

	return uuid.Nil, fmt.Errorf("Invalid token")
}