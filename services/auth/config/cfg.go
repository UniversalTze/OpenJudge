package config

import (
	"crypto/ed25519"
	"encoding/base64"
	"log"
	"net/url"
	"os"
	"strconv"
)

type Config struct {
	ENV                     string
	API_GATEWAY_URL         string
	FRONTEND_URL            string
	JWT_SECRET              ed25519.PrivateKey
	JWT_PUBLIC_KEY          ed25519.PublicKey
	USER_DATABASE_URL       string
	SMTP_HOST               string
	SMTP_PORT               int
	SMTP_USER               string
	SMTP_PASSWORD           string
	SMTP_FROM               string
}

/*
 * Loads and validates the environment variables and sets a config struct
 */
func Load() Config {
	env := os.Getenv("ENV")
	if env == "" {
		log.Fatalf("Error: Environment variable 'ENV' is not set.")
	}
	agu := os.Getenv("API_GATEWAY_URL")
	if agu == "" {
		log.Fatalf("Error: Environment variable 'API_GATEWAY_URL' is not set.")
	}
	if _, err := url.ParseRequestURI(agu); err != nil {
		log.Fatalf("Error: Environment variable 'API_GATEWAY_URL' is not a valid URL.")
	}
	fru := os.Getenv("FRONTEND_URL")
	if fru == "" {
		log.Fatalf("Error: Environment variable 'FRONTEND_URL' is not set.")
	}
	if _, err := url.ParseRequestURI(fru); err != nil {
		log.Fatalf("Error: Environment variable 'FRONTEND_URL' is not a valid URL.")
	}
	jwt := os.Getenv("JWT_SECRET")
	if jwt == "" {
		log.Fatalf("Error: Environment variable 'JWT_SECRET' is not set.")
	}
	privBytes, err := base64.StdEncoding.DecodeString(jwt)
	if err != nil {
		log.Fatalf("Error: Environment variable 'JWT_SECRET' is not a valid base64 string.")
	}
	jwtPrivKey := ed25519.PrivateKey(privBytes)
	jwp := os.Getenv("JWT_PUBLIC_KEY")
	if jwp == "" {
		log.Fatalf("Error: Environment variable 'JWT_PUBLIC_KEY' is not set.")
	}
	pubBytes, err := base64.StdEncoding.DecodeString(jwp)
	if err != nil {
		log.Fatalf("Error: Environment variable 'JWT_PUBLIC_KEY' is not a valid base64 string.")
	}
	jwtPubKey := ed25519.PublicKey(pubBytes)
	udb := os.Getenv("USER_DATABASE_URL")
	if udb == "" {
		log.Fatalf("Error: Environment variable 'USER_DATABASE_URL' is not set.")
	}
	smtpHost := os.Getenv("SMTP_HOST")
	if smtpHost == "" {
		log.Fatalf("Error: Environment variable 'SMTP_HOST' is not set.")
	}
	smtpPort := os.Getenv("SMTP_PORT")
	if smtpPort == "" {
		log.Fatalf("Error: Environment variable 'SMTP_PORT' is not set.")
	}
	smtpPortInt, err := strconv.Atoi(smtpPort)
	if err != nil {
		log.Fatalf("Error: Environment variable 'SMTP_PORT' is not a valid integer.")
	}
	smtpUser := os.Getenv("SMTP_USER")
	if smtpUser == "" {
		log.Fatalf("Error: Environment variable 'SMTP_USER' is not set.")
	}
	smtpPassword := os.Getenv("SMTP_PASSWORD")
	if smtpPassword == "" {
		log.Fatalf("Error: Environment variable 'SMTP_PASSWORD' is not set.")
	}
	smtpFrom := os.Getenv("SMTP_FROM")
	if smtpFrom == "" {
		log.Fatalf("Error: Environment variable 'SMTP_FROM' is not set.")
	}

	return Config{
		ENV:                     env,
		API_GATEWAY_URL:         agu,
		FRONTEND_URL:            fru,
		JWT_SECRET:              jwtPrivKey,
		JWT_PUBLIC_KEY:          jwtPubKey,
		USER_DATABASE_URL:       udb,
		SMTP_HOST:               smtpHost,
		SMTP_PORT:               smtpPortInt,
		SMTP_USER:               smtpUser,
		SMTP_PASSWORD:           smtpPassword,
		SMTP_FROM:               smtpFrom,
	}
}
