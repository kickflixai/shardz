-- Auto-assign admin role for specific emails on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SET search_path = ''
AS $$
DECLARE
  user_role TEXT := 'viewer';
BEGIN
  -- Auto-assign admin role for specific emails
  IF NEW.email IN ('solo@kickflix.ai', 'andy@studiofun.tv') THEN
    user_role := 'admin';
  END IF;

  INSERT INTO public.profiles (id, display_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name', user_role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
