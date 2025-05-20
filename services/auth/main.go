package main

import (
	"auth/api"
	"auth/config"
	"auth/core"
	"log"
)

/*
 * Entrypoint for the authentication service.
 */
func main() {
	log.Println("Status: Starting authentication service.")

	log.Println("Status: Loading environment variables.")
	cfg := config.Load()
	log.Println("Status: Environment variables loaded.")

	log.Println("Status: Initialising user database connection")
	database := core.InitialiseDatabase(cfg)
	if sqlDB, err := database.DB(); err != nil {
		log.Fatalf("Error: Failed to get database connection: %v", err)
	} else {
		defer sqlDB.Close()
	}
	log.Println("Status: User database connection established")

	log.Println("Status: Initialising object store connection")
	objectStore := core.InitialiseObjectStore(cfg)
	log.Println("Status: Object store connection established")

	log.Println("Status: Initialising revocation KV store connection")
	revocationStore := core.InitialiseRevocationStore(cfg)
	log.Println("Status: Revocation KV store connection established")

	log.Println("Status: Initialising email service")
	emailClient := core.InitialiseEmailService(cfg)
	log.Println("Status: Email service connection established")

	log.Println("Status: Initialising API")
	api := api.InitialiseAPI(database, cfg, emailClient, objectStore, revocationStore)
	log.Println("Status: API connection established")
	log.Fatalf("Error: %v", api.Listen("0.0.0.0:8080")) 
}