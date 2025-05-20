package core

import (
	"auth/config"
	"context"
	"log"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

/**
 * InitialiseObjectStore creates and returns a MinIO client for the object store
 */
func InitialiseObjectStore(cfg config.Config) *minio.Client {
	log.Println(cfg.OBJECT_STORE_URL)
	client, err := minio.New(cfg.OBJECT_STORE_URL, &minio.Options{
		Creds:  credentials.NewStaticV4(
			cfg.OBJECT_STORE_KEY, cfg.OBJECT_STORE_SECRET, cfg.OBJECT_STORE_TOKEN),
		Secure: cfg.ENV == "production",
		Region: cfg.OBJECT_STORE_REGION,
	})
	if err != nil {
		log.Fatalf("Error: Failed to initialize object store client: %v", err)
	}

	if cfg.ENV != "production" {
		exists, err := client.BucketExists(context.Background(), cfg.OBJECT_STORE_BUCKET)
		if err != nil {
			log.Fatalf("Error: Failed to connect to bucket: %v", err)
		}
		if !exists {
			err = client.MakeBucket(context.Background(), cfg.OBJECT_STORE_BUCKET, minio.MakeBucketOptions{
				Region: cfg.OBJECT_STORE_REGION,
			})
			if err != nil {
				log.Fatalf("Error: Failed to create bucket: %v", err)
			}
		}
	}

	return client
}