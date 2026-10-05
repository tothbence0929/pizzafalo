DROP POLICY IF EXISTS "Read order by id" ON public.orders;
REVOKE SELECT ON public.orders FROM anon;
REVOKE SELECT ON public.orders FROM authenticated;
GRANT INSERT ON public.orders TO anon;
GRANT INSERT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;