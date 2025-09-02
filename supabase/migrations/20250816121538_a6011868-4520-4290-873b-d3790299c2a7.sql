-- Create lookup tables for admin-managed settings

-- Create cooking_styles table (replacing enum)
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

-- Add missing columns to existing lookup tables
ALTER TABLE public.cuisines ADD COLUMN IF NOT EXISTS id uuid PRIMARY KEY DEFAULT gen_random_uuid();
ALTER TABLE public.cuisines ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.cuisines ADD COLUMN IF NOT EXISTS created_at timestamp with time zone NOT NULL DEFAULT now();
ALTER TABLE public.cuisines ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();

ALTER TABLE public.dietary_preferences ADD COLUMN IF NOT EXISTS id uuid PRIMARY KEY DEFAULT gen_random_uuid();
ALTER TABLE public.dietary_preferences ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.dietary_preferences ADD COLUMN IF NOT EXISTS created_at timestamp with time zone NOT NULL DEFAULT now();
ALTER TABLE public.dietary_preferences ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();

ALTER TABLE public.health_goals ADD COLUMN IF NOT EXISTS id uuid PRIMARY KEY DEFAULT gen_random_uuid();
ALTER TABLE public.health_goals ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.health_goals ADD COLUMN IF NOT EXISTS created_at timestamp with time zone NOT NULL DEFAULT now();
ALTER TABLE public.health_goals ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();

-- Insert cooking styles data
INSERT INTO public.cooking_styles (name, description) VALUES
  ('quick', 'Fast and simple meals for busy schedules'),
  ('elaborate', 'Complex dishes with detailed preparation'),
  ('mixed', 'Combination of quick and elaborate cooking styles')
ON CONFLICT (name) DO NOTHING;

-- Create RLS policies for lookup tables - admins can manage, everyone can read
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