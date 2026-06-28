
CREATE POLICY "Admins can create reservations" ON public.reservations FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can create reservations cabofrio" ON public.reservations_cabofrio FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can create reservations saopedro" ON public.reservations_saopedro FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
