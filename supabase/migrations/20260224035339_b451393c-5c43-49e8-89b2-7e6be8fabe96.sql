
-- Auto-assign 'content_strategist' role to new users so they can create posts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NULL);
  
  -- Auto-assign content_strategist role for small teams
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'content_strategist');
  
  RETURN NEW;
END;
$$;
