import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  FREE_PIZZA_VALUE,
  FREE_DRINK_VALUE,
  FREE_PIZZA_EXPIRY_DAYS,
  FREE_DRINK_EXPIRY_DAYS,
  DRINK_ELIGIBILITY_DAYS,
  PIZZA_THRESHOLD,
  normalizePhone,
} from "@/lib/loyalty";

export type AdminClient = SupabaseClient<Database>;

type ShopifyPayload = Record<string, unknown>;
type ShopifyAddress = Record<string, unknown>;
type ShopifyCustomer = Record<string, unknown>;
type ShopifyLineItem = Record<string, unknown>;

function generateRandomSuffix(length = 6): string {
  return randomBytes(length).toString("hex").toUpperCase();
}

export function generateRewardCode(prefix: "HUSEG-PIZZA" | "HUSEG-UDITO"): string {
  return `${prefix}-${generateRandomSuffix()}`;
}

export function countPaidPizzas(lineItems: unknown): number {
  const items = Array.isArray(lineItems) ? (lineItems as ShopifyLineItem[]) : [];
  return items.reduce<number>((sum, item) => {
    const variantTitle = String(item["variant_title"] ?? item["title"] ?? "").toLowerCase();
    const price = parseFloat(String(item["price"] ?? "0"));
    const qty = Number(item["quantity"] ?? 0);
    if (variantTitle.includes("cm") && price > 0 && qty > 0) {
      return sum + qty;
    }
    return sum;
  }, 0);
}

export function getOrderPhone(payload: ShopifyPayload): string | null {
  const customer = payload["customer"] as ShopifyCustomer | undefined;
  const shipping = payload["shipping_address"] as ShopifyAddress | undefined;
  const billing = payload["billing_address"] as ShopifyAddress | undefined;
  return normalizePhone(customer?.["phone"] ?? shipping?.["phone"] ?? billing?.["phone"]);
}

export async function createDiscountCode(
  supabaseAdmin: AdminClient,
  {
    code,
    value,
    maxUses = 1,
    expiresAt,
  }: {
    code: string;
    value: number;
    maxUses?: number;
    expiresAt: string;
  },
): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from("discount_codes")
    .insert({
      code,
      discount_type: "fixed",
      value,
      min_order_amount: 0,
      active: true,
      expires_at: expiresAt,
      max_uses: maxUses,
      used_count: 0,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Failed to create discount code:", error);
    return null;
  }
  return data.id;
}

export async function recordReward(
  supabaseAdmin: AdminClient,
  phone: string,
  rewardType: "free_pizza" | "free_drink",
  discountCodeId: string,
): Promise<void> {
  const { error } = await supabaseAdmin.from("loyalty_rewards").insert({
    phone,
    reward_type: rewardType,
    discount_code_id: discountCodeId,
  });
  if (error) {
    console.error("Failed to record loyalty reward:", error);
  }
}

export async function generateFreePizzaReward(
  supabaseAdmin: AdminClient,
  phone: string,
  expiresAt: string,
): Promise<void> {
  const code = generateRewardCode("HUSEG-PIZZA");
  const discountCodeId = await createDiscountCode(supabaseAdmin, {
    code,
    value: FREE_PIZZA_VALUE,
    maxUses: 1,
    expiresAt,
  });
  if (discountCodeId) {
    await recordReward(supabaseAdmin, phone, "free_pizza", discountCodeId);
  }
}

