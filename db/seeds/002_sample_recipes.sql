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
