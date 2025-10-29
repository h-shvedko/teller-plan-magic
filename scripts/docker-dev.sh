#!/bin/bash

# Teller Plan Magic - Docker Development Script
# This script helps manage the Docker development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker and Docker Compose are installed
check_dependencies() {
    print_info "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_info "Dependencies check passed!"
}

# Function to start development environment
start_dev() {
    print_info "Starting development environment..."
    
    # Copy environment file if it doesn't exist
    if [ ! -f .env ]; then
        if [ -f .env.docker ]; then
            cp .env.docker .env
            print_info "Copied .env.docker to .env"
        else
            print_warning "No .env file found. Using default environment variables."
        fi
    fi
    
    # Start services
    docker-compose up -d
    
    print_info "Development environment started!"
    print_info "Services:"
    print_info "  - React App: http://localhost:8080"
    print_info "  - Supabase API: http://localhost:54321"
    print_info "  - Supabase Studio: http://localhost:54324"
    print_info "  - Database: postgresql://postgres:postgres@localhost:54322/postgres"
}

# Function to stop development environment
stop_dev() {
    print_info "Stopping development environment..."
    docker-compose down
    print_info "Development environment stopped!"
}

# Function to restart development environment
restart_dev() {
    print_info "Restarting development environment..."
    docker-compose restart
    print_info "Development environment restarted!"
}

# Function to show logs
logs() {
    if [ -n "$1" ]; then
        docker-compose logs -f "$1"
    else
        docker-compose logs -f
    fi
}

# Function to show status
status() {
    docker-compose ps
}

# Function to clean up
cleanup() {
    print_info "Cleaning up Docker environment..."
    docker-compose down -v --remove-orphans
    docker system prune -f
    print_info "Cleanup completed!"
}

# Function to reset database
reset_db() {
    print_warning "This will destroy all data in the development database!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Resetting database..."
        docker-compose stop supabase-db
        docker-compose rm -f supabase-db
        docker volume rm teller-plan-magic_supabase-db-data 2>/dev/null || true
        docker-compose up -d supabase-db
        print_info "Database reset completed!"
    else
        print_info "Database reset cancelled."
    fi
}

# Function to run migrations
migrate() {
    print_info "Running Supabase migrations..."
    if command -v supabase &> /dev/null; then
        supabase db reset --local
        print_info "Migrations completed!"
    else
        print_error "Supabase CLI not found. Please install it first:"
        print_error "npm install -g supabase"
    fi
}

# Function to run database seeding
seed_db() {
    print_info "Running database seeding..."
    if [ -f "./scripts/docker-seed.sh" ]; then
        ./scripts/docker-seed.sh
    else
        print_warning "Database seed script not found at ./scripts/docker-seed.sh"
        print_info "You can run seeding manually once the environment is running"
    fi
}

# Function to show help
show_help() {
    echo "Teller Plan Magic - Docker Development Helper"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start       Start the development environment"
    echo "  stop        Stop the development environment"
    echo "  restart     Restart the development environment"
    echo "  logs [service]  Show logs (optionally for specific service)"
    echo "  status      Show status of all services"
    echo "  cleanup     Clean up Docker environment and volumes"
    echo "  reset-db    Reset the development database"
    echo "  migrate     Run Supabase migrations"
    echo "  seed        Run database seeding"
    echo "  help        Show this help message"
    echo ""
    echo "Additional Scripts:"
    echo "  ./scripts/docker-fresh-start.sh   Complete fresh setup (destructive)"
    echo "  ./scripts/docker-restart.sh       Restart existing stopped environment"
    echo "  ./scripts/docker-seed.sh          Database seeding with options"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 logs app"
    echo "  $0 status"
    echo "  $0 seed"
}

# Main script logic
case "$1" in
    "start")
        check_dependencies
        start_dev
        ;;
    "stop")
        stop_dev
        ;;
    "restart")
        restart_dev
        ;;
    "logs")
        logs "$2"
        ;;
    "status")
        status
        ;;
    "cleanup")
        cleanup
        ;;
    "reset-db")
        reset_db
        ;;
    "migrate")
        migrate
        ;;
    "seed")
        seed_db
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    "")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac