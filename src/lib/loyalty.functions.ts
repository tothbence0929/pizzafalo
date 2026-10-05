import { createServerFn } from "@tanstack/react-start";
import { normalizePhone } from "@/lib/loyalty";

export const getLoyaltyStatus = createServerFn({ method: "POST" })
  .inputValidator((data: { phone: string }) => data)
  .handler(async ({ data }) => {
    const phone = normalizePhone(data.phone);
    if (!phone) {
      return { customer: null, rewards: [] as LoyaltyReward[] };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: customer } = await supabaseAdmin
      .from("loyalty_customers")
      .select("*")
      .eq("phone", phone)
      .maybeSingle();

    const { data: rewards } = await supabaseAdmin
      .from("loyalty_rewards")
      .select(
        "reward_type, created_at, discount_codes(code, value, used_count, max_uses, expires_at)",
      )
      .eq("phone", phone)
      .order("created_at", { ascending: false });

    return {
      customer,
      rewards: (rewards ?? []) as unknown as LoyaltyReward[],
    };
  });

export interface LoyaltyReward {
  reward_type: "free_pizza" | "free_drink";
  created_at: string;
  discount_codes: {
    code: string;
    value: number;
    used_count: number;
    max_uses: number | null;
    expires_at: string | null;
  } | null;
}
