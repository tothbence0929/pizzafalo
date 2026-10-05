CREATE POLICY "Deny public reads on orders"
ON public.orders
FOR SELECT
TO anon, authenticated
USING (false);