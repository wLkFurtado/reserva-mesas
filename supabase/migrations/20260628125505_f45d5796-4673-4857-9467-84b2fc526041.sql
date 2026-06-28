CREATE OR REPLACE FUNCTION public.can_manage_reservation_image(_bucket_id text, _name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    _bucket_id = 'imagens'
    AND _name LIKE 'reservas/%'
    AND EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'::public.app_role
    )
$$;

REVOKE ALL ON FUNCTION public.can_manage_reservation_image(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_manage_reservation_image(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_reservation_image(text, text) TO service_role;

DROP POLICY IF EXISTS "Admins can upload reservation images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update reservation images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete reservation images" ON storage.objects;

CREATE POLICY "Admins can upload reservation images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (public.can_manage_reservation_image(bucket_id, name));

CREATE POLICY "Admins can update reservation images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (public.can_manage_reservation_image(bucket_id, name))
WITH CHECK (public.can_manage_reservation_image(bucket_id, name));

CREATE POLICY "Admins can delete reservation images"
ON storage.objects
FOR DELETE
TO authenticated
USING (public.can_manage_reservation_image(bucket_id, name));