package user

import (
	"auth/config"
	"auth/core"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func GetUser(c *fiber.Ctx) error {
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
		return c.Status(fiber.StatusUnauthorized).SendString("Invalid access token: " + err.Error())
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

	// Return the user details
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"id":         user.ID,
		"email":      user.Email,
		"first_name": user.FirstName,
		"last_name":  user.LastName,
		"avatar":     user.Avatar,
		"verified":   user.Verified,
	})
}
