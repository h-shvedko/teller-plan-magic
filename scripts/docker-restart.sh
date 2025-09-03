#!/bin/bash

# Teller Plan Magic - Restart Existing Docker Environment Script
# This script restarts a previously set up Docker environment that has been stopped
# It preserves existing data and runs any new migrations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${CYAN}[SUCCESS]${NC} $1"
}

# Function to check if Docker and Docker Compose are installed
check_dependencies() {
    print_step "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Dependencies check passed!"
}

# Function to check if this is an existing environment
check_existing_environment() {
    print_step "Checking for existing Docker environment..."
    
    # Check for volumes
    local volumes_exist=false
    if docker volume ls | grep -q "teller-plan-magic_supabase-db-data"; then
        volumes_exist=true
        print_info "Found existing database volume"
    fi
    
    if docker volume ls | grep -q "teller-plan-magic_supabase-storage-data"; then
        volumes_exist=true
        print_info "Found existing storage volume"
    fi
    
    # Check for stopped containers
    local containers_exist=false
    if docker ps -a --filter "name=teller-plan-magic" --format "{{.Names}}" | grep -q "teller-plan-magic"; then
        containers_exist=true
        print_info "Found existing containers"
    fi
    
    if [ "$volumes_exist" = false ] && [ "$containers_exist" = false ]; then
        print_warning "No existing Docker environment found."
        print_warning "This script is for restarting existing environments."
        print_warning "To start fresh, use: ./scripts/docker-fresh-start.sh"
        
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Operation cancelled."
            exit 0
        fi
    fi
    
    print_success "Existing environment detected or user confirmed to continue!"
}

# Function to prepare environment
prepare_environment() {
    print_step "Preparing environment..."
    
    # Copy development environment file if it doesn't exist
    if [ ! -f .env ]; then
        if [ -f .env.docker ]; then
            cp .env.docker .env
            print_info "Copied .env.docker to .env"
        else
            print_warning "No .env.docker file found. Creating basic environment..."
            cat > .env << 'EOF'
# Development Environment
NODE_ENV=development
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsaG9zdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzA5Nzg2NDAwLCJleHAiOjIwMjUzNjI0MDB9.4t8lQ7NQgDJN8VWNpqpQX4vZJYQjmXa9O7V6M3QNYnE
POSTGRES_PASSWORD=postgres
JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long
EOF
        fi
    fi
    
    # Create necessary directories if they don't exist
    mkdir -p logs backups
    
    print_success "Environment prepared!"
}

# Function to clean up only stopped/dead containers
cleanup_dead_containers() {
    print_step "Cleaning up dead containers and networks..."
    
    # Remove only stopped containers for this project
    docker ps -a --filter "status=exited" --filter "name=teller-plan-magic" -q | xargs -r docker rm 2>/dev/null || true
    
    # Remove dead containers
    docker ps -a --filter "status=dead" --filter "name=teller-plan-magic" -q | xargs -r docker rm 2>/dev/null || true
    
    # Clean up unused networks (but preserve volumes)
    docker network prune -f 2>/dev/null || true
    
    print_success "Dead containers cleaned up!"
}

# Function to start services with existing data
start_services() {
    print_step "Starting Docker services..."
    
    # First, check if we need to rebuild images
    local rebuild_needed=false
    if [ ! "$(docker images -q teller-plan-magic-app 2>/dev/null)" ]; then
        rebuild_needed=true
        print_info "Application image not found, will rebuild..."
    fi
    
    # Check if any Dockerfile has been modified recently (within last hour)
    if [ -f "Dockerfile" ] && [ "$(find . -name "Dockerfile" -newermt '1 hour ago' | wc -l)" -gt 0 ]; then
        rebuild_needed=true
        print_info "Dockerfile modified recently, will rebuild..."
    fi
    
    if [ "$rebuild_needed" = true ]; then
        print_info "Building Docker images..."
        docker-compose build
    fi
    
    # Start database first to ensure it's ready
    print_info "Starting database service..."
    docker-compose up -d supabase-db
    
    # Wait for database to be ready
    print_info "Waiting for database to be ready..."
    local max_attempts=20
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose exec -T supabase-db pg_isready -U postgres -h localhost > /dev/null 2>&1; then
            print_success "Database is ready!"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "Database failed to start after ${max_attempts} attempts"
            print_error "Checking database logs:"
            docker-compose logs supabase-db
            exit 1
        fi
        
        print_info "Waiting for database... (attempt $attempt/$max_attempts)"
        sleep 3
        ((attempt++))
    done
    
    # Start all services
    print_info "Starting all services..."
    docker-compose up -d
    
    print_success "All services started!"
}

