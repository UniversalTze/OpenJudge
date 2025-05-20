FROM golang:1.24.3-alpine
RUN apk add --no-cache git curl && \
    go install github.com/cosmtrek/air@latest
WORKDIR /app
COPY . ./
ENV PATH="/go/bin:${PATH}"
CMD ["air"]
