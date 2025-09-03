#!/bin/bash

# Teller Plan Magic - Docker Production Script
# This script helps manage the Docker production environment

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

# Function to build production images
build_prod() {
    print_info "Building production images..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
    print_info "Production images built!"
}

# Function to start production environment
start_prod() {
    print_info "Starting production environment..."
    
    # Check if production environment file exists
    if [ ! -f .env.docker.prod ]; then
        print_error "Production environment file (.env.docker.prod) not found!"
        print_error "Please create it with your production configuration."
        exit 1
    fi
    
    # Copy production environment file
    cp .env.docker.prod .env
    
    # Start services
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    
    print_info "Production environment started!"
    print_info "Services:"
    print_info "  - Application: http://localhost (port 80)"
    print_info "  - HTTPS: https://localhost (port 443, if configured)"
}

# Function to stop production environment
stop_prod() {
    print_info "Stopping production environment..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
    print_info "Production environment stopped!"
}

# Function to deploy production environment
deploy_prod() {
    print_info "Deploying production environment..."
    
    # Build new images
    build_prod
    
    # Stop existing services
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
    
    # Start with new images
    start_prod
    
    print_info "Production deployment completed!"
}

# Function to show logs
logs() {
    if [ -n "$1" ]; then
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f "$1"
    else
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f
    fi
}

# Function to show status
status() {
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps
}

# Function to backup database
backup_db() {
    print_info "Creating database backup..."
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec supabase-db pg_dump -U postgres postgres > "$BACKUP_FILE"
    print_info "Database backup created: $BACKUP_FILE"
}

# Function to restore database
restore_db() {
    if [ -z "$1" ]; then
        print_error "Please provide backup file path"
        print_error "Usage: $0 restore-db <backup_file>"
        exit 1
    fi
    
    if [ ! -f "$1" ]; then
        print_error "Backup file not found: $1"
        exit 1
    fi
    
    print_warning "This will restore the database from backup: $1"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Restoring database from backup..."
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec -T supabase-db psql -U postgres postgres < "$1"
        print_info "Database restore completed!"
    else
        print_info "Database restore cancelled."
    fi
}

# Function to update Supabase
update_supabase() {
    print_info "Updating Supabase services..."
    
    if command -v supabase &> /dev/null; then
        # Create backup before update
        backup_db
        
        # Push any local migrations to production
        print_info "Pushing migrations to production..."
        supabase db push --include-all
        
        print_info "Supabase update completed!"
    else
        print_error "Supabase CLI not found. Please install it first:"
        print_error "npm install -g supabase"
    fi
}

# Function to show help
show_help() {
    echo "Teller Plan Magic - Docker Production Helper"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build       Build production images"
    echo "  start       Start the production environment"
    echo "  stop        Stop the production environment"
    echo "  deploy      Deploy production environment (build + start)"
    echo "  logs [service]  Show logs (optionally for specific service)"
    echo "  status      Show status of all services"
    echo "  backup-db   Create database backup"
    echo "  restore-db <file>  Restore database from backup"
    echo "  update-supabase  Update Supabase and push migrations"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy"
    echo "  $0 logs app"
    echo "  $0 backup-db"
    echo "  $0 restore-db backup_20240101_120000.sql"
}

# Main script logic
case "$1" in
    "build")
        check_dependencies
        build_prod
        ;;
    "start")
        check_dependencies
        start_prod
        ;;
    "stop")
        stop_prod
        ;;
    "deploy")
        check_dependencies
        deploy_prod
        ;;
    "logs")
        logs "$2"
        ;;
    "status")
        status
        ;;
    "backup-db")
        backup_db
        ;;
    "restore-db")
        restore_db "$2"
        ;;
    "update-supabase")
        update_supabase
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