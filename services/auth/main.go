package main

import (
	"auth/config"
	"auth/core"
	"log"

	"github.com/gofiber/fiber/v2"
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
	defer database.Close()
	log.Println("Status: User database connection established")

	

	// Create fiber client w/ error handler & database connection
	log.Println("Status: Initialising API")
	app := fiber.New(fiber.Config{
		AppName: "OpenJudge Authentication Service",
		ErrorHandler: handlers.InternalServerError,
	})
	app.Use(func(c *fiber.Ctx) error {
		c.Locals("db", db)
		c.Locals("sqsClient", sqsClient)
		c.Locals("queueURL", queueURL)
		c.Locals("s3Client", s3Client)
		c.Locals("bucket", bucket)
		return c.Next()
	})

	// Define API routes
	api := app.Group("/api")
	v1 := api.Group("/v1")
	v1.Get("/health", handlers.GetHealth)
	v1.Get("/labs", handlers.GetLabs)
	v1.Get("/patients/results", handlers.GetPatientResults)
	v1.Post("/analysis", handlers.PostAnalysis)
	v1.Get("/analysis", handlers.GetAnalysis)
	v1.Put("/analysis", handlers.PutAnalysis)
	v1.Get("/labs/results/:lab_id", handlers.GetLabResults)
	v1.Get("/labs/results/:lab_id/summary", handlers.GetLabSummary)
	log.Println("Status: Fiber client established")

	// Start server
	log.Println("Status: Starting server on port :8080.")
	log.Fatalf("Error: %v", app.Listen("0.0.0.0:8080")) 
}
