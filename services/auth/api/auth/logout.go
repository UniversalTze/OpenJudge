package auth

import (
	"github.com/go-redis/redis/v8"
	"github.com/gofiber/fiber/v2"
)

/**
 * Logout revokes the token by adding it to the revocation store.
 */
func Logout(c *fiber.Ctx) error {
	revocationStore := c.Locals("revocationKVStore").(*redis.Client)
	token := c.Get("Authorization")
	if err := revocationStore.Set(c.Context(), token, "true", 0).Err(); err != nil {
		return err
	}
	return c.Status(fiber.StatusNoContent).SendString("Token revoked")
}