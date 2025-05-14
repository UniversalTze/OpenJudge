package config

import (
	"log"
	"os"
)

type Config struct {
	ENV                     string
	AUTH_SERVICE_PORT       string
	JWT_SECRET              string
	USER_DATABASE_URL       string
	REVOCATION_KV_STORE_URL string
	OBJECT_STORE_URL        string
	OBJECT_STORE_BUCKET     string
	OBJECT_STORE_REGION     string
	OBJECT_STORE_KEY        string
	OBJECT_STORE_SECRET     string
}

/*
 * Loads and validates the environment variables and sets a config struct
 */
func Load() Config {
	env, found := os.LookupEnv("ENV")
	if !found || env == "" {
		log.Fatalf("Error: Environment variable 'ENV' is not set.")
	}
	asp, found := os.LookupEnv("AUTH_SERVICE_PORT")
	if !found || asp == "" {
		log.Fatalf("Error: Environment variable 'AUTH_SERVICE_PORT' is not set.")
	}
	jwt, found := os.LookupEnv("JWT_SECRET")
	if !found || jwt == "" {
		log.Fatalf("Error: Environment variable 'JWT_SECRET' is not set.")
	}
	udb, found := os.LookupEnv("USER_DATABASE_URL")
	if !found || udb == "" {
		log.Fatalf("Error: Environment variable 'USER_DATABASE_URL' is not set.")
	}
	rkv, found := os.LookupEnv("REVOCATION_KV_STORE_URL")
	if !found || rkv == "" {
		log.Fatalf("Error: Environment variable 'REVOCATION_KV_STORE_URL' is not set.")
	}
	osu, found := os.LookupEnv("OBJECT_STORE_URL")
	if !found || osu == "" {
		log.Fatalf("Error: Environment variable 'OBJECT_STORE_URL' is not set.")
	}
	osb, found := os.LookupEnv("OBJECT_STORE_BUCKET")
	if !found || osb == "" {
		log.Fatalf("Error: Environment variable 'OBJECT_STORE_BUCKET' is not set.")
	}
	osr, found := os.LookupEnv("OBJECT_STORE_REGION")
	if !found || osr == "" {
		log.Fatalf("Error: Environment variable 'OBJECT_STORE_REGION' is not set.")
	}
	oss, found := os.LookupEnv("OBJECT_STORE_SECRET")
	if !found || oss == "" {
		log.Fatalf("Error: Environment variable 'OBJECT_STORE_SECRET' is not set.")
	}
	osk, found := os.LookupEnv("OBJECT_STORE_KEY")
	if !found || osk == "" {
		log.Fatalf("Error: Environment variable 'OBJECT_STORE_KEY' is not set.")
	}

	return Config{
		ENV:                     env,
		AUTH_SERVICE_PORT:       asp,
		JWT_SECRET:              jwt,
		USER_DATABASE_URL:       udb,
		REVOCATION_KV_STORE_URL: rkv,
		OBJECT_STORE_URL:        osu,
		OBJECT_STORE_BUCKET:     osb,
		OBJECT_STORE_REGION:     osr,
		OBJECT_STORE_SECRET:     oss,
		OBJECT_STORE_KEY:        osk,
	}
}
