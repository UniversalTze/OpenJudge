package core

import (
	"auth/config"
	"log"
	"time"

	"github.com/google/uuid"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type User struct {
	ID        uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	FirstName string
	LastName  string
	Email     string `gorm:"uniqueIndex"`
	Password  string
	Skill     string `gorm:"type:skill_level"`
	Verified  bool   `gorm:"default:false"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

type Token struct {
	ID        uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	Type      string    `gorm:"type:token_type"`
	Expiry    time.Time
	CreatedAt time.Time
	UpdatedAt time.Time
	UserID    uuid.UUID
	User      User `gorm:"foreignKey:UserID"`
}

/*
 * Initialises the database connection.
 */
func InitialiseDatabase(config config.Config) *gorm.DB {
	client, err := gorm.Open(postgres.Open(config.USER_DATABASE_URL), &gorm.Config{})
	if err != nil {
		log.Fatalf("Error: Failed opening connection to database: %v", err)
	}

	sqlDB, err := client.DB()
	if err != nil {
		log.Fatalf("Error: Failed to get database connection: %v", err)
	}
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	if err := client.Exec(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`).Error; err != nil {
		log.Fatalf("Error: Failed to enable uuid-ossp extension: %v", err)
	}

	err = client.Exec(`
		DO $$
		BEGIN
			IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'token_type') THEN
				CREATE TYPE token_type AS ENUM ('reset', 'verify');
			END IF;
		END$$;
	`).Error
	if err != nil {
		log.Fatalf("Error: Failed to create enum type: %v", err)
	}

	err = client.Exec(`
		DO $$
		BEGIN
			IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'skill_level') THEN
				CREATE TYPE skill_level AS ENUM ('Beginner', 'Intermediate', 'Advanced');
			END IF;
		END$$;
	`).Error
	if err != nil {
		log.Fatalf("Error: Failed to create enum type: %v", err)
	}

	if err := client.AutoMigrate(&User{}, &Token{}); err != nil {
		log.Fatalf("Error: Failed to migrate database: %v", err)
	}

	return client.Debug()
}
