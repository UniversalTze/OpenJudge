#!/bin/bash

# Test script for the execution service
# Usage: ./scripts/test.sh [command]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

case "${1:-help}" in
    "start")
        echo "Starting execution service..."
        docker-compose up --build
        ;;
    
    "start-bg")
        echo "Starting execution service in background..."
        docker-compose up -d --build
        ;;
    
    "stop")
        echo "Stopping execution service..."
        docker-compose down
        ;;
    
    "restart")
        echo "Restarting execution service..."
        docker-compose down
        docker-compose up -d --build
        ;;
    
    "logs")
        echo "Showing logs..."
        docker-compose logs -f
        ;;
    
    "logs-worker")
        echo "Showing worker logs..."
        docker-compose logs -f worker
        ;;
    
    "test")
        echo "Sending test request..."
        docker-compose exec worker python test_client.py send
        ;;

    "test-listen")
        echo "Starting result listener..."
        docker-compose exec worker python test_client.py listen
        ;;

    "test-full")
        echo "Running full test (send request + listen for results + exit)..."
        docker-compose exec worker python test_client.py full-test
        ;;

    "test-interactive")
        echo "Sending test request and listening for results (interactive)..."
        docker-compose exec worker python test_client.py send-and-listen
        ;;

    "test-run")
        echo "Running test client in new container..."
        docker-compose run --rm test-client python test_client.py full-test
        ;;
    
    "shell")
        echo "Opening shell in worker container..."
        docker-compose exec worker bash
        ;;
    
    "status")
        echo "Service status:"
        docker-compose ps
        ;;
    
    "clean")
        echo "Cleaning up..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        ;;
    
    "rebuild")
        echo "Rebuilding from scratch..."
        docker-compose down
        docker-compose build --no-cache
        docker-compose up
        ;;
    
    "help"|*)
        echo "Execution Service Test Script"
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  start            - Start services (foreground)"
        echo "  start-bg         - Start services (background)"
        echo "  stop             - Stop services"
        echo "  restart          - Restart services"
        echo "  logs             - Show all logs"
        echo "  logs-worker      - Show worker logs only"
        echo "  test             - Send test request only"
        echo "  test-listen      - Listen for results only"
        echo "  test-full        - Run complete test (recommended)"
        echo "  test-interactive - Send request and listen (interactive)"
        echo "  test-run         - Run test in new container"
        echo "  shell            - Open shell in worker"
        echo "  status           - Show service status"
        echo "  clean            - Clean up containers and volumes"
        echo "  rebuild          - Rebuild from scratch"
        echo "  help             - Show this help"
        ;;
esac
