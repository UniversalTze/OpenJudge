package core

import (
	"auth/config"
	"auth/ent"
	"context"
	"log"

	_ "github.com/lib/pq"
)

func InitialiseDatabase(config config.Config) *ent.Client {
    client, err := ent.Open("postgres", config.USER_DATABASE_URL)
    if err != nil {
        log.Fatalf("Error: Failed opening connection to database: %v", err)
    }
    if err := client.Schema.Create(context.Background()); err != nil {
        log.Fatalf("Error: Failed creating schema resources: %v", err)
				client.Close()
    }
		return client
}