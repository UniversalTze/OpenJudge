package main

import (
	"log"
)

/**
 * Entrypoint for the authentication service.
 */
func main() {
	log.Println("Status: Starting authentication service.")

	/* Initialise database & defer closing the connection
	log.Println("Status: Starting user database connection")
	db, err := services.InitDB()
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	log.Println("Status: Database connection pool established")

	// Initialise AWS SQS client
	log.Println("Status: Connecting to AWS SQS")
	sqsClient, err := services.InitSQSClient()
	if err != nil {
		log.Fatal(err)
	}
	queueURL := os.Getenv("SQS_QUEUE_URL")
	if queueURL == "" {
		log.Fatal("Error: SQS_QUEUE_URL environment variable is not set")
	}
	log.Println("Status: SQS client established")

	// Initialise AWS S3 client
	log.Println("Status: Connecting to AWS S3")
	s3Client, err := services.InitS3Client()
	if err != nil {
		log.Fatal(err)
	}
	bucket := os.Getenv("S3_BUCKET")
	if bucket == "" {
		log.Fatal("Error: S3_BUCKET environment variable is not set")
	}
	log.Println("Status: S3 client established")

	// Create fiber client w/ error handler & database connection
	log.Println("Status: Creating fiber client")
	app := fiber.New(fiber.Config{
		AppName: "CoughOverflow",
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
	log.Fatalf("Error: %v", app.Listen("0.0.0.0:8080")) */
}
