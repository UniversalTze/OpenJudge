package auth

import (
	"auth/config"
	"auth/core"
	"time"

	"github.com/gofiber/fiber/v2"
	"gopkg.in/gomail.v2"
	"gorm.io/gorm"
)

type ForgotRequestBody struct {
	Email string `json:"email"`
}

func Forgot(c *fiber.Ctx) error {
	// Parse the request body
	var requestBody ForgotRequestBody
	if err := c.BodyParser(&requestBody); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString("Invalid request body")
	}
	if requestBody.Email == "" {
		return c.Status(fiber.StatusBadRequest).SendString("Missing required fields")
	}

	// Check if the user exists
	database := c.Locals("database").(*gorm.DB)
	var user core.User
	if err := database.Where("email = ?", requestBody.Email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusBadRequest).SendString("User not found")
		}
		return err
	}

	// Generate a reset token and save it to the database
	resetToken := core.Token{
		UserID: user.ID,
		Type:   "reset",
		Expiry: time.Now().Add(24 * time.Hour),
	}
	if err := database.Create(&resetToken).Error; err != nil {
		return err
	}
	resetLink :=
		c.Locals("config").(config.Config).FRONTEND_URL + "/reset?token=" + resetToken.ID.String()
	message := core.ConstructResetEmail(resetLink, c.Locals("config").(config.Config))
	if err := core.SendEmail(message, requestBody.Email, "Password Reset",
		c.Locals("config").(config.Config), c.Locals("mailer").(*gomail.Dialer)); err != nil {
		return err
	}
	return c.Status(fiber.StatusOK).SendString("Reset password email sent successfully")
}
