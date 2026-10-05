import { createServerFn } from "@tanstack/react-start";
import {
  FIRST_ORDER_CODE_PREFIX,
  FIRST_ORDER_DRINK_VALUE,
  FIRST_ORDER_EXPIRY_DAYS,
  FIRST_ORDER_MIN_AMOUNT,
} from "@/lib/first-order";
import { normalizePhone } from "@/lib/loyalty";

export interface FirstOrderCouponResult {
  ok: boolean;
  code?: string;
  alreadySubscribed?: boolean;
  error?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const subscribeForFirstOrderCoupon = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; phone: string }) => data)
  .handler(async ({ data }): Promise<FirstOrderCouponResult> => {
    const email = data.email.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return { ok: false, error: "Érvénytelen e-mail-cím." };
    }
    const phone = normalizePhone(data.phone?.trim());
    if (!phone) {
      return { ok: false, error: "Adj meg egy érvényes telefonszámot." };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { randomBytes } = await import("crypto");

    // Ugyanaz az e-mail vagy telefonszám csak egyszer kap kódot.
    const { data: existingRows } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("id, discount_code_id, discount_codes(code)")
      .or(`email.eq.${email},phone.eq.${phone}`)
      .limit(1);

    const existingCode = (
      existingRows as { discount_codes?: { code: string } | null }[] | null
    )?.[0]?.discount_codes?.code;
    if (existingCode) {
      return { ok: true, code: existingCode, alreadySubscribed: true };
    }

    const code = `${FIRST_ORDER_CODE_PREFIX}-${randomBytes(3).toString("hex").toUpperCase()}`;
    const expiresAt = new Date(
      Date.now() + FIRST_ORDER_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data: inserted, error: codeError } = await supabaseAdmin
      .from("discount_codes")
      .insert({
        code,
        discount_type: "fixed",
        value: FIRST_ORDER_DRINK_VALUE,
        min_order_amount: FIRST_ORDER_MIN_AMOUNT,
        active: true,
        expires_at: expiresAt,
        max_uses: 1,
        used_count: 0,
      })
      .select("id, code")
      .single();

    if (codeError || !inserted) {
      console.error("Failed to create gift drink coupon:", codeError);
      return { ok: false, error: "A kupon létrehozása nem sikerült." };
    }

    const { error: subError } = await supabaseAdmin.from("newsletter_subscribers").upsert(
      { email, phone, discount_code_id: inserted.id },
      { onConflict: "email" },
    );
    if (subError) {
      console.error("Failed to save subscriber:", subError);
      return { ok: false, error: "A feliratkozás nem sikerült." };
    }

    return { ok: true, code: inserted.code };
  });
