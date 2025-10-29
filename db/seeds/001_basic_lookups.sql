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
