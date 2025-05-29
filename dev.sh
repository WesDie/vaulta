#!/bin/bash

# Vaulta Development Helper Script
# Usage: ./dev.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Setup environment
setup() {
    print_status "Setting up Vaulta development environment..."
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_status "Creating .env file from .env.example..."
        cp .env.example .env
        print_success ".env file created"
    else
        print_warning ".env file already exists"
    fi
    
    # Create data directories
    print_status "Creating data directories..."
    mkdir -p data/originals data/thumbs data/db
    print_success "Data directories created"
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    cd backend && npm install && cd ..
    
    print_status "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    
    print_success "Setup complete!"
}

# Start full stack with Docker
start_docker() {
    print_status "Starting Vaulta with Docker..."
    check_docker
    docker-compose up --build
}

# Start development mode (local)
start_dev() {
    print_status "Starting Vaulta in development mode..."
    check_docker
    
    # Start database
    print_status "Starting database..."
    docker-compose up db -d
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 5
    
    # Start backend and frontend in parallel
    print_status "Starting backend and frontend..."
    echo "Backend will run on http://localhost:8000"
    echo "Frontend will run on http://localhost:3000"
    echo ""
    echo "Press Ctrl+C to stop all services"
    
    # Use trap to cleanup on exit
    trap 'print_status "Stopping services..."; kill $(jobs -p) 2>/dev/null; docker-compose stop db; exit' INT
    
    # Start backend in background
    cd backend && npm run dev &
    BACKEND_PID=$!
    
    # Start frontend in background
    cd frontend && npm run dev &
    FRONTEND_PID=$!
    
    # Wait for both processes
    wait $BACKEND_PID $FRONTEND_PID
}

# Stop all services
stop() {
    print_status "Stopping all Vaulta services..."
    docker-compose down
    print_success "All services stopped"
}

# Clean everything
clean() {
    print_status "Cleaning up Vaulta..."
    docker-compose down -v
    docker system prune -f
    print_success "Cleanup complete"
}

# Show help
help() {
    echo "Vaulta Development Helper"
    echo ""
    echo "Usage: ./dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  setup     - Initial setup (create .env, install dependencies)"
    echo "  start     - Start full stack with Docker"
    echo "  dev       - Start in development mode (local backend/frontend + Docker DB)"
    echo "  stop      - Stop all services"
    echo "  clean     - Clean up Docker containers and volumes"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./dev.sh setup    # First time setup"
    echo "  ./dev.sh start    # Start with Docker"
    echo "  ./dev.sh dev      # Development mode"
    echo "  ./dev.sh stop     # Stop everything"
}

# Main script logic
case "${1:-help}" in
    setup)
        setup
        ;;
    start)
        start_docker
        ;;
    dev)
        start_dev
        ;;
    stop)
        stop
        ;;
    clean)
        clean
        ;;
    help|*)
        help
        ;;
esac 