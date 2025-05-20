FROM golang:1.24.3-bullseye AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y git
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=1 GOOS=linux go build -ldflags="-s -w" -o auth ./main.go
FROM gcr.io/distroless/base-debian11
COPY --from=builder /app/auth /auth
EXPOSE 8080
ENTRYPOINT ["/auth"]
