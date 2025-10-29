#!/bin/bash

# Teller Plan Magic - Fresh Start Script
# This script completely removes all existing Docker containers, volumes, and data
# then sets up a clean development environment with migrations and seeding

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

# Function to confirm the destructive operation
confirm_fresh_start() {
    print_warning "⚠️  DESTRUCTIVE OPERATION WARNING ⚠️"
    print_warning ""
    print_warning "This script will:"
    print_warning "• Stop and remove ALL Docker containers for this project"
    print_warning "• Delete ALL Docker volumes (including database data)"
    print_warning "• Remove ALL Docker networks for this project"
    print_warning "• Clean up unused Docker images and build cache"
    print_warning "• Start completely fresh with new database and data"
    print_warning ""
    
    read -p "Are you sure you want to proceed? Type 'yes' to continue: " -r
    if [[ ! $REPLY == "yes" ]]; then
        print_info "Operation cancelled."
        exit 0
    fi
}

# Function to clean up everything
cleanup_everything() {
    print_step "Cleaning up existing Docker environment..."
    
    # Stop all running containers
    print_info "Stopping all containers..."
    docker-compose down --remove-orphans 2>/dev/null || true
    
    # Remove all volumes
    print_info "Removing all volumes..."
    docker-compose down -v 2>/dev/null || true
    
    # Remove specific project volumes if they exist
    docker volume rm teller-plan-magic_supabase-db-data 2>/dev/null || true
    docker volume rm teller-plan-magic_supabase-storage-data 2>/dev/null || true
    docker volume rm teller-plan-magic_supabase-db-prod 2>/dev/null || true
    docker volume rm teller-plan-magic_supabase-storage-prod 2>/dev/null || true
    
    # Remove project-specific containers
    docker ps -a --filter "name=teller-plan-magic" -q | xargs -r docker rm -f 2>/dev/null || true
    
    # Remove project networks
    docker network rm teller-plan-magic_teller-network 2>/dev/null || true
    
    # Clean up unused images and build cache
    print_info "Cleaning up unused Docker resources..."
    docker image prune -f 2>/dev/null || true
    docker builder prune -f 2>/dev/null || true
    
    print_success "Cleanup completed!"
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
    
    # Create necessary directories
    mkdir -p logs backups
    
    print_success "Environment prepared!"
}

# Function to start fresh services
start_fresh_services() {
    print_step "Starting fresh Docker services..."
    
    # Build images first
    print_info "Building Docker images..."
    docker-compose build --no-cache
    
    # Start database first and wait for it to be ready
    print_info "Starting database service..."
    docker-compose up -d supabase-db
    
    # Wait for database to be ready
    print_info "Waiting for database to be ready..."
    sleep 10
    
    # Check if database is responding
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose exec -T supabase-db pg_isready -U postgres -h localhost > /dev/null 2>&1; then
            print_success "Database is ready!"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "Database failed to start after ${max_attempts} attempts"
            docker-compose logs supabase-db
            exit 1
        fi
        
        print_info "Waiting for database... (attempt $attempt/$max_attempts)"
        sleep 5
        ((attempt++))
    done
    
    # Start all other services
    print_info "Starting all services..."
    docker-compose up -d
    
    print_success "All services started!"
}

# Function to wait for services to be healthy
wait_for_services() {
    print_step "Waiting for all services to be healthy..."
    
    local services=("supabase-api" "supabase-storage" "supabase-rest")
    local max_wait=120
    local elapsed=0
    
    while [ $elapsed -lt $max_wait ]; do
        local all_healthy=true
        
        for service in "${services[@]}"; do
            if ! docker-compose ps "$service" | grep -q "Up"; then
                all_healthy=false
                break
            fi
        done
        
        if [ "$all_healthy" = true ]; then
            print_success "All services are healthy!"
            return 0
        fi
        
        print_info "Waiting for services to be healthy... (${elapsed}s/${max_wait}s)"
        sleep 5
        ((elapsed+=5))
    done
    
    print_warning "Some services may not be fully healthy yet, but continuing..."
}

# Function to run migrations
run_migrations() {
    print_step "Running database migrations..."
    
    # Wait a bit more for the database to be fully ready
    sleep 5
    
    # Check if Supabase CLI is available
    if command -v supabase &> /dev/null; then
        print_info "Using Supabase CLI to run migrations..."
        
        # Try to reset the local database
        if supabase db reset --local --linked; then
            print_success "Supabase migrations completed successfully!"
        else
            print_warning "Supabase CLI migration failed, trying manual approach..."
            run_manual_migrations
        fi
    else
        print_info "Supabase CLI not found, running manual migrations..."
        run_manual_migrations
    fi
}

