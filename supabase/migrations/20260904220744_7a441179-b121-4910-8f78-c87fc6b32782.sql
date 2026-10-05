
ALTER TABLE public.delivery_zones
  ADD COLUMN IF NOT EXISTS eta_min integer NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS eta_max integer NOT NULL DEFAULT 45;

DELETE FROM public.delivery_zones;
INSERT INTO public.delivery_zones (postal_code, city_area, min_order_amount, delivery_fee, is_active, eta_min, eta_max) VALUES
  ('6720', 'Belváros', 0, 490, true, 30, 40),
  ('6726', 'Újszeged', 0, 490, true, 30, 40),
  ('6721', 'Belváros keleti rész', 0, 590, true, 35, 45),
  ('6722', 'Rókus', 0, 590, true, 35, 45),
  ('6723', 'Felsőváros', 0, 690, true, 35, 50),
  ('6724', 'Móraváros', 0, 690, true, 35, 50),
  ('6725', 'Alsóváros', 0, 690, true, 35, 50);

DELETE FROM public.opening_hours;
INSERT INTO public.opening_hours (day_of_week, open_time, close_time, is_open) VALUES
  (1, '16:00', '21:45', false),
  (2, '16:00', '21:45', true),
  (3, '16:00', '21:45', true),
  (4, '16:00', '21:45', true),
  (5, '16:00', '21:45', true),
  (6, '10:30', '21:45', true),
  (0, '10:30', '21:45', true);

DELETE FROM public.discount_codes;
INSERT INTO public.discount_codes (code, discount_type, value, min_order_amount, active, expires_at) VALUES
  ('PIZZA2PLUS1', 'percentage', 33, 7000, true, now() + interval '1 year'),
  ('PAROS', 'fixed', 1500, 6000, true, now() + interval '1 year'),
  ('HONAPKEDVENCE', 'percentage', 20, 0, true, now() + interval '1 year');
