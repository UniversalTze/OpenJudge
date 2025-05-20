package auth

import (
	"auth/config"
	"auth/core"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func Refresh(c *fiber.Ctx) error {
	// Retrieve and validate the refresh token from the cookies
	refreshToken := c.Cookies("refresh_token")
	if refreshToken == "" {
		return c.Status(fiber.StatusUnauthorized).SendString("Refresh token not found")
	}
	userID, err := core.VerifyJWT(refreshToken, c.Locals("config").(config.Config))
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).SendString("Invalid refresh token")
	}

	// Check if the user exists in the database
	database := c.Locals("database").(*gorm.DB)
	var user core.User
	if err := database.Where("id = ?", userID).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusUnauthorized).SendString("User not found")
		} else {
			return err
		}
	}

	// Generate new access and refresh tokens
	newAccessToken, err := core.GenerateJWT(userID.String(), false, c.Locals("config").(config.Config))
	if err != nil {
		return err
	}
	newRefreshToken, err := core.GenerateJWT(userID.String(), true, c.Locals("config").(config.Config))
	if err != nil {
		return err
	}

	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    newRefreshToken,
		Path: 	 "/",
		Secure:   true,
		SameSite: fiber.CookieSameSiteStrictMode,
		HTTPOnly: true,
		MaxAge:	 60 * 60 * 24 * 30,
		Expires: time.Now().Add(time.Hour * 24 * 30),
	})

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"access_token": newAccessToken,
	})
}