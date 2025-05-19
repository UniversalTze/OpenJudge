package auth

import (
	"auth/core"
	"crypto/sha1"
	"encoding/hex"
	"io"
	"net/http"
	"strings"

	"github.com/alexedwards/argon2id"
	"github.com/dlclark/regexp2"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type RegisterRequestBody struct {
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Email     string `json:"email"`
	Password  string `json:"password"`
}

var passwordRegex = regexp2.MustCompile(`^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{10,}$`, 0)

func isPasswordValid(password string) (bool, error) {
	return passwordRegex.MatchString(password)
}

func checkPassword(password string) (bool, error) {
	hasher := sha1.New()
	hasher.Write([]byte(password))
	sha1Hash := strings.ToUpper(hex.EncodeToString(hasher.Sum(nil)))
	prefix := sha1Hash[:5]
	suffix := sha1Hash[5:]

	resp, err := http.Get("https://api.pwnedpasswords.com/range/" + prefix)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return false, err
	}

	lines := strings.Split(string(body), "\n")
	for _, line := range lines {
		parts := strings.Split(line, ":")
		if len(parts) != 2 {
			continue
		}
		if strings.EqualFold(parts[0], suffix) {
			return true, nil
		}
	}

	return false, nil
}

func hashPassword(password string) (string, error) {
	params := &argon2id.Params{
		Memory:      64 * 1024, // 64 MB
		Iterations:  1,
		Parallelism: 2,
		SaltLength:  16,
		KeyLength:   32,
	}

	hash, err := argon2id.CreateHash(password, params)
	if err != nil {
		return "", err
	}
	return hash, nil
}

/**
 * Handler for user registration.
 */
func Register(c *fiber.Ctx) error {
	// Parse the request body
	var body RegisterRequestBody
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString("Invalid request body")
	}
	if body.FirstName == "" || body.LastName == "" || body.Email == "" || body.Password == "" {
		return c.Status(fiber.StatusBadRequest).SendString("Missing required fields")
	}

	// Check if the user already exists
	database := c.Locals("database").(*gorm.DB)
	var user core.User
    if err := database.Where("email = ?", body.Email).First(&user).Error; err == nil {
        return c.Status(fiber.StatusBadRequest).SendString("User already exists")
    } else if err != gorm.ErrRecordNotFound {
        return c.Status(fiber.StatusInternalServerError).SendString("Failed to query database")
    }

	// Check if the password meets complexity requirements
	if strong, err := isPasswordValid(body.Password); err != nil {
		return err
	} else if !strong {
		return c.Status(fiber.StatusBadRequest).SendString(
			"Password must be at least 10 characters long and contain at least one uppercase letter, " +
				"one lowercase letter, one number, and one special character")
	}
	if leaked, err := checkPassword(body.Password); err != nil {
		return err
	} else if leaked {
		return c.Status(fiber.StatusBadRequest).SendString("Password has been subject to a data breach")
	}

	// Hash the password & save the user
	if hashedPassword, err := hashPassword(body.Password); err != nil {
		return err
	} else {
		user = core.User{
			FirstName: body.FirstName,
			LastName:  body.LastName,
			Email:     body.Email,
			Password:  hashedPassword,
		}

		if err = database.Create(&user).Error; err != nil {
			return err
		}
	}

	// TODO: Send verification email
	return c.Status(fiber.StatusCreated).SendString("User created")
}
