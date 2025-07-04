package api

import (
	"auth/api/auth"
	"auth/api/user"
	"auth/config"
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"
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
 */
func InitialiseAPI(database *gorm.DB, config config.Config, emailClient *gomail.Dialer) *fiber.App {
	app := fiber.New(fiber.Config{
		AppName:      "OpenJudge Authentication Service",
		ErrorHandler: InternalServerError,
	})
	app.Use(func(c *fiber.Ctx) error {
		c.Locals("database", database)
		c.Locals("config", config)
		c.Locals("mailer", emailClient)
		return c.Next()
	})

	// Define the routes
	app.Get("/health", Health)
	app.Post("/register", auth.Register)
	app.Post("/login", auth.Login)
	app.Post("/verify", auth.Verify)
	app.Post("/refresh", auth.Refresh)
	app.Post("/forgot", auth.Forgot)
	app.Post("/reset", auth.Reset)
	app.Get("/user", user.GetUser)
	app.Put("/user", user.UpdateUser)
	app.Delete("/user", user.DeleteUser)

	return app
}