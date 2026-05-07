CREATE UNIQUE INDEX IF NOT EXISTS profiles_minecraft_username_lower_unique
  ON public.profiles (lower(minecraft_username))
  WHERE minecraft_username IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS staff_members_minecraft_username_lower_unique
  ON public.staff_members (lower(minecraft_username));

CREATE OR REPLACE FUNCTION public.is_mc_username_taken(_username text, _exclude_user uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE lower(minecraft_username) = lower(_username)
      AND (_exclude_user IS NULL OR id <> _exclude_user)
  )
  OR EXISTS (
    SELECT 1 FROM public.staff_members
    WHERE lower(minecraft_username) = lower(_username)
      AND (_exclude_user IS NULL OR user_id IS DISTINCT FROM _exclude_user)
  );
$$;