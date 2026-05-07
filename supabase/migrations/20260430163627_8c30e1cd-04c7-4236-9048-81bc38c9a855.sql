-- Roles enum + table (security best practice)
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Roles viewable by everyone"
ON public.user_roles FOR SELECT
USING (true);

CREATE POLICY "Admins manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- News table
CREATE TABLE public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'Update',
  image_url TEXT,
  excerpt TEXT,
  content TEXT NOT NULL DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published news viewable by everyone"
ON public.news FOR SELECT
USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert news"
ON public.news FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update news"
ON public.news FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete news"
ON public.news FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER news_set_updated_at
BEFORE UPDATE ON public.news
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_news_published_at ON public.news(published_at DESC);

-- Seed example news
INSERT INTO public.news (title, slug, category, image_url, excerpt, content, published_at) VALUES
('Lancio NexusRoleplay 2026', 'lancio-nexus-2026', 'Evento', 'https://images.unsplash.com/photo-1614729939124-032d2f6e7b59?w=1200', 'Inaugurata ufficialmente la città di Nexus. Una nuova era inizia.', 'Benvenuti nella nuova era di NebulaMC.', now() - interval '1 day'),
('Update Allenamenti 2.0', 'update-allenamenti-2', 'Update', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200', 'Nuovi kit, nuove arene e sistema ELO ranked.', 'Tutte le novità dell''update.', now() - interval '5 days'),
('Stagione Stellare', 'stagione-stellare', 'Stagione', 'https://images.unsplash.com/photo-1462332420958-a05d1e002413?w=1200', 'La nuova stagione cosmica è iniziata. Premi esclusivi vi aspettano.', 'Dettagli della stagione.', now() - interval '10 days');