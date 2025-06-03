package user

import (
	"auth/config"
	"auth/core"
	"net/mail"
	"time"

	"github.com/gofiber/fiber/v2"
	"gopkg.in/gomail.v2"
	"gorm.io/gorm"
)

type UpdateUserRequestBody struct {
	Email     string `json:"email"`
	Skill			string `json:"skill"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
}

func UpdateUser(c *fiber.Ctx) error {
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

	// Parse the request body
	var updateUser UpdateUserRequestBody
	if err := c.BodyParser(&updateUser); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString("Invalid request body")
	}
	if updateUser.Email == "" && updateUser.FirstName == "" && updateUser.LastName == "" && updateUser.Skill == "" {
		return c.Status(fiber.StatusBadRequest).SendString("No fields to update")
	}
	if updateUser.Skill != "" && !(updateUser.Skill == "Beginner" || 
		updateUser.Skill == "Intermediate" || updateUser.Skill == "Advanced") {
		return c.Status(fiber.StatusBadRequest).SendString("Invalid skill level")
	}

	if updateUser.Email != "" {
		// Check if the email is already in use
		var existingUser core.User
		if err := database.Where("email = ?", updateUser.Email).First(&existingUser).Error; err == nil {
			return c.Status(fiber.StatusBadRequest).SendString("Email already in use")
		} else if err != gorm.ErrRecordNotFound {
			return err
		}

		// Validate the email format
		_, err := mail.ParseAddress(updateUser.Email)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).SendString("Invalid email format")
		}
		user.Email = updateUser.Email
		user.Verified = false
	}
	if updateUser.FirstName != "" {
		user.FirstName = updateUser.FirstName
	}
	if updateUser.LastName != "" {
		user.LastName = updateUser.LastName
	}
	if updateUser.Skill != "" {
		user.Skill = updateUser.Skill
	}

	if err := database.Save(&user).Error; err != nil {
		return err
	}

	// If the email was updated, create token and send a verification email
	if updateUser.Email != "" {
		token := core.Token{
			UserID: user.ID,
			Type:   "verify",
			Expiry: time.Now().Add(24 * time.Hour),
		}
		err := database.Create(&token).Error
		if err != nil {
			return err
		}
		verificationLink :=
			c.Locals("config").(config.Config).FRONTEND_URL + "/verify?token=" + token.ID.String()
		message := core.ConstructVerificationEmail(verificationLink, c.Locals("config").(config.Config))
		if err := core.SendEmail(message, updateUser.Email, "Email Verification",
			c.Locals("config").(config.Config), c.Locals("mailer").(*gomail.Dialer)); err != nil {
			return err
		}
	}

	return c.Status(fiber.StatusOK).SendString("User updated")
}
