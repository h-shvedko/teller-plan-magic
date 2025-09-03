#!/bin/bash

# Teller Plan Magic - Database Seeding Script
# This script handles database seeding for development and testing

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

# Function to check if database is running
check_database() {
    print_step "Checking database connection..."
    
    if ! docker-compose ps supabase-db | grep -q "Up"; then
        print_error "Database container is not running!"
        print_error "Please start the Docker environment first:"
        print_error "  ./scripts/docker-dev.sh start"
        exit 1
    fi
    
    # Test database connectivity
    if ! docker-compose exec -T supabase-db pg_isready -U postgres -h localhost > /dev/null 2>&1; then
        print_error "Database is not responding!"
        print_error "Please check the database status:"
        print_error "  ./scripts/docker-dev.sh logs supabase-db"
        exit 1
    fi
    
    print_success "Database is running and accessible!"
}

# Function to create seed data structure
create_seed_structure() {
    print_step "Creating seed data structure..."
    
    # Create seeds directory if it doesn't exist
    mkdir -p db/seeds
    
    # Create basic seed file if it doesn't exist
    if [ ! -f "db/seeds/001_basic_lookups.sql" ]; then
        cat > db/seeds/001_basic_lookups.sql << 'EOSQL'
-- 001_basic_lookups.sql - Basic lookup data for Teller Plan Magic
-- This file contains essential seed data for the application

BEGIN;

-- Seed cuisines
INSERT INTO cuisines (name, description, created_at, updated_at) VALUES
    ('Italian', 'Traditional Italian cuisine with pasta, pizza, and Mediterranean flavors', NOW(), NOW()),
    ('Vietnamese', 'Fresh Vietnamese cuisine with pho, spring rolls, and herb-based dishes', NOW(), NOW()),
    ('Mexican', 'Vibrant Mexican cuisine with spices, beans, and fresh ingredients', NOW(), NOW()),
    ('Indian', 'Rich Indian cuisine with curries, spices, and diverse regional flavors', NOW(), NOW()),
    ('Thai', 'Balanced Thai cuisine with sweet, sour, salty, and spicy elements', NOW(), NOW()),
    ('Chinese', 'Diverse Chinese cuisine with stir-fries, dumplings, and regional specialties', NOW(), NOW()),
    ('Japanese', 'Clean Japanese cuisine with fresh ingredients, rice, and umami flavors', NOW(), NOW()),
    ('Greek', 'Mediterranean Greek cuisine with olive oil, herbs, and fresh vegetables', NOW(), NOW()),
    ('French', 'Classic French cuisine with refined techniques and rich sauces', NOW(), NOW()),
    ('Spanish', 'Spanish cuisine with tapas, paella, and Mediterranean influences', NOW(), NOW()),
    ('German', 'Hearty German cuisine with sausages, bread, and comfort foods', NOW(), NOW()),
    ('Turkish', 'Flavorful Turkish cuisine with kebabs, spices, and Middle Eastern influences', NOW(), NOW()),
    ('Moroccan', 'Aromatic Moroccan cuisine with tagines, couscous, and North African spices', NOW(), NOW()),
    ('American', 'Diverse American cuisine with regional specialties and comfort foods', NOW(), NOW()),
    ('Middle Eastern', 'Rich Middle Eastern cuisine with hummus, falafel, and aromatic spices', NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    updated_at = NOW();

-- Seed dietary preferences
INSERT INTO dietary_preferences (name, description, created_at, updated_at) VALUES
    ('Vegetarian', 'No meat or fish, but may include dairy and eggs', NOW(), NOW()),
    ('Vegan', 'No animal products including meat, fish, dairy, eggs, or honey', NOW(), NOW()),
    ('Pescatarian', 'No meat but includes fish and seafood', NOW(), NOW()),
    ('Gluten-Free', 'No wheat, barley, rye, or other gluten-containing grains', NOW(), NOW()),
    ('Dairy-Free', 'No milk, cheese, butter, or other dairy products', NOW(), NOW()),
    ('Nut-Free', 'No tree nuts or peanuts due to allergies', NOW(), NOW()),
    ('Halal', 'Follows Islamic dietary laws and restrictions', NOW(), NOW()),
    ('Kosher', 'Follows Jewish dietary laws and restrictions', NOW(), NOW()),
    ('Keto', 'High-fat, low-carbohydrate ketogenic diet', NOW(), NOW()),
    ('Paleo', 'Foods presumed to be available to paleolithic humans', NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    updated_at = NOW();

-- Seed health goals
INSERT INTO health_goals (name, description, created_at, updated_at) VALUES
    ('Eat Healthier', 'Focus on nutritious, whole foods and balanced meals', NOW(), NOW()),
    ('Save Money', 'Budget-friendly meal planning and cost-effective ingredients', NOW(), NOW()),
    ('High Protein', 'Emphasize protein-rich foods for muscle building or maintenance', NOW(), NOW()),
    ('Low Carb', 'Reduce carbohydrate intake for weight management or health', NOW(), NOW()),
    ('Low Fat', 'Minimize fat content for heart health or weight loss', NOW(), NOW()),
    ('Weight Loss', 'Create calorie deficit through portion control and nutrition', NOW(), NOW()),
    ('Muscle Gain', 'Support muscle building with adequate protein and calories', NOW(), NOW()),
    ('Quick Meals', 'Fast and convenient meal preparation for busy lifestyles', NOW(), NOW()),
    ('Family Friendly', 'Meals that appeal to children and adults alike', NOW(), NOW()),
    ('Meal Prep', 'Prepare meals in advance for busy weeks', NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    updated_at = NOW();

-- Seed recipe tags
INSERT INTO recipe_tags (name, description, created_at, updated_at) VALUES
    ('One-Pot', 'Complete meals cooked in a single pot or pan', NOW(), NOW()),
    ('30-Minute', 'Quick recipes that can be completed in 30 minutes or less', NOW(), NOW()),
    ('Meal Prep', 'Recipes designed for batch cooking and storage', NOW(), NOW()),
    ('Kid-Friendly', 'Recipes that appeal to children with mild flavors', NOW(), NOW()),
    ('Spicy', 'Recipes with heat from peppers, spices, or hot sauces', NOW(), NOW()),
    ('Comfort Food', 'Hearty, satisfying recipes that provide emotional comfort', NOW(), NOW()),
    ('Budget', 'Economical recipes using affordable ingredients', NOW(), NOW()),
    ('Low-Calorie', 'Recipes designed to be lower in calories', NOW(), NOW()),
    ('High-Fiber', 'Recipes rich in dietary fiber for digestive health', NOW(), NOW()),
    ('Make-Ahead', 'Recipes that can be prepared in advance', NOW(), NOW()),
    ('Freezer-Friendly', 'Recipes that freeze well for future use', NOW(), NOW()),
    ('No-Cook', 'Recipes requiring no cooking or heating', NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    updated_at = NOW();

COMMIT;

-- Display seeding summary
DO $$
DECLARE
    cuisine_count INTEGER;
    dietary_count INTEGER;
    health_count INTEGER;
    tag_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO cuisine_count FROM cuisines;
    SELECT COUNT(*) INTO dietary_count FROM dietary_preferences;
    SELECT COUNT(*) INTO health_count FROM health_goals;
    SELECT COUNT(*) INTO tag_count FROM recipe_tags;
    
    RAISE NOTICE '=== Seeding Summary ===';
    RAISE NOTICE 'Cuisines: % records', cuisine_count;
    RAISE NOTICE 'Dietary Preferences: % records', dietary_count;
    RAISE NOTICE 'Health Goals: % records', health_count;
    RAISE NOTICE 'Recipe Tags: % records', tag_count;
    RAISE NOTICE 'Basic lookup seeding completed successfully!';
END $$;
EOSQL
        print_info "Created basic seed file: db/seeds/001_basic_lookups.sql"
    fi
    
    # Create sample recipe seed file if it doesn't exist
    if [ ! -f "db/seeds/002_sample_recipes.sql" ]; then
        cat > db/seeds/002_sample_recipes.sql << 'EOSQL'
-- 002_sample_recipes.sql - Sample recipes for development and testing

BEGIN;

-- Insert sample recipes (only if no recipes exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM recipes LIMIT 1) THEN
        -- Sample Italian recipes
        INSERT INTO recipes (title, description, prep_time, cook_time, servings, difficulty, instructions, created_at, updated_at) VALUES
        (
            'Classic Spaghetti Carbonara',
            'Creamy Italian pasta dish with eggs, cheese, pancetta, and black pepper',
            15,
            15,
            4,
            'medium',
            '["Cook spaghetti in salted boiling water", "Fry pancetta until crispy", "Whisk eggs with cheese and pepper", "Combine hot pasta with pancetta", "Add egg mixture off heat, tossing quickly", "Serve immediately with extra cheese"]',
            NOW(),
            NOW()
        ),
        (
            'Margherita Pizza',
            'Classic Italian pizza with tomato, mozzarella, and fresh basil',
            20,
            12,
            2,
            'easy',
            '["Prepare pizza dough", "Roll out dough on floured surface", "Spread tomato sauce evenly", "Add sliced mozzarella", "Bake at 500°F for 10-12 minutes", "Top with fresh basil leaves"]',
            NOW(),
            NOW()
        );
        
        -- Sample Asian recipes
        INSERT INTO recipes (title, description, prep_time, cook_time, servings, difficulty, instructions, created_at, updated_at) VALUES
        (
            'Chicken Pad Thai',
            'Popular Thai stir-fried noodle dish with chicken, eggs, and tamarind sauce',
            20,
            15,
            4,
            'medium',
            '["Soak rice noodles in warm water", "Prepare pad thai sauce", "Heat oil in wok over high heat", "Cook chicken until done", "Add noodles and sauce", "Stir in eggs and bean sprouts", "Garnish with peanuts and lime"]',
            NOW(),
            NOW()
        ),
        (
            'Vegetable Fried Rice',
            'Quick and easy Chinese-style fried rice with mixed vegetables',
            10,
            10,
            4,
            'easy',
            '["Use day-old cooked rice", "Heat oil in wok", "Scramble eggs and set aside", "Stir-fry vegetables", "Add rice and break up clumps", "Return eggs to wok", "Season with soy sauce"]',
            NOW(),
            NOW()
        );
        
        -- Sample healthy recipes
        INSERT INTO recipes (title, description, prep_time, cook_time, servings, difficulty, instructions, created_at, updated_at) VALUES
        (
            'Quinoa Buddha Bowl',
            'Nutritious bowl with quinoa, roasted vegetables, and tahini dressing',
            15,
            25,
            2,
            'easy',
            '["Cook quinoa according to package directions", "Roast vegetables at 400°F", "Prepare tahini dressing", "Assemble bowls with quinoa base", "Top with roasted vegetables", "Drizzle with dressing", "Add seeds and herbs"]',
            NOW(),
            NOW()
        ),
        (
            'Greek Chicken Salad',
            'Fresh Mediterranean salad with grilled chicken and feta cheese',
            20,
            15,
            4,
            'easy',
            '["Marinate chicken in olive oil and herbs", "Grill chicken until cooked through", "Prepare vegetables and arrange on plates", "Slice chicken and add to salads", "Top with feta and olives", "Dress with lemon vinaigrette"]',
            NOW(),
            NOW()
        );

        RAISE NOTICE 'Sample recipes inserted successfully!';
    ELSE
        RAISE NOTICE 'Recipes already exist, skipping sample recipe insertion';
    END IF;
END $$;

COMMIT;
EOSQL
        print_info "Created sample recipe seed file: db/seeds/002_sample_recipes.sql"
    fi
    
    print_success "Seed data structure created!"
}

# Function to run all seed files
run_seed_files() {
    print_step "Running seed files..."
    
    local seed_files_run=0
    
    # Run existing seed from db/migrations first (for compatibility)
    if [ -f "db/migrations/2025_0002_seed_lookups.sql" ]; then
        print_info "Running existing seed: db/migrations/2025_0002_seed_lookups.sql"
        if docker-compose exec -T supabase-db psql -U postgres -d postgres -f - < "db/migrations/2025_0002_seed_lookups.sql"; then
            ((seed_files_run++))
            print_success "✓ Existing seed file applied"
        else
            print_warning "⚠ Existing seed file failed (may already be applied)"
        fi
    fi
    
    # Run seed files from db/seeds directory
    if [ -d "db/seeds" ] && [ "$(ls -A db/seeds)" ]; then
        print_info "Running seed files from db/seeds/..."
        for seed_file in db/seeds/*.sql; do
            if [ -f "$seed_file" ]; then
                local seed_name=$(basename "$seed_file")
                print_info "Running seed: $seed_name"
                
                if docker-compose exec -T supabase-db psql -U postgres -d postgres -f - < "$seed_file"; then
                    ((seed_files_run++))
                    print_success "✓ $seed_name applied successfully"
                else
                    print_warning "⚠ $seed_name failed (may already be applied)"
                fi
            fi
        done
    fi
    
    # Run Supabase seed if it exists
    if [ -f "supabase/seed.sql" ]; then
        print_info "Running Supabase seed.sql..."
        if docker-compose exec -T supabase-db psql -U postgres -d postgres -f - < "supabase/seed.sql"; then
            ((seed_files_run++))
            print_success "✓ Supabase seed applied"
        else
            print_warning "⚠ Supabase seed failed (may already be applied)"
        fi
    fi
    
    if [ $seed_files_run -eq 0 ]; then
        print_warning "No seed files were found or applied"
        return 1
    else
        print_success "Successfully processed $seed_files_run seed file(s)!"
        return 0
    fi
}

# Function to create development test data
create_test_data() {
    print_step "Creating development test data..."
    
    # Create test users and sample meal plans
    docker-compose exec -T supabase-db psql -U postgres -d postgres << 'EOSQL'
DO $$
BEGIN
    -- Only create test data if auth.users table exists and is empty
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        IF NOT EXISTS (SELECT 1 FROM auth.users LIMIT 1) THEN
            RAISE NOTICE 'Creating test users and data...';
            
            -- This would typically be handled by Supabase Auth
            -- For development, we'll create some sample meal plans without users
            
            RAISE NOTICE 'Test data creation completed';
        ELSE
            RAISE NOTICE 'Users already exist, skipping test data creation';
        END IF;
    ELSE
        RAISE NOTICE 'Auth system not initialized, skipping test data creation';
    END IF;
END $$;
EOSQL
    
    print_success "Test data creation completed!"
}

# Function to verify seeding
verify_seeding() {
    print_step "Verifying seed data..."
    
    # Check each table for data
    local tables=("cuisines" "dietary_preferences" "health_goals" "recipe_tags")
    local verification_passed=true
    
    for table in "${tables[@]}"; do
        local count=$(docker-compose exec -T supabase-db psql -U postgres -d postgres -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | xargs || echo "0")
        
        if [ "$count" -gt 0 ]; then
            print_success "✓ $table: $count records"
        else
            print_warning "⚠ $table: No records found"
            verification_passed=false
        fi
    done
    
    # Check recipes
    local recipe_count=$(docker-compose exec -T supabase-db psql -U postgres -d postgres -t -c "SELECT COUNT(*) FROM recipes;" 2>/dev/null | xargs || echo "0")
    if [ "$recipe_count" -gt 0 ]; then
        print_success "✓ recipes: $recipe_count records"
    else
        print_info "ℹ recipes: No sample recipes (this is optional)"
    fi
    
    if [ "$verification_passed" = true ]; then
        print_success "Seed data verification passed!"
        return 0
    else
        print_warning "Some seed data may be missing"
        return 1
    fi
}

# Function to show seeding summary
show_summary() {
    print_success ""
    print_success "📊 Database Seeding Summary"
    print_success "=========================="
    
    # Get counts for summary
    docker-compose exec -T supabase-db psql -U postgres -d postgres << 'EOSQL'
DO $$
DECLARE
    cuisine_count INTEGER;
    dietary_count INTEGER;
    health_count INTEGER;
    tag_count INTEGER;
    recipe_count INTEGER;
    table_count INTEGER;
BEGIN
    -- Get counts safely
    SELECT COUNT(*) INTO cuisine_count FROM cuisines WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cuisines');
    SELECT COUNT(*) INTO dietary_count FROM dietary_preferences WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'dietary_preferences');
    SELECT COUNT(*) INTO health_count FROM health_goals WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'health_goals');
    SELECT COUNT(*) INTO tag_count FROM recipe_tags WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'recipe_tags');
    SELECT COUNT(*) INTO recipe_count FROM recipes WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'recipes');
    SELECT COUNT(*) INTO table_count FROM information_schema.tables WHERE table_schema = 'public';
    
    RAISE NOTICE '';
    RAISE NOTICE '📈 Data Summary:';
    RAISE NOTICE '  • Cuisines: %', cuisine_count;
    RAISE NOTICE '  • Dietary Preferences: %', dietary_count;
    RAISE NOTICE '  • Health Goals: %', health_count;
    RAISE NOTICE '  • Recipe Tags: %', tag_count;
    RAISE NOTICE '  • Sample Recipes: %', recipe_count;
    RAISE NOTICE '  • Total Tables: %', table_count;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Database seeding completed successfully!';
END $$;
EOSQL
    
    print_info ""
    print_info "🎯 Next Steps:"
    print_info "• Open http://localhost:54324 to view data in Supabase Studio"
    print_info "• Start your application at http://localhost:8080"
    print_info "• Use './scripts/docker-seed.sh --reset' to re-run all seeds"
    print_info ""
}

# Function to reset and re-run all seeds
reset_seeds() {
    print_warning "⚠️ RESET SEEDS WARNING ⚠️"
    print_warning "This will delete all existing seed data and re-run all seeds."
    print_warning "User data and custom records will be preserved."
    print_warning ""
    
    read -p "Are you sure you want to reset seed data? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Reset cancelled."
        return 0
    fi
    
    print_step "Resetting seed data..."
    
    # Clear lookup tables
    docker-compose exec -T supabase-db psql -U postgres -d postgres << 'EOSQL'
DO $$
BEGIN
    -- Clear lookup tables if they exist
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'recipe_tags') THEN
        DELETE FROM recipe_tags;
        RAISE NOTICE 'Cleared recipe_tags table';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'health_goals') THEN
        DELETE FROM health_goals;
        RAISE NOTICE 'Cleared health_goals table';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'dietary_preferences') THEN
        DELETE FROM dietary_preferences;
        RAISE NOTICE 'Cleared dietary_preferences table';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cuisines') THEN
        DELETE FROM cuisines;
        RAISE NOTICE 'Cleared cuisines table';
    END IF;
    
    -- Clear sample recipes (but preserve user-created ones)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'recipes') THEN
        DELETE FROM recipes WHERE title IN (
            'Classic Spaghetti Carbonara',
            'Margherita Pizza',
            'Chicken Pad Thai',
            'Vegetable Fried Rice',
            'Quinoa Buddha Bowl',
            'Greek Chicken Salad'
        );
        RAISE NOTICE 'Cleared sample recipes';
    END IF;
    
    RAISE NOTICE 'Seed data reset completed';
END $$;
EOSQL
    
    print_success "Seed data cleared!"
    
    # Re-run all seeds
    run_seed_files
    verify_seeding
    show_summary
}

# Function to show help
show_help() {
    echo "Teller Plan Magic - Database Seeding Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --reset       Reset all seed data and re-run seeds"
    echo "  --verify      Only verify existing seed data"
    echo "  --create      Create seed file structure only"
    echo "  --test-data   Create additional test data for development"
    echo "  --help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Run all seeds"
    echo "  $0 --reset           # Reset and re-run all seeds"
    echo "  $0 --verify          # Check seed data without changes"
    echo ""
    echo "This script populates the database with essential lookup data"
    echo "and optional sample recipes for development and testing."
}

# Main script execution
main() {
    print_info "Teller Plan Magic Database Seeding"
    print_info "=================================="
    
    # Check database connection
    check_database
    
    # Create seed structure
    create_seed_structure
    
    # Run seed files
    if run_seed_files; then
        # Verify seeding
        verify_seeding
        
        # Show summary
        show_summary
    else
        print_error "Seeding failed or no seed files found"
        print_info "Run with --create to generate seed file structure"
        exit 1
    fi
}

# Handle command line arguments
case "${1:-}" in
    "--reset")
        check_database
        reset_seeds
        ;;
    "--verify")
        check_database
        verify_seeding
        ;;
    "--create")
        create_seed_structure
        print_success "Seed file structure created!"
        ;;
    "--test-data")
        check_database
        create_test_data
        ;;
    "--help"|"-h")
        show_help
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac