
-- Add approval column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT false;

-- Update the handle_new_user trigger to set is_approved = false for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, is_approved)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NULL, false);
  
  -- Auto-assign content_strategist role for small teams
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'content_strategist');
  
  RETURN NEW;
END;
$function$;
