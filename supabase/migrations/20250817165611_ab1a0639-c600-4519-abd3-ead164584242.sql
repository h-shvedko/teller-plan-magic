-- Create a function to handle new user subscription setup
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Insert default subscriber record
  INSERT INTO public.subscribers (user_id, email, subscribed, subscription_tier, subscription_end)
  VALUES (
    new.id, 
    new.email,
    false,
    'free',
    null
  );
  
  RETURN new;
END;
$function$;