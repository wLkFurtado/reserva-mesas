ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.reservations_cabofrio ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.reservations_saopedro ADD COLUMN IF NOT EXISTS image_url text;

-- Storage policies for 'imagens' bucket under reservas/ prefix
DROP POLICY IF EXISTS "Admins can upload reservation images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update reservation images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete reservation images" ON storage.objects;

CREATE POLICY "Admins can upload reservation images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'imagens'
  AND (storage.foldername(name))[1] = 'reservas'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update reservation images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'imagens'
  AND (storage.foldername(name))[1] = 'reservas'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete reservation images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'imagens'
  AND (storage.foldername(name))[1] = 'reservas'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);