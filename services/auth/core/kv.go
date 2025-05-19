package core

import (
	"auth/config"
	"context"
	"log"

	"github.com/go-redis/redis/v8"
)

/**
 * InitialiseRevocationStore creates and returns a Redis client for the Token Revocation List
 */
func InitialiseRevocationStore(cfg config.Config) *redis.Client {
	opt, err := redis.ParseURL(cfg.REVOCATION_KV_STORE_URL)
	if err != nil {
		log.Fatalf("Error: Failed to parse Redis URL: %v", err)
	}
	client := redis.NewClient(opt)
	if err := client.Ping(context.Background()).Err(); err != nil {
		log.Fatalf("Error: Failed to connect to Redis: %v", err)
	}
	return client
}