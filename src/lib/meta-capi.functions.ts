import { createServerFn } from "@tanstack/react-start";

export interface MetaEventInput {
  eventName: string;
  eventId: string;
  eventSourceUrl?: string | undefined;
  value?: number | undefined;
  currency?: string | undefined;
  contentIds?: string[] | undefined;
  contents?: Array<{ id: string; quantity: number; item_price: number }> | undefined;
  fbp?: string | undefined;
  fbc?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
}

const PIXEL_ID = "25512891468361668";

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Meta Conversions API: szerver oldali eseményküldés.
 * Ugyanazzal az eventId-vel megy, mint a böngészőben futó Pixel esemény,
 * így a Meta deduplikálja őket.
 */
export const sendMetaEvent = createServerFn({ method: "POST" })
  .inputValidator((input: MetaEventInput) => input)
  .handler(async ({ data }) => {
    const token = process.env["META_CAPI_ACCESS_TOKEN"];
    if (!token) return { sent: false, reason: "missing_token" as const };

    const userData: Record<string, unknown> = {};
    if (data.fbp) userData["fbp"] = data.fbp;
    if (data.fbc) userData["fbc"] = data.fbc;
    if (data.email) userData["em"] = [await sha256(data.email)];
    if (data.phone) {
      userData["ph"] = [await sha256(data.phone.replace(/[^\d]/g, ""))];
    }

    const customData: Record<string, unknown> = {};
    if (typeof data.value === "number") customData["value"] = data.value;
    if (data.currency) customData["currency"] = data.currency;
    if (data.contentIds?.length) {
      customData["content_ids"] = data.contentIds;
      customData["content_type"] = "product";
    }
    if (data.contents?.length) customData["contents"] = data.contents;

    const body = {
      data: [
        {
          event_name: data.eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: data.eventId,
          event_source_url: data.eventSourceUrl,
          action_source: "website",
          user_data: userData,
          custom_data: customData,
        },
      ],
    };

    try {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      if (!res.ok) {
        const text = await res.text();
        console.error(`Meta CAPI failed [${res.status}]: ${text}`);
        return { sent: false, reason: "provider_error" as const };
      }
      return { sent: true as const };
    } catch (error) {
      console.error("Meta CAPI request error", error);
      return { sent: false, reason: "network_error" as const };
    }
  });
