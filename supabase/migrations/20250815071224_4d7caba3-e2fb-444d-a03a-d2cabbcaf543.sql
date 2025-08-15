-- Create enum types for preferences
CREATE TYPE cooking_style AS ENUM ('quick', 'elaborate', 'mixed');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');

-- User preferences table
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dietary_restrictions TEXT[],
  cooking_style cooking_style DEFAULT 'mixed',
  difficulty_level difficulty_level DEFAULT 'intermediate',
  household_size INTEGER DEFAULT 2,
  budget_range TEXT,
  favorite_cuisines TEXT[],
  health_goals TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Recipes table
CREATE TABLE public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  prep_time INTEGER, -- minutes
  cook_time INTEGER, -- minutes
  servings INTEGER DEFAULT 2,
  difficulty difficulty_level DEFAULT 'intermediate',
  cuisine TEXT,
  meal_type meal_type DEFAULT 'dinner',
  dietary_tags TEXT[],
  instructions TEXT,
  image_url TEXT,
  created_by UUID REFERENCES profiles(id),
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recipe ingredients
CREATE TABLE public.recipe_ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  quantity DECIMAL,
  unit TEXT,
  aisle_category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User meal plans
CREATE TABLE public.meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  week_start_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Meal plan recipes
CREATE TABLE public.meal_plan_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
  meal_type meal_type DEFAULT 'dinner',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Shopping lists
CREATE TABLE public.shopping_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Shopping list items
CREATE TABLE public.shopping_list_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shopping_list_id UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  quantity DECIMAL,
  unit TEXT,
  aisle_category TEXT,
  is_purchased BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

-- User preferences policies
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all preferences" ON public.user_preferences
FOR SELECT USING (has_role(auth.uid(), 'administrator'::app_role));

-- Recipes policies
CREATE POLICY "Everyone can view public recipes" ON public.recipes
FOR SELECT USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Users can create recipes" ON public.recipes
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own recipes" ON public.recipes
FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Admins can view all recipes" ON public.recipes
FOR SELECT USING (has_role(auth.uid(), 'administrator'::app_role));

-- Recipe ingredients policies
CREATE POLICY "Users can view recipe ingredients for accessible recipes" ON public.recipe_ingredients
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.recipes 
    WHERE recipes.id = recipe_ingredients.recipe_id 
    AND (recipes.is_public = true OR recipes.created_by = auth.uid())
  )
);

CREATE POLICY "Users can manage ingredients for their recipes" ON public.recipe_ingredients
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.recipes 
    WHERE recipes.id = recipe_ingredients.recipe_id 
    AND recipes.created_by = auth.uid()
  )
);

CREATE POLICY "Admins can view all recipe ingredients" ON public.recipe_ingredients
FOR SELECT USING (has_role(auth.uid(), 'administrator'::app_role));

-- Meal plans policies
CREATE POLICY "Users can view their own meal plans" ON public.meal_plans
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own meal plans" ON public.meal_plans
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all meal plans" ON public.meal_plans
FOR SELECT USING (has_role(auth.uid(), 'administrator'::app_role));

-- Meal plan recipes policies
CREATE POLICY "Users can view their meal plan recipes" ON public.meal_plan_recipes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.meal_plans 
    WHERE meal_plans.id = meal_plan_recipes.meal_plan_id 
    AND meal_plans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their meal plan recipes" ON public.meal_plan_recipes
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.meal_plans 
    WHERE meal_plans.id = meal_plan_recipes.meal_plan_id 
    AND meal_plans.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all meal plan recipes" ON public.meal_plan_recipes
FOR SELECT USING (has_role(auth.uid(), 'administrator'::app_role));

-- Shopping lists policies
CREATE POLICY "Users can view their own shopping lists" ON public.shopping_lists
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own shopping lists" ON public.shopping_lists
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all shopping lists" ON public.shopping_lists
FOR SELECT USING (has_role(auth.uid(), 'administrator'::app_role));

-- Shopping list items policies
CREATE POLICY "Users can view their shopping list items" ON public.shopping_list_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.shopping_lists 
    WHERE shopping_lists.id = shopping_list_items.shopping_list_id 
    AND shopping_lists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their shopping list items" ON public.shopping_list_items
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.shopping_lists 
    WHERE shopping_lists.id = shopping_list_items.shopping_list_id 
    AND shopping_lists.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all shopping list items" ON public.shopping_list_items
FOR SELECT USING (has_role(auth.uid(), 'administrator'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
BEFORE UPDATE ON public.recipes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at
BEFORE UPDATE ON public.meal_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shopping_lists_updated_at
BEFORE UPDATE ON public.shopping_lists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();