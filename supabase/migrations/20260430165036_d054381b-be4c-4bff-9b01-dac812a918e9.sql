
-- Staff members table
CREATE TABLE public.staff_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  minecraft_username TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Helper',
  bio TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff viewable by everyone" ON public.staff_members FOR SELECT USING (true);
CREATE POLICY "Admins insert staff" ON public.staff_members FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update staff" ON public.staff_members FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete staff" ON public.staff_members FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER trg_staff_updated BEFORE UPDATE ON public.staff_members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- MC credentials (username -> email mapping for username login)
CREATE TABLE public.mc_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  minecraft_username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_mc_creds_username_lower ON public.mc_credentials (lower(minecraft_username));
ALTER TABLE public.mc_credentials ENABLE ROW LEVEL SECURITY;
-- No public select; only admins can view/manage. Edge function uses service role.
CREATE POLICY "Admins select mc creds" ON public.mc_credentials FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins insert mc creds" ON public.mc_credentials FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update mc creds" ON public.mc_credentials FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete mc creds" ON public.mc_credentials FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Server rules
CREATE TABLE public.server_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Generale',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.server_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rules viewable by everyone" ON public.server_rules FOR SELECT USING (true);
CREATE POLICY "Admins insert rules" ON public.server_rules FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update rules" ON public.server_rules FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete rules" ON public.server_rules FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER trg_rules_updated BEFORE UPDATE ON public.server_rules FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Store packages
CREATE TABLE public.store_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  features TEXT[] NOT NULL DEFAULT '{}',
  color TEXT NOT NULL DEFAULT 'primary',
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.store_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Packages viewable by everyone" ON public.store_packages FOR SELECT USING (true);
CREATE POLICY "Admins insert packages" ON public.store_packages FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update packages" ON public.store_packages FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete packages" ON public.store_packages FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER trg_packages_updated BEFORE UPDATE ON public.store_packages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
