import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function getSupabasePublic() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const supabase = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  return supabase;
}

export const getDeliveryZones = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabasePublic();
  const { data, error } = await supabase
    .from("delivery_zones")
    .select("*")
    .eq("is_active", true)
    .order("postal_code");
  if (error) throw error;
  return data ?? [];
});

export interface DeliveryZone {
  id: string;
  postal_code: string;
  city_area: string | null;
  min_order_amount: number;
  delivery_fee: number;
  is_active: boolean;
}

export const getOpeningHours = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabasePublic();
  const { data, error } = await supabase.from("opening_hours").select("*").order("day_of_week");
  if (error) throw error;
  return data ?? [];
});

export interface OpeningHour {
  id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_open: boolean;
}

export const validateDiscountCode = createServerFn({ method: "POST" })
  .inputValidator((data: { code: string }) => data)
  .handler(async ({ data }) => {
    const supabase = getSupabasePublic();
    const { data: code, error } = await supabase
      .from("discount_codes")
      .select("*")
      .eq("code", data.code.toUpperCase())
      .eq("active", true)
      .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
      .maybeSingle();
    if (error) throw error;
    // PostgREST cannot compare two columns, so the usage limit is checked here.
    if (code?.max_uses != null && code.used_count >= code.max_uses) return null;
    return code;
  });

export interface DiscountCode {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  value: number;
  min_order_amount: number;
  active: boolean;
  expires_at: string | null;
}

export const isCurrentlyOpen = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabasePublic();
  const { data, error } = await supabase.from("opening_hours").select("*").order("day_of_week");
  if (error) throw error;
  const now = new Date();
  // Magyar idő szerinti nap és óra:perc
  const local = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Budapest" }));
  const dayOfWeek = local.getDay();
  const currentTime = `${String(local.getHours()).padStart(2, "0")}:${String(local.getMinutes()).padStart(2, "0")}`;
  const today = data?.find((d) => d.day_of_week === dayOfWeek);
  if (!today || !today.is_open) return { open: false, nextOpen: null, today, currentTime };
  const open = currentTime >= today.open_time && currentTime < today.close_time;
  return { open, today, currentTime };
});

export const createLocalOrder = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      shopify_checkout_id?: string;
      customer_name: string;
      email?: string;
      phone: string;
      address: string;
      postal_code: string;
      city: string;
      payment_method: "online" | "cod";
      total_amount: number;
      discount_amount: number;
      delivery_fee: number;
      notes?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    const supabase = getSupabasePublic();
    const { error } = await supabase.from("orders").insert(data);
    if (error) throw error;
    return { success: true };
  });
