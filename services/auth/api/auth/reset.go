package auth

import (
	"auth/core"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ResetRequestBody struct {
	Token    string `json:"token"`
	Password string `json:"password"`
}

func Reset(c *fiber.Ctx) error {
	// Parse the request body
	var requestBody ResetRequestBody
	if err := c.BodyParser(&requestBody); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString("Invalid request body")
	}
	if requestBody.Token == "" || requestBody.Password == "" {
		return c.Status(fiber.StatusBadRequest).SendString("Missing required fields")
	}

	// Validate the token
	if err := uuid.Validate(requestBody.Token); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString("Invalid link")
	}
	database := c.Locals("database").(*gorm.DB)
	var tokenRecord core.Token
	err := database.Where("id = ?", requestBody.Token).First(&tokenRecord).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusBadRequest).SendString("Invalid link")
		}
		return err
	}
	if tokenRecord.Type != "reset" {
		return c.Status(fiber.StatusBadRequest).SendString("Invalid link")
	}
	if tokenRecord.Expiry.Before(time.Now()) {
		return c.Status(fiber.StatusBadRequest).SendString("Link has expired")
	}

	// Check the password
	var user core.User
	err = database.Where("id = ?", tokenRecord.UserID).First(&user).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusBadRequest).SendString("Invalid link")
		}
		return err
	}
	if strong, err := IsPasswordValid(requestBody.Password); err != nil {
		return err
	} else if !strong {
		return c.Status(fiber.StatusBadRequest).SendString(
			"Password must be at least 10 characters long and contain at least one uppercase letter, " +
				"one lowercase letter, one number, and one special character")
	}
	if leaked, err := CheckPassword(requestBody.Password); err != nil {
		return err
	} else if leaked {
		return c.Status(fiber.StatusBadRequest).SendString("Password has been subject to a data breach")
	}

	// Hash the password & save the update
	if hashedPassword, err := HashPassword(requestBody.Password); err != nil {
		return err
	} else {
		if err = database.Model(&user).Where("id = ?", tokenRecord.UserID).
			Update("password", hashedPassword).Error; err != nil {
			return err
		}
	}

	// Delete the token
	err = database.Delete(&tokenRecord).Error
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).SendString("Password changed successfully")
}
