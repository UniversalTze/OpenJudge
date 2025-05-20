package user

import (
	"auth/config"
	"auth/core"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)


func DeleteAvatar(c *fiber.Ctx) error {
	// Get the user ID from the JWT token
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(fiber.StatusUnauthorized).SendString("Invalid Authorization header")
	}
	var token string
	if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
		token = authHeader[7:]
	} else {
		return c.Status(fiber.StatusUnauthorized).SendString("Invalid Authorization header")
	}
	if token == "" {
		return c.Status(fiber.StatusUnauthorized).SendString("Invalid access token")
	}

	// Verify the JWT token
	userID, err := core.VerifyJWT(token, c.Locals("config").(config.Config))
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).SendString("Invalid access token")
	}

	// Fetch the user from the database
	database := c.Locals("database").(*gorm.DB)
	var user core.User
	if err := database.Where("id = ?", userID).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).SendString("User not found")
		}
		return err
	}
	if err := database.Model(&user).Update("avatar", "").Error; err != nil {
		return err
	}

	return c.Status(fiber.StatusNoContent).SendString("Avatar deleted")
}