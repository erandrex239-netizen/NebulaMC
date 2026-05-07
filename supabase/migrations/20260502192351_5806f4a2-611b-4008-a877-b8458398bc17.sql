CREATE OR REPLACE FUNCTION public.is_mc_username_taken(_username text, _exclude_user uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY INVOKER
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

REVOKE EXECUTE ON FUNCTION public.is_mc_username_taken(text, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_mc_username_taken(text, uuid) TO authenticated;