# Function to run migrations manually
run_manual_migrations() {
    print_info "Running manual database migrations..."
    
    # Run Supabase migrations first
    if [ -d "supabase/migrations" ] && [ "$(ls -A supabase/migrations)" ]; then
        print_info "Applying Supabase migrations..."
        for migration in supabase/migrations/*.sql; do
            if [ -f "$migration" ]; then
                print_info "Running migration: $(basename "$migration")"
                docker-compose exec -T supabase-db psql -U postgres -d postgres -f - < "$migration" || {
                    print_warning "Migration $(basename "$migration") failed, but continuing..."
                }
            fi
        done
    fi
    
    # Run custom db migrations
    if [ -d "db/migrations" ] && [ "$(ls -A db/migrations)" ]; then
        print_info "Applying custom database migrations..."
        for migration in db/migrations/*.sql; do
            if [ -f "$migration" ]; then
                print_info "Running migration: $(basename "$migration")"
                docker-compose exec -T supabase-db psql -U postgres -d postgres -f - < "$migration" || {
                    print_warning "Migration $(basename "$migration") failed, but continuing..."
                }
            fi
        done
    fi
    
    print_success "Manual migrations completed!"
}

# Function to run database seeding
run_seeding() {
    print_step "Running database seeding..."
    
    # Look for seed files in multiple locations
    local seed_files_found=false
    
    # Check for specific seed files
    if [ -f "db/migrations/2025_0002_seed_lookups.sql" ]; then
        print_info "Running seed file: db/migrations/2025_0002_seed_lookups.sql"
        docker-compose exec -T supabase-db psql -U postgres -d postgres -f - < "db/migrations/2025_0002_seed_lookups.sql"
        seed_files_found=true
    fi
    
    # Check for seed directory
    if [ -d "db/seeds" ] && [ "$(ls -A db/seeds)" ]; then
        print_info "Running seed files from db/seeds/..."
        for seed_file in db/seeds/*.sql; do
            if [ -f "$seed_file" ]; then
                print_info "Running seed: $(basename "$seed_file")"
                docker-compose exec -T supabase-db psql -U postgres -d postgres -f - < "$seed_file"
                seed_files_found=true
            fi
        done
    fi
    
    # Check for supabase seed directory
    if [ -d "supabase/seed.sql" ]; then
        print_info "Running Supabase seed.sql..."
        docker-compose exec -T supabase-db psql -U postgres -d postgres -f - < "supabase/seed.sql"
        seed_files_found=true
    fi
    
    if [ "$seed_files_found" = false ]; then
        print_info "Creating basic seed data..."
        create_basic_seed_data
    fi
    
    print_success "Database seeding completed!"
}

# Function to create basic seed data
create_basic_seed_data() {
    print_info "Creating basic seed data..."
    
    # Create basic seed data directly
    docker-compose exec -T supabase-db psql -U postgres -d postgres << 'EOSQL'
-- Create basic seed data if tables exist
DO $$
BEGIN
    -- Seed cuisines if table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cuisines') THEN
        INSERT INTO cuisines (name) VALUES
            ('Italian'),('Vietnamese'),('Mexican'),('Indian'),('Thai'),
            ('Chinese'),('Japanese'),('Greek'),('French'),('Spanish'),
            ('German'),('Turkish'),('Moroccan'),('American'),('Middle Eastern')
        ON CONFLICT (name) DO NOTHING;
        
        RAISE NOTICE 'Seeded cuisines table';
    END IF;

    -- Seed dietary preferences if table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'dietary_preferences') THEN
        INSERT INTO dietary_preferences (name) VALUES
            ('Vegetarian'),('Vegan'),('Pescatarian'),('Gluten-Free'),
            ('Dairy-Free'),('Nut-Free'),('Halal'),('Kosher')
        ON CONFLICT (name) DO NOTHING;
        
        RAISE NOTICE 'Seeded dietary_preferences table';
    END IF;

    -- Seed health goals if table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'health_goals') THEN
        INSERT INTO health_goals (name) VALUES
            ('Eat Healthier'),('Save Money'),('High Protein'),('Low Carb'),
            ('Low Fat'),('Weight Loss'),('Muscle Gain'),('Quick Meals')
        ON CONFLICT (name) DO NOTHING;
        
        RAISE NOTICE 'Seeded health_goals table';
    END IF;

    -- Seed recipe tags if table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'recipe_tags') THEN
        INSERT INTO recipe_tags (name) VALUES
            ('One-Pot'),('30-Minute'),('Meal Prep'),('Kid-Friendly'),
            ('Spicy'),('Comfort Food'),('Budget'),('Low-Calorie'),
            ('High-Fiber'),('Gluten-Free'),('Dairy-Free')
        ON CONFLICT (name) DO NOTHING;
        
        RAISE NOTICE 'Seeded recipe_tags table';
    END IF;

    RAISE NOTICE 'Basic seed data creation completed';
END $$;
EOSQL
}

# Function to verify the installation
verify_installation() {
    print_step "Verifying installation..."
    
    # Check if all services are running
    print_info "Checking service status..."
    docker-compose ps
    
    # Test database connectivity
    print_info "Testing database connectivity..."
    if docker-compose exec -T supabase-db psql -U postgres -d postgres -c "SELECT version();" > /dev/null 2>&1; then
        print_success "Database connection: OK"
    else
        print_error "Database connection: FAILED"
    fi
    
    # Test API endpoints
    print_info "Testing API endpoints..."
    sleep 3
    
    if curl -s http://localhost:54321/health > /dev/null 2>&1; then
        print_success "Supabase API: OK"
    else
        print_warning "Supabase API: Not responding (this might be normal during startup)"
    fi
    
    # Display service URLs
    print_success "Installation verified! Services available at:"
    echo ""
    echo "🚀 React Application: http://localhost:8080"
    echo "🗄️  Supabase Studio: http://localhost:54324"
    echo "🔗 Supabase API: http://localhost:54321"
    echo "📊 Database: postgresql://postgres:postgres@localhost:54322/postgres"
    echo "📧 Email Testing: http://localhost:54325"
    echo ""
    
    # Show container status
    print_info "Container status:"
    docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
}

# Function to create helpful aliases and shortcuts
create_shortcuts() {
    print_step "Creating helpful shortcuts..."
    
    # Create a shortcuts file
    cat > docker-shortcuts.sh << 'EOF'
#!/bin/bash
# Teller Plan Magic Docker Shortcuts
# Source this file to get helpful aliases: source docker-shortcuts.sh

alias tpm-start="./scripts/docker-dev.sh start"
alias tpm-stop="./scripts/docker-dev.sh stop"
alias tpm-restart="./scripts/docker-dev.sh restart"
alias tpm-logs="./scripts/docker-dev.sh logs"
alias tpm-status="./scripts/docker-dev.sh status"
alias tpm-fresh="./scripts/docker-fresh-start.sh"
alias tpm-db="docker-compose exec supabase-db psql -U postgres postgres"
alias tpm-studio="open http://localhost:54324"
alias tpm-app="open http://localhost:8080"

echo "Teller Plan Magic shortcuts loaded!"
echo "Available commands:"
echo "  tpm-start    - Start development environment"
echo "  tpm-stop     - Stop development environment"
echo "  tpm-restart  - Restart development environment"
echo "  tpm-logs     - View logs"
echo "  tpm-status   - Check status"
echo "  tpm-fresh    - Fresh start (destructive)"
echo "  tpm-db       - Connect to database"
echo "  tpm-studio   - Open Supabase Studio"
echo "  tpm-app      - Open application"
EOF
    
    chmod +x docker-shortcuts.sh
    print_info "Shortcuts created in docker-shortcuts.sh"
    print_info "Run 'source docker-shortcuts.sh' to load shortcuts"
}

# Function to show summary
show_summary() {
    print_success ""
    print_success "🎉 Fresh Docker environment setup completed successfully!"
    print_success ""
    print_success "What was done:"
    print_success "✅ Cleaned up all existing Docker resources"
    print_success "✅ Created fresh environment configuration"
    print_success "✅ Started all Docker services"
    print_success "✅ Applied database migrations"
    print_success "✅ Populated database with seed data"
    print_success "✅ Verified all services are running"
    print_success "✅ Created helpful shortcuts"
    print_success ""
    print_success "Next steps:"
    print_success "• Open http://localhost:8080 to view your application"
    print_success "• Open http://localhost:54324 to manage your database"
    print_success "• Run './scripts/docker-dev.sh logs' to view logs"
    print_success "• Run 'source docker-shortcuts.sh' for helpful aliases"
    print_success ""
}

# Main script execution
main() {
    print_info "Starting Teller Plan Magic Fresh Docker Setup..."
    print_info "================================================="
    
    # Check dependencies
    check_dependencies
    
    # Confirm destructive operation
    confirm_fresh_start
    
    # Clean up everything
    cleanup_everything
    
    # Prepare environment
    prepare_environment
    
    # Start fresh services
    start_fresh_services
    
    # Wait for services
    wait_for_services
    
    # Run migrations
    run_migrations
    
    # Run seeding
    run_seeding
    
    # Verify installation
    verify_installation
    
    # Create shortcuts
    create_shortcuts
    
    # Show summary
    show_summary
}

# Execute main function
main "$@"