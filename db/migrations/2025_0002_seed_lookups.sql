-- 2025_0002_seed_lookups.sql - Seed lookups for Tellerplan
BEGIN;

insert into cuisines (name) values
  ('Italian'),('Vietnamese'),('Mexican'),('Indian'),('Thai'),('Chinese'),('Japanese'),('Greek'),('French'),('Spanish'),('German'),('Turkish'),('Moroccan'),('American'),('Middle Eastern')
  on conflict (name) do nothing;

insert into dietary_preferences (name) values
  ('Vegetarian'),('Vegan'),('Pescatarian'),('Gluten-Free'),('Dairy-Free'),('Nut-Free'),('Halal'),('Kosher')
  on conflict (name) do nothing;

insert into health_goals (name) values
  ('Eat Healthier'),('Save Money'),('High Protein'),('Low Carb'),('Low Fat'),('Weight Loss'),('Muscle Gain'),('Quick Meals')
  on conflict (name) do nothing;

insert into recipe_tags (name) values
  ('One-Pot'),('30-Minute'),('Meal Prep'),('Kid-Friendly'),('Spicy'),('Comfort Food'),('Budget'),('Low-Calorie'),('High-Fiber'),('Gluten-Free'),('Dairy-Free')
  on conflict (name) do nothing;

COMMIT;
