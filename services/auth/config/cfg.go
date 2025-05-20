package config

import (
	"crypto/ed25519"
	"encoding/base64"
	"log"
	"net/url"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	ENV                     string
	API_GATEWAY_URL         string
	FRONTEND_URL            string
	JWT_SECRET              ed25519.PrivateKey
	JWT_PUBLIC_KEY          ed25519.PublicKey
	USER_DATABASE_URL       string
	REVOCATION_KV_STORE_URL string
	OBJECT_STORE_URL        string
	OBJECT_STORE_BUCKET     string
	OBJECT_STORE_REGION     string
	OBJECT_STORE_TOKEN      string
	OBJECT_STORE_KEY        string
	OBJECT_STORE_SECRET     string
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
	err := godotenv.Load()
	if err != nil {
		log.Println("Error: Failed to load .env file: ", err)
	}
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
	rkv := os.Getenv("REVOCATION_KV_STORE_URL")
	if rkv == "" {
		log.Fatalf("Error: Environment variable 'REVOCATION_KV_STORE_URL' is not set.")
	}
	osu := os.Getenv("OBJECT_STORE_URL")
	if osu == "" {
		log.Fatalf("Error: Environment variable 'OBJECT_STORE_URL' is not set.")
	}
	osb := os.Getenv("OBJECT_STORE_BUCKET")
	if osb == "" {
		log.Fatalf("Error: Environment variable 'OBJECT_STORE_BUCKET' is not set.")
	}
	osr := os.Getenv("OBJECT_STORE_REGION")
	if osr == "" {
		log.Fatalf("Error: Environment variable 'OBJECT_STORE_REGION' is not set.")
	}
	oss := os.Getenv("OBJECT_STORE_SECRET")
	if oss == "" {
		log.Fatalf("Error: Environment variable 'OBJECT_STORE_SECRET' is not set.")
	}
	ost := os.Getenv("OBJECT_STORE_TOKEN")
	osk := os.Getenv("OBJECT_STORE_KEY")
	if osk == "" {
		log.Fatalf("Error: Environment variable 'OBJECT_STORE_KEY' is not set.")
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
		REVOCATION_KV_STORE_URL: rkv,
		OBJECT_STORE_URL:        osu,
		OBJECT_STORE_BUCKET:     osb,
		OBJECT_STORE_REGION:     osr,
		OBJECT_STORE_TOKEN:      ost,
		OBJECT_STORE_SECRET:     oss,
		OBJECT_STORE_KEY:        osk,
		SMTP_HOST:               smtpHost,
		SMTP_PORT:               smtpPortInt,
		SMTP_USER:               smtpUser,
		SMTP_PASSWORD:           smtpPassword,
		SMTP_FROM:               smtpFrom,
	}
}
