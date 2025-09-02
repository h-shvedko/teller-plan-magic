-- Create lookup tables for admin-managed settings

-- Create cuisines table
CREATE TABLE IF NOT EXISTS public.cuisines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create dietary_preferences table  
CREATE TABLE IF NOT EXISTS public.dietary_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create health_goals table
CREATE TABLE IF NOT EXISTS public.health_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create cooking_styles table
CREATE TABLE IF NOT EXISTS public.cooking_styles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on lookup tables
ALTER TABLE public.cuisines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dietary_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cooking_styles ENABLE ROW LEVEL SECURITY;

-- Insert seed data
INSERT INTO public.cuisines (name, description) VALUES
  ('Italian', 'Traditional Italian cuisine'),
  ('Vietnamese', 'Vietnamese culinary traditions'),
  ('Mexican', 'Mexican and Latin American dishes'),
  ('Indian', 'Indian subcontinent cuisine'),
  ('Thai', 'Thai culinary traditions'),
  ('Chinese', 'Chinese cuisine varieties'),
  ('Japanese', 'Japanese culinary arts'),
  ('Greek', 'Mediterranean Greek cuisine'),
  ('French', 'French culinary traditions'),
  ('Spanish', 'Spanish and Iberian cuisine'),
  ('German', 'German and Central European cuisine'),
  ('Turkish', 'Turkish and Ottoman cuisine'),
  ('Moroccan', 'North African Moroccan cuisine'),
  ('American', 'American cuisine varieties'),
  ('Middle Eastern', 'Middle Eastern culinary traditions')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.dietary_preferences (name, description) VALUES
  ('Vegetarian', 'Plant-based diet excluding meat'),
  ('Vegan', 'Plant-based diet excluding all animal products'),
  ('Pescatarian', 'Diet including fish but excluding other meat'),
  ('Gluten-Free', 'Diet excluding gluten-containing foods'),
  ('Dairy-Free', 'Diet excluding dairy products'),
  ('Nut-Free', 'Diet excluding nuts and nut products'),
  ('Halal', 'Diet following Islamic dietary laws'),
  ('Kosher', 'Diet following Jewish dietary laws')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.health_goals (name, description) VALUES
  ('Eat Healthier', 'Focus on nutritious, balanced meals'),
  ('Save Money', 'Budget-conscious meal planning'),
  ('High Protein', 'Protein-rich diet for fitness goals'),
  ('Low Carb', 'Reduced carbohydrate intake'),
  ('Low Fat', 'Reduced fat content in meals'),
  ('Weight Loss', 'Calorie-controlled meals for weight management'),
  ('Muscle Gain', 'High-protein meals for muscle building'),
  ('Quick Meals', 'Fast and convenient meal preparation')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.cooking_styles (name, description) VALUES
  ('quick', 'Fast and simple meals for busy schedules'),
  ('elaborate', 'Complex dishes with detailed preparation'),
  ('mixed', 'Combination of quick and elaborate cooking styles')
ON CONFLICT (name) DO NOTHING;

-- Create RLS policies - admins can manage, everyone can read
CREATE POLICY "Everyone can view cuisines" ON public.cuisines FOR SELECT USING (true);
CREATE POLICY "Admins can manage cuisines" ON public.cuisines FOR ALL USING (has_role(auth.uid(), 'administrator'::app_role));

CREATE POLICY "Everyone can view dietary preferences" ON public.dietary_preferences FOR SELECT USING (true);
CREATE POLICY "Admins can manage dietary preferences" ON public.dietary_preferences FOR ALL USING (has_role(auth.uid(), 'administrator'::app_role));

CREATE POLICY "Everyone can view health goals" ON public.health_goals FOR SELECT USING (true);
CREATE POLICY "Admins can manage health goals" ON public.health_goals FOR ALL USING (has_role(auth.uid(), 'administrator'::app_role));

CREATE POLICY "Everyone can view cooking styles" ON public.cooking_styles FOR SELECT USING (true);
CREATE POLICY "Admins can manage cooking styles" ON public.cooking_styles FOR ALL USING (has_role(auth.uid(), 'administrator'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_cuisines_updated_at
  BEFORE UPDATE ON public.cuisines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dietary_preferences_updated_at
  BEFORE UPDATE ON public.dietary_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_health_goals_updated_at
  BEFORE UPDATE ON public.health_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cooking_styles_updated_at
  BEFORE UPDATE ON public.cooking_styles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();