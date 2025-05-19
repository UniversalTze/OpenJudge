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
	
	// TODO: Initialise object store connection
	// TODO: Initialise revocation KV store connection

	log.Println("Status: Initialising API")
	api := api.InitialiseAPI(database, cfg)
	log.Println("Status: API connection established")
	log.Fatalf("Error: %v", api.Listen("0.0.0.0:8080")) 
}
