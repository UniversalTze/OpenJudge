package auth

import (
	"auth/config"
	"auth/core"
	"time"

	"github.com/alexedwards/argon2id"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type LoginRequestBody struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

/**
 * Login handles user login requests.
 */
func Login(c *fiber.Ctx) error {
	// Parse the request body
	var requestBody LoginRequestBody
	if err := c.BodyParser(&requestBody); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString("Invalid request body")
	}
	if requestBody.Email == "" || requestBody.Password == "" {
		return c.Status(fiber.StatusBadRequest).SendString("Missing required fields")
	}

	// Check credentials
	database := c.Locals("database").(*gorm.DB)
	var user core.User
	if err := database.Where("email = ?", requestBody.Email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusUnauthorized).SendString("Invalid email or password")
		} else {
			return err
		}
	}
	if match, err := argon2id.ComparePasswordAndHash(requestBody.Password, user.Password); err != nil {
		return err
	} else if !match {
		return c.Status(fiber.StatusUnauthorized).SendString("Invalid email or password")
	}

	// Generate tokens and set cookies
	access_token, err := core.GenerateJWT(user.ID.String(), false, c.Locals("config").(config.Config))
	if err != nil {
		return err
	}
	refresh_token, err := core.GenerateJWT(user.ID.String(), true, c.Locals("config").(config.Config))
	if err != nil {
		return err
	}

	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    refresh_token,
		Path: 	 "/",
		Secure:   true,
		SameSite: fiber.CookieSameSiteStrictMode,
		HTTPOnly: true,
		MaxAge:	 60 * 60 * 24 * 30,
		Expires: time.Now().Add(time.Hour * 24 * 30),
	})

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"access_token": access_token,
	})
}