# Function to wait for all services to be ready
wait_for_services() {
    print_step "Waiting for all services to be ready..."
    
    local services=("supabase-api" "supabase-storage" "supabase-rest")
    local max_wait=60
    local elapsed=0
    
    while [ $elapsed -lt $max_wait ]; do
        local healthy_count=0
        
        for service in "${services[@]}"; do
            if docker-compose ps "$service" | grep -q "Up"; then
                ((healthy_count++))
            fi
        done
        
        if [ $healthy_count -eq ${#services[@]} ]; then
            print_success "All core services are running!"
            break
        fi
        
        print_info "Waiting for services... ($healthy_count/${#services[@]} ready, ${elapsed}s elapsed)"
        sleep 5
        ((elapsed+=5))
    done
    
    if [ $elapsed -ge $max_wait ]; then
        print_warning "Some services may still be starting up, but continuing..."
        print_info "Check service status with: docker-compose ps"
    fi
}

# Function to run new migrations only
run_new_migrations() {
    print_step "Checking for new migrations..."
    
    # Check if migration tracking table exists
    local migration_table_exists=false
    if docker-compose exec -T supabase-db psql -U postgres -d postgres -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'schema_migrations');" -t | grep -q "t"; then
        migration_table_exists=true
        print_info "Migration tracking table exists"
    else
        print_info "Creating migration tracking table..."
        docker-compose exec -T supabase-db psql -U postgres -d postgres << 'EOSQL'
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EOSQL
    fi
    
    # Run Supabase migrations with Supabase CLI if available
    if command -v supabase &> /dev/null; then
        print_info "Using Supabase CLI to check for new migrations..."
        if supabase db diff --local --linked > /dev/null 2>&1; then
            print_info "Applying new migrations with Supabase CLI..."
            supabase db push --local --include-all
            print_success "Supabase migrations updated!"
        else
            print_info "No new Supabase migrations to apply"
        fi
    else
        print_info "Supabase CLI not available, checking manually..."
        check_manual_migrations
    fi
}

# Function to check and apply manual migrations
check_manual_migrations() {
    local new_migrations_found=false
    
    # Check Supabase migrations
    if [ -d "supabase/migrations" ]; then
        for migration in supabase/migrations/*.sql; do
            if [ -f "$migration" ]; then
                local migration_name=$(basename "$migration" .sql)
                # Check if this migration has been applied
                local applied=$(docker-compose exec -T supabase-db psql -U postgres -d postgres -t -c "SELECT COUNT(*) FROM schema_migrations WHERE version = '$migration_name';" 2>/dev/null | xargs || echo "0")
                
                if [ "$applied" = "0" ]; then
                    print_info "Applying new migration: $migration_name"
                    docker-compose exec -T supabase-db psql -U postgres -d postgres -f - < "$migration"
                    docker-compose exec -T supabase-db psql -U postgres -d postgres -c "INSERT INTO schema_migrations (version) VALUES ('$migration_name') ON CONFLICT (version) DO NOTHING;"
                    new_migrations_found=true
                fi
            fi
        done
    fi
    
    # Check custom migrations
    if [ -d "db/migrations" ]; then
        for migration in db/migrations/*.sql; do
            if [ -f "$migration" ]; then
                local migration_name=$(basename "$migration" .sql)
                # Check if this migration has been applied
                local applied=$(docker-compose exec -T supabase-db psql -U postgres -d postgres -t -c "SELECT COUNT(*) FROM schema_migrations WHERE version = '$migration_name';" 2>/dev/null | xargs || echo "0")
                
                if [ "$applied" = "0" ]; then
                    print_info "Applying new custom migration: $migration_name"
                    docker-compose exec -T supabase-db psql -U postgres -d postgres -f - < "$migration"
                    docker-compose exec -T supabase-db psql -U postgres -d postgres -c "INSERT INTO schema_migrations (version) VALUES ('$migration_name') ON CONFLICT (version) DO NOTHING;"
                    new_migrations_found=true
                fi
            fi
        done
    fi
    
    if [ "$new_migrations_found" = false ]; then
        print_info "No new migrations to apply"
    else
        print_success "New migrations applied successfully!"
    fi
}

# Function to verify the restart
verify_restart() {
    print_step "Verifying environment restart..."
    
    # Check service status
    print_info "Checking service status..."
    docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
    
    # Test database connectivity
    print_info "Testing database connectivity..."
    if docker-compose exec -T supabase-db psql -U postgres -d postgres -c "SELECT 'Database OK' as status;" > /dev/null 2>&1; then
        print_success "Database: Connected"
    else
        print_error "Database: Connection failed"
    fi
    
    # Test API endpoints (with retries)
    print_info "Testing API endpoints..."
    local api_ready=false
    for i in {1..5}; do
        if curl -s http://localhost:54321/health > /dev/null 2>&1; then
            api_ready=true
            break
        fi
        sleep 2
    done
    
    if [ "$api_ready" = true ]; then
        print_success "Supabase API: Ready"
    else
        print_warning "Supabase API: Not responding (may still be starting)"
    fi
    
    # Show data preservation status
    print_info "Checking data preservation..."
    local table_count=$(docker-compose exec -T supabase-db psql -U postgres -d postgres -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs || echo "0")
    
    if [ "$table_count" -gt 0 ]; then
        print_success "Database tables preserved: $table_count tables found"
    else
        print_info "Database appears to be empty (this might be expected for a new setup)"
    fi
}

# Function to show service information
show_service_info() {
    print_success ""
    print_success "🎉 Docker environment restarted successfully!"
    print_success ""
    print_success "Services are available at:"
    echo "🚀 React Application: http://localhost:8080"
    echo "🗄️  Supabase Studio: http://localhost:54324"
    echo "🔗 Supabase API: http://localhost:54321"
    echo "📊 Database: postgresql://postgres:postgres@localhost:54322/postgres"
    echo "📧 Email Testing: http://localhost:54325"
    echo ""
    
    print_info "Useful commands:"
    echo "• docker-compose logs -f          # View all logs"
    echo "• docker-compose ps               # Check status"
    echo "• ./scripts/docker-dev.sh logs    # View logs with helper"
    echo "• ./scripts/docker-dev.sh status  # Check status with helper"
    echo ""
    
    # Check for any services that might still be starting
    local starting_services=$(docker-compose ps --format "{{.Service}}" --filter "status=starting" | wc -l)
    if [ "$starting_services" -gt 0 ]; then
        print_warning "Note: Some services may still be starting up."
        print_warning "If you experience issues, wait a minute and try again."
    fi
}

# Function to handle different restart scenarios
handle_restart_scenario() {
    print_step "Determining restart scenario..."
    
    # Check what's currently running
    local running_containers=$(docker-compose ps --filter "status=running" --format "{{.Service}}" | wc -l)
    local stopped_containers=$(docker-compose ps --filter "status=exited" --format "{{.Service}}" | wc -l)
    local all_containers=$(docker-compose ps --format "{{.Service}}" | wc -l)
    
    if [ "$running_containers" -eq 0 ] && [ "$stopped_containers" -gt 0 ]; then
        print_info "Scenario: All services stopped - performing full restart"
        return 0
    elif [ "$running_containers" -gt 0 ] && [ "$running_containers" -lt "$all_containers" ]; then
        print_info "Scenario: Partial services running - restarting all"
        docker-compose down
        return 0
    elif [ "$running_containers" -gt 0 ] && [ "$all_containers" -gt 0 ]; then
        print_warning "Some services are already running."
        print_warning "Current status:"
        docker-compose ps --format "table {{.Service}}\t{{.Status}}"
        
        read -p "Restart all services anyway? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Restarting all services..."
            docker-compose down
            return 0
        else
            print_info "Skipping service restart, will check for migrations only"
            return 1
        fi
    else
        print_info "Scenario: Clean start - no existing containers"
        return 0
    fi
}

# Main script execution
main() {
    print_info "Restarting Teller Plan Magic Docker Environment..."
    print_info "================================================="
    
    # Check dependencies
    check_dependencies
    
    # Check for existing environment
    check_existing_environment
    
    # Prepare environment
    prepare_environment
    
    # Handle restart scenario
    if handle_restart_scenario; then
        # Clean up dead containers
        cleanup_dead_containers
        
        # Start services
        start_services
        
        # Wait for services to be ready
        wait_for_services
    else
        print_info "Services already running, skipping restart..."
    fi
    
    # Always check for new migrations
    run_new_migrations
    
    # Verify the restart
    verify_restart
    
    # Show service information
    show_service_info
}

# Script arguments handling
case "${1:-}" in
    "--force")
        print_info "Force restart requested - stopping all services first"
        docker-compose down 2>/dev/null || true
        ;;
    "--help"|"-h")
        echo "Teller Plan Magic - Docker Restart Script"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --force    Force restart by stopping all services first"
        echo "  --help     Show this help message"
        echo ""
        echo "This script restarts an existing Docker environment while preserving data"
        echo "and applying any new migrations."
        exit 0
        ;;
esac

# Execute main function
main "$@"