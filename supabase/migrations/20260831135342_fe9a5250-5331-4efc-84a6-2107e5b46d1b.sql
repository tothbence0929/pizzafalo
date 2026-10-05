CREATE TABLE public.delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  postal_code TEXT NOT NULL,
  city_area TEXT,
  min_order_amount INTEGER NOT NULL DEFAULT 0,
  delivery_fee INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.opening_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  value INTEGER NOT NULL,
  min_order_amount INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_checkout_id TEXT,
  customer_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('online', 'cod')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
  total_amount INTEGER NOT NULL,
  discount_amount INTEGER NOT NULL DEFAULT 0,
  delivery_fee INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT ON public.delivery_zones TO anon;
GRANT SELECT ON public.delivery_zones TO authenticated;
GRANT ALL ON public.delivery_zones TO service_role;

GRANT SELECT ON public.opening_hours TO anon;
GRANT SELECT ON public.opening_hours TO authenticated;
GRANT ALL ON public.opening_hours TO service_role;

GRANT SELECT ON public.discount_codes TO anon;
GRANT SELECT ON public.discount_codes TO authenticated;
GRANT ALL ON public.discount_codes TO service_role;

GRANT INSERT, SELECT ON public.orders TO anon;
GRANT INSERT, SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opening_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active delivery zones"
ON public.delivery_zones FOR SELECT
TO anon, authenticated
USING (is_active = TRUE);

CREATE POLICY "Public can read opening hours"
ON public.opening_hours FOR SELECT
TO anon, authenticated
USING (TRUE);

CREATE POLICY "Public can read active discount codes"
ON public.discount_codes FOR SELECT
TO anon, authenticated
USING (active = TRUE AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Anyone can insert orders"
ON public.orders FOR INSERT
TO anon, authenticated
WITH CHECK (TRUE);

CREATE POLICY "Read order by id"
ON public.orders FOR SELECT
TO anon, authenticated
USING (id::text = current_setting('app.order_id', TRUE));

CREATE POLICY "Service role can manage all orders"
ON public.orders FOR ALL
TO service_role
USING (TRUE)
WITH CHECK (TRUE);

INSERT INTO public.delivery_zones (postal_code, city_area, min_order_amount, delivery_fee, is_active) VALUES
('6720', 'Szeged belváros', 3000, 0, TRUE),
('6721', 'Szeged', 3000, 0, TRUE),
('6722', 'Szeged', 3000, 0, TRUE),
('6723', 'Szeged', 3000, 0, TRUE),
('6724', 'Szeged', 3000, 0, TRUE),
('6725', 'Szeged', 3000, 0, TRUE),
('6726', 'Szeged', 3000, 0, TRUE),
('6727', 'Szeged', 3000, 0, TRUE),
('6728', 'Szeged', 3500, 500, TRUE),
('6729', 'Szeged', 3500, 500, TRUE),
('6753', 'Szeged környéke', 4000, 800, TRUE),
('6757', 'Szeged környéke', 4000, 800, TRUE);

INSERT INTO public.opening_hours (day_of_week, open_time, close_time, is_open) VALUES
(0, '11:00', '22:00', TRUE),
(1, '10:00', '22:00', TRUE),
(2, '10:00', '22:00', TRUE),
(3, '10:00', '22:00', TRUE),
(4, '10:00', '22:00', TRUE),
(5, '10:00', '23:00', TRUE),
(6, '11:00', '23:00', TRUE);

INSERT INTO public.discount_codes (code, discount_type, value, min_order_amount, active, expires_at) VALUES
('PIZZAFALO10', 'percentage', 10, 4000, TRUE, now() + interval '90 days'),
('INGYENKISZALLITAS', 'fixed', 500, 5000, TRUE, now() + interval '90 days');