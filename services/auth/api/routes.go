package api

import (
	"auth/api/auth"
	"auth/config"
	"fmt"
	"log"

	"github.com/go-redis/redis/v8"
	"github.com/gofiber/fiber/v2"
	"github.com/minio/minio-go/v7"
	"gopkg.in/gomail.v2"
	"gorm.io/gorm"
)

/*
 * Custom handler for internal server errors.
 */
func InternalServerError(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	message := fmt.Sprintf("%v", err)

	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
		message = e.Message
	} else {
		log.Printf("Error: Failed to process request - %v", err)
	}

	return c.Status(code).SendString(message)
}

/*
 * Health check endpoint.
 */
func Health(c *fiber.Ctx) error {
	return c.Status(fiber.StatusOK).SendString("Authentication service operational")
}

/*
 * Initialises the API.
 * TODO: Add objectStore *s3.Client and revocationKVStore *redis.Client
 */
func InitialiseAPI(database *gorm.DB, config config.Config, emailClient *gomail.Dialer, objectStore *minio.Client, revocationKVStore *redis.Client) *fiber.App {
	app := fiber.New(fiber.Config{
		AppName:      "OpenJudge Authentication Service",
		ErrorHandler: InternalServerError,
	})
	app.Use(func(c *fiber.Ctx) error {
		c.Locals("database", database)
		c.Locals("config", config)
		c.Locals("mailer", emailClient)
		c.Locals("objectStore", objectStore)
		c.Locals("revocationKVStore", revocationKVStore)
		return c.Next()
	})

	// TODO: Add rate limiting middleware?
	// TODO: Change to actual handlers
	app.Get("/health", Health)
	app.Post("/register", auth.Register)
	app.Post("/login", Health)
	app.Get("/verify", auth.Verify)
	app.Post("/refresh", Health)
	app.Delete("/logout", Health)
	app.Post("/forgot", Health)
	app.Post("/reset", Health)
	app.Get("/user", Health)
	app.Put("/user", Health)
	app.Delete("/user", Health)
	app.Post("/user/avatar", Health)
	app.Delete("/user/avatar", Health)

	return app
}