
-- Tabela: Boteco Seu Osmar - Cabo Frio
CREATE TABLE public.reservations_cabofrio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  guests INTEGER NOT NULL,
  date DATE NOT NULL,
  local TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.reservations_cabofrio TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reservations_cabofrio TO authenticated;
GRANT ALL ON public.reservations_cabofrio TO service_role;
ALTER TABLE public.reservations_cabofrio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create cabofrio reservations" ON public.reservations_cabofrio
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view cabofrio reservations" ON public.reservations_cabofrio
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update cabofrio reservations" ON public.reservations_cabofrio
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete cabofrio reservations" ON public.reservations_cabofrio
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Tabela: Boteco Seu Osmar - São Pedro
CREATE TABLE public.reservations_saopedro (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  guests INTEGER NOT NULL,
  date DATE NOT NULL,
  local TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.reservations_saopedro TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reservations_saopedro TO authenticated;
GRANT ALL ON public.reservations_saopedro TO service_role;
ALTER TABLE public.reservations_saopedro ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create saopedro reservations" ON public.reservations_saopedro
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view saopedro reservations" ON public.reservations_saopedro
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update saopedro reservations" ON public.reservations_saopedro
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete saopedro reservations" ON public.reservations_saopedro
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
