package main

import (
	"crypto/ed25519"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"log"
)

func main() {
    pub, priv, err := ed25519.GenerateKey(rand.Reader)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("JWT_SECRET=\"%s\"\n", base64.StdEncoding.EncodeToString(priv))
    fmt.Printf("JWT_PUBLIC_KEY=\"%s\"\n", base64.URLEncoding.EncodeToString(pub))
}