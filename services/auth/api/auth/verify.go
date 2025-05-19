package auth

import (
	"auth/core"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func Verify(c *fiber.Ctx) error {
	// Extract the token from the URL parameters
	token := c.Query("token")
	if token == "" {
		return c.Status(fiber.StatusBadRequest).SendString("Token is required")
	}
	if err := uuid.Validate(token); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString("Invalid token")
	}

	// Validate the token
	database := c.Locals("database").(*gorm.DB)
	var tokenRecord core.Token
	err := database.Where("id = ?", token).First(&tokenRecord).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusBadRequest).SendString("Invalid token")
		}
		return err
	}
	if tokenRecord.Type != "verify" {
		return c.Status(fiber.StatusBadRequest).SendString("Invalid token")
	}
	if tokenRecord.Expiry.Before(time.Now()) {
		return c.Status(fiber.StatusBadRequest).SendString("Token has expired")
	}

	// Update the user's verified status
	var user core.User
	err = database.Model(&user).Where("id = ?", tokenRecord.UserID).Update("verified", true).Error
	if err != nil {
		return err
	} 

	// Delete the token
	err = database.Delete(&tokenRecord).Error
	if err != nil {
		return err
	}
	
	return c.Status(fiber.StatusOK).SendString("Email verified successfully")
}
