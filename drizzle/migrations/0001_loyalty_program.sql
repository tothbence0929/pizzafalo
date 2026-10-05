CREATE TABLE public.loyalty_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL UNIQUE,
  pizza_count INTEGER NOT NULL DEFAULT 0,
  free_pizzas_awarded INTEGER NOT NULL DEFAULT 0,
  last_order_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.loyalty_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  discount_code_id UUID NOT NULL REFERENCES public.discount_codes(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('free_pizza', 'free_drink')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.discount_codes
  ADD COLUMN max_uses INTEGER,
  ADD COLUMN used_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.orders
  ADD COLUMN shopify_order_id TEXT,
  ADD CONSTRAINT orders_shopify_order_id_unique UNIQUE (shopify_order_id);

GRANT ALL ON public.loyalty_customers TO service_role;
GRANT ALL ON public.loyalty_rewards TO service_role;

ALTER TABLE public.loyalty_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;
