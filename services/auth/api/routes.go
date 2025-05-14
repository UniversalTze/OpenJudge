package api

import (
	"auth/config"
	"auth/ent"
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"
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
	return c.SendStatus(fiber.StatusOK)
}

/*
 * Initialises the API.
 * TODO: Add objectStore *s3.Client and revocationKVStore *redis.Client
 */
func InitialiseAPI(database *ent.Client, config config.Config) *fiber.App {
	app := fiber.New(fiber.Config{
		AppName: "OpenJudge Authentication Service",
		ErrorHandler: InternalServerError,
	})
	app.Use(func(c *fiber.Ctx) error {
		c.Locals("database", database)
		c.Locals("config", config)
		return c.Next()
	})

	// TODO: Add rate limiting middleware?
	// TODO: Change to actual handlers
	app.Get("/health", Health)
	app.Post("/register", Health)
	app.Post("/login", Health)
	app.Post("/verify", Health)
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