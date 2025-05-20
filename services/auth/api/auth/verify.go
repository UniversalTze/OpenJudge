package auth

import (
	"auth/core"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type VerifyRequestBody struct {
	Token string `json:"token"`
}

func Verify(c *fiber.Ctx) error {
	// Parse the request body
	var requestBody VerifyRequestBody
	if err := c.BodyParser(&requestBody); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString("Invalid request body")
	}
	if err := uuid.Validate(requestBody.Token); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString("Invalid link")
	}

	// Validate the token
	database := c.Locals("database").(*gorm.DB)
	var tokenRecord core.Token
	err := database.Where("id = ?", requestBody.Token).First(&tokenRecord).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusBadRequest).SendString("Invalid link")
		}
		return err
	}
	if tokenRecord.Type != "verify" {
		return c.Status(fiber.StatusBadRequest).SendString("Invalid link")
	}
	if tokenRecord.Expiry.Before(time.Now()) {
		return c.Status(fiber.StatusBadRequest).SendString("Link has expired")
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
