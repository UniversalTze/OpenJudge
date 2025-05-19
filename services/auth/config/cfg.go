package config

import (
	"log"
	"net/url"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	ENV                     string
	AUTH_SERVICE_URL        string
	AUTH_SERVICE_PORT       string
	JWT_SECRET              string
	USER_DATABASE_URL       string
	REVOCATION_KV_STORE_URL string
	OBJECT_STORE_URL        string
	OBJECT_STORE_BUCKET     string
	OBJECT_STORE_REGION     string
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
	asu := os.Getenv("AUTH_SERVICE_URL")
	if asu == "" {
		log.Fatalf("Error: Environment variable 'AUTH_SERVICE_URL' is not set.")
	}
	// Check if the URL is valid
	if _, err := url.ParseRequestURI(asu); err != nil {
		log.Fatalf("Error: Environment variable 'AUTH_SERVICE_URL' is not a valid URL.")
	}
	asp := os.Getenv("AUTH_SERVICE_PORT")
	if asp == "" {
		log.Fatalf("Error: Environment variable 'AUTH_SERVICE_PORT' is not set.")
	}
	jwt := os.Getenv("JWT_SECRET")
	if jwt == "" {
		log.Fatalf("Error: Environment variable 'JWT_SECRET' is not set.")
	}
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
		AUTH_SERVICE_URL:        asu,
		AUTH_SERVICE_PORT:       asp,
		JWT_SECRET:              jwt,
		USER_DATABASE_URL:       udb,
		REVOCATION_KV_STORE_URL: rkv,
		OBJECT_STORE_URL:        osu,
		OBJECT_STORE_BUCKET:     osb,
		OBJECT_STORE_REGION:     osr,
		OBJECT_STORE_SECRET:     oss,
		OBJECT_STORE_KEY:        osk,
		SMTP_HOST:               smtpHost,
		SMTP_PORT:               smtpPortInt,
		SMTP_USER:               smtpUser,
		SMTP_PASSWORD:           smtpPassword,
		SMTP_FROM:               smtpFrom,
	}
}
