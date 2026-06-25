DROP POLICY IF EXISTS "Imagens admin insert" ON storage.objects;
DROP POLICY IF EXISTS "Imagens admin update" ON storage.objects;
DROP POLICY IF EXISTS "Imagens admin delete" ON storage.objects;

DROP POLICY IF EXISTS "Admins can upload reservation images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update reservation images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete reservation images" ON storage.objects;

CREATE POLICY "Admins can upload reservation images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'imagens'
  AND (storage.foldername(name))[1] = 'reservas'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can update reservation images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'imagens'
  AND (storage.foldername(name))[1] = 'reservas'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  bucket_id = 'imagens'
  AND (storage.foldername(name))[1] = 'reservas'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can delete reservation images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'imagens'
  AND (storage.foldername(name))[1] = 'reservas'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);