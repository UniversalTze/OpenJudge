package user

import (
	"auth/config"
	"auth/core"
	"bytes"
	"context"
	"fmt"
	"image"

	"io"
	"net/http"

	"github.com/chai2010/webp"
	"github.com/disintegration/imaging"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"gorm.io/gorm"
)

func SetAvatar(c *fiber.Ctx) error {
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

	// Get uploaded file
	fileHeader, err := c.FormFile("avatar")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString("Invalid file")
	}
	srcFile, err := fileHeader.Open()
	if err != nil {
		return err
	}
	defer srcFile.Close()

	// Read into a buffer (once)
	var originalBuf bytes.Buffer
	if _, err := io.Copy(&originalBuf, srcFile); err != nil {
		return err
	}

	contentType := http.DetectContentType(originalBuf.Bytes())
	allowedTypes := []string{"image/jpeg", "image/png", "image/webp"}
	isAllowed := false
	for _, t := range allowedTypes {
		if contentType == t {
			isAllowed = true
			break
		}
	}
	if !isAllowed {
		return c.Status(fiber.StatusBadRequest).SendString("Unsupported file type")
	}

	// Decode image
	img, _, err := image.Decode(bytes.NewReader(originalBuf.Bytes()))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString("Failed to decode image")
	}

	// Crop to square
	width := img.Bounds().Dx()
	height := img.Bounds().Dy()
	size := width
	if height < width {
		size = height
	}
	cropped := imaging.CropCenter(img, size, size)

	// Resize to a max dimension (e.g. 512x512)
	resized := imaging.Resize(cropped, 512, 512, imaging.Lanczos)

	// Encode to WebP
	var webpBuf bytes.Buffer
	err = webp.Encode(&webpBuf, resized, &webp.Options{
		Lossless: false,
		Quality:  75,
	})
	if err != nil {
		return err
	}

	if webpBuf.Len() > 200*1024 {
		return c.Status(fiber.StatusBadRequest).SendString("Image too large after compression")
	}

	// Upload
	objectPath := "avatars/" + uuid.New().String() + ".webp"
	objectStore := c.Locals("objectStore").(*minio.Client)
	_, err = objectStore.PutObject(
		context.Background(),
		(c.Locals("config").(config.Config)).OBJECT_STORE_BUCKET,
		objectPath,
		bytes.NewReader(webpBuf.Bytes()),
		int64(webpBuf.Len()),
		minio.PutObjectOptions{
			ContentType: contentType,
		},
	)
	if err != nil {
		return err
	}

	var publicURL string
	if (c.Locals("config").(config.Config)).ENV != "production" {
		publicURL = fmt.Sprintf("http://localhost:%s/%s/%s", (c.Locals("config").(config.Config)).OBJECT_STORE_PORT,
			(c.Locals("config").(config.Config)).OBJECT_STORE_BUCKET, objectPath)
	} else {
		publicURL = fmt.Sprintf("https://%s/%s/%s", objectStore.EndpointURL().Host,
			(c.Locals("config").(config.Config)).OBJECT_STORE_BUCKET, objectPath)
	}

	// Update user avatar URL in the database
	if err := database.Model(&user).Update("avatar", publicURL).Error; err != nil {
	  return err
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"url": publicURL,
	})
}
