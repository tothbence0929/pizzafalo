CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  phone text,
  discount_code_id uuid REFERENCES public.discount_codes(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.newsletter_subscribers TO service_role;

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny public access to subscribers"
  ON public.newsletter_subscribers FOR SELECT
  TO anon, authenticated
  USING (false);
