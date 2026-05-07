-- Ticket categories
CREATE TABLE public.ticket_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT 'primary',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.ticket_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories viewable by everyone" ON public.ticket_categories FOR SELECT USING (true);
CREATE POLICY "Owner manages categories" ON public.ticket_categories FOR ALL USING (public.has_role(auth.uid(), 'owner')) WITH CHECK (public.has_role(auth.uid(), 'owner'));

-- Tickets
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category_id UUID REFERENCES public.ticket_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own tickets, staff view all" ON public.tickets FOR SELECT USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
  OR public.has_role(auth.uid(), 'owner')
);
CREATE POLICY "Users can create tickets" ON public.tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff update tickets" ON public.tickets FOR UPDATE USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
  OR public.has_role(auth.uid(), 'owner')
);
CREATE POLICY "Owner deletes tickets" ON public.tickets FOR DELETE USING (public.has_role(auth.uid(), 'owner'));

-- Ticket replies
CREATE TABLE public.ticket_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_staff BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Replies viewable by ticket participants and staff" ON public.ticket_replies FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.tickets t
    WHERE t.id = ticket_id AND (
      t.user_id = auth.uid()
      OR public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'moderator')
      OR public.has_role(auth.uid(), 'owner')
    )
  )
);
CREATE POLICY "Owner of ticket can reply" ON public.ticket_replies FOR INSERT WITH CHECK (
  auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid()) AND is_staff = false
);
CREATE POLICY "Staff can reply" ON public.ticket_replies FOR INSERT WITH CHECK (
  auth.uid() = user_id AND is_staff = true AND (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'moderator')
    OR public.has_role(auth.uid(), 'owner')
  )
);
CREATE POLICY "Owner deletes replies" ON public.ticket_replies FOR DELETE USING (public.has_role(auth.uid(), 'owner'));

CREATE TRIGGER set_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_ticket_categories_updated_at BEFORE UPDATE ON public.ticket_categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Restrict owner-only on news/staff/rules/store/mc_credentials/user_roles
DROP POLICY IF EXISTS "Admins delete news" ON public.news;
DROP POLICY IF EXISTS "Admins insert news" ON public.news;
DROP POLICY IF EXISTS "Admins update news" ON public.news;
CREATE POLICY "Owner delete news" ON public.news FOR DELETE USING (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Owner insert news" ON public.news FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Owner update news" ON public.news FOR UPDATE USING (public.has_role(auth.uid(), 'owner'));

DROP POLICY IF EXISTS "Admins delete staff" ON public.staff_members;
DROP POLICY IF EXISTS "Admins insert staff" ON public.staff_members;
DROP POLICY IF EXISTS "Admins update staff" ON public.staff_members;
CREATE POLICY "Owner delete staff" ON public.staff_members FOR DELETE USING (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Owner insert staff" ON public.staff_members FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Owner update staff" ON public.staff_members FOR UPDATE USING (public.has_role(auth.uid(), 'owner'));

DROP POLICY IF EXISTS "Admins delete rules" ON public.server_rules;
DROP POLICY IF EXISTS "Admins insert rules" ON public.server_rules;
DROP POLICY IF EXISTS "Admins update rules" ON public.server_rules;
CREATE POLICY "Owner delete rules" ON public.server_rules FOR DELETE USING (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Owner insert rules" ON public.server_rules FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Owner update rules" ON public.server_rules FOR UPDATE USING (public.has_role(auth.uid(), 'owner'));

DROP POLICY IF EXISTS "Admins delete packages" ON public.store_packages;
DROP POLICY IF EXISTS "Admins insert packages" ON public.store_packages;
DROP POLICY IF EXISTS "Admins update packages" ON public.store_packages;
CREATE POLICY "Owner delete packages" ON public.store_packages FOR DELETE USING (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Owner insert packages" ON public.store_packages FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Owner update packages" ON public.store_packages FOR UPDATE USING (public.has_role(auth.uid(), 'owner'));

DROP POLICY IF EXISTS "Admins delete mc creds" ON public.mc_credentials;
DROP POLICY IF EXISTS "Admins insert mc creds" ON public.mc_credentials;
DROP POLICY IF EXISTS "Admins update mc creds" ON public.mc_credentials;
DROP POLICY IF EXISTS "Admins select mc creds" ON public.mc_credentials;
CREATE POLICY "Owner delete mc creds" ON public.mc_credentials FOR DELETE USING (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Owner insert mc creds" ON public.mc_credentials FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Owner update mc creds" ON public.mc_credentials FOR UPDATE USING (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Owner select mc creds" ON public.mc_credentials FOR SELECT USING (public.has_role(auth.uid(), 'owner'));

DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Owner manages roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'owner')) WITH CHECK (public.has_role(auth.uid(), 'owner'));

-- Promote Ryzeee_1 to owner
DO $$
DECLARE v_user_id UUID;
BEGIN
  SELECT user_id INTO v_user_id FROM public.mc_credentials WHERE lower(minecraft_username) = 'ryzeee_1' LIMIT 1;
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'owner') ON CONFLICT DO NOTHING;
  END IF;
END $$;

INSERT INTO public.ticket_categories (name, description, color, display_order) VALUES
  ('Bug Report', 'Segnala problemi tecnici o bug del server', 'destructive', 1),
  ('Segnalazione Player', 'Segnala comportamenti scorretti di altri giocatori', 'accent', 2),
  ('Supporto Generale', 'Domande e supporto generico', 'primary', 3),
  ('Appello Ban', 'Richiedi la revisione di un ban o sanzione', 'secondary', 4),
  ('Suggerimenti', 'Proponi nuove idee per il server', 'primary-glow', 5);