export async function generateFreeDrinkReward(
  supabaseAdmin: AdminClient,
  phone: string,
  expiresAt: string,
): Promise<void> {
  const code = generateRewardCode("HUSEG-UDITO");
  const discountCodeId = await createDiscountCode(supabaseAdmin, {
    code,
    value: FREE_DRINK_VALUE,
    maxUses: 1,
    expiresAt,
  });
  if (discountCodeId) {
    await recordReward(supabaseAdmin, phone, "free_drink", discountCodeId);
  }
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export async function processLoyaltyOrder(
  supabaseAdmin: AdminClient,
  payload: ShopifyPayload,
): Promise<{ processed: boolean; message?: string }> {
  const shopifyOrderId = String(payload["id"] ?? "");
  if (!shopifyOrderId) {
    return { processed: false, message: "Missing Shopify order id" };
  }

  const { data: existingOrder } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("shopify_order_id", shopifyOrderId)
    .maybeSingle();
  if (existingOrder) {
    return { processed: false, message: "Order already processed" };
  }

  const phone = getOrderPhone(payload);
  if (!phone) {
    return { processed: false, message: "No phone number in order" };
  }

  const orderDate = new Date(String(payload["created_at"] ?? Date.now()));
  const pizzaQty = countPaidPizzas(payload["line_items"]);

  const { data: customer } = await supabaseAdmin
    .from("loyalty_customers")
    .select("pizza_count, free_pizzas_awarded, last_order_at")
    .eq("phone", phone)
    .maybeSingle();

  const previousPizzaCount = customer?.pizza_count ?? 0;
  const previousAwarded = customer?.free_pizzas_awarded ?? 0;
  const newPizzaCount = previousPizzaCount + pizzaQty;
  const newlyAwardedFreePizzas =
    Math.floor(newPizzaCount / PIZZA_THRESHOLD) - previousAwarded;

  let drinkEarned = false;
  if (customer?.last_order_at) {
    const lastOrder = new Date(customer.last_order_at);
    const diffMs = orderDate.getTime() - lastOrder.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays >= 0 && diffDays <= DRINK_ELIGIBILITY_DAYS) {
      drinkEarned = true;
    }
  }

  const { error: upsertError } = await supabaseAdmin.from("loyalty_customers").upsert(
    {
      phone,
      pizza_count: newPizzaCount,
      free_pizzas_awarded: previousAwarded + Math.max(0, newlyAwardedFreePizzas),
      last_order_at: orderDate.toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "phone" },
  );
  if (upsertError) {
    console.error("Failed to upsert loyalty customer:", upsertError);
    return { processed: false, message: "Failed to update loyalty customer" };
  }

  for (let i = 0; i < newlyAwardedFreePizzas; i++) {
    await generateFreePizzaReward(
      supabaseAdmin,
      phone,
      addDays(orderDate, FREE_PIZZA_EXPIRY_DAYS).toISOString(),
    );
  }

  if (drinkEarned) {
    await generateFreeDrinkReward(
      supabaseAdmin,
      phone,
      addDays(orderDate, FREE_DRINK_EXPIRY_DAYS).toISOString(),
    );
  }

  await recordOrder(supabaseAdmin, payload, phone);
  await incrementUsedDiscountCodes(supabaseAdmin, payload["discount_codes"]);

  return { processed: true };
}

async function recordOrder(
  supabaseAdmin: AdminClient,
  payload: ShopifyPayload,
  phone: string,
): Promise<void> {
  const shipping = payload["shipping_address"] as ShopifyAddress | undefined;
  const customer = payload["customer"] as ShopifyCustomer | undefined;
  const firstName = String(shipping?.["first_name"] ?? customer?.["first_name"] ?? "");
  const lastName = String(shipping?.["last_name"] ?? customer?.["last_name"] ?? "");
  const customerName = `${firstName} ${lastName}`.trim() || "Vendég";

  const totalAmount = Math.round(parseFloat(String(payload["total_price"] ?? "0")));
  const discountAmount = Math.round(parseFloat(String(payload["total_discounts"] ?? "0")));
  const deliveryFee = Math.round(parseFloat(String(payload["total_shipping"] ?? "0")));

  const { error } = await supabaseAdmin.from("orders").insert({
    shopify_order_id: String(payload["id"] ?? ""),
    shopify_checkout_id: payload["checkout_id"] ? String(payload["checkout_id"]) : null,
    customer_name: customerName,
    email: customer?.["email"] ? String(customer["email"]) : null,
    phone,
    address: String(shipping?.["address1"] ?? "Nincs megadva"),
    city: String(shipping?.["city"] ?? "Szeged"),
    postal_code: String(shipping?.["zip"] ?? "6726"),
    payment_method: payload["financial_status"] === "paid" ? "online" : "cod",
    total_amount: totalAmount,
    discount_amount: discountAmount,
    delivery_fee: deliveryFee,
    notes: payload["note"] ? String(payload["note"]) : null,
  });

  if (error) {
    console.error("Failed to record order:", error);
  }
}

async function incrementUsedDiscountCodes(
  supabaseAdmin: AdminClient,
  discountCodes: unknown,
): Promise<void> {
  const codes = Array.isArray(discountCodes) ? (discountCodes as ShopifyLineItem[]) : [];
  for (const entry of codes) {
    const code = String(entry["code"] ?? "").toUpperCase();
    if (!code) continue;
    const { data } = await supabaseAdmin
      .from("discount_codes")
      .select("id, used_count")
      .eq("code", code)
      .maybeSingle();
    if (data) {
      const { error } = await supabaseAdmin
        .from("discount_codes")
        .update({ used_count: data.used_count + 1 })
        .eq("id", data.id);
      if (error) {
        console.error("Failed to increment used_count:", error);
      }
    }
  }
}
