import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { processLoyaltyOrder } from "@/lib/loyalty.server";

export const Route = createFileRoute("/api/public/shopify-order")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["SHOPIFY_WEBHOOK_SECRET"];
        if (!secret) {
          console.error("SHOPIFY_WEBHOOK_SECRET is not configured");
          return new Response("Webhook secret not configured", { status: 401 });
        }

        const topic = request.headers.get("x-shopify-topic");
        if (!topic || !(topic === "orders/create" || topic === "orders/paid")) {
          return new Response("Unsupported topic", { status: 400 });
        }

        const signature = request.headers.get("x-shopify-hmac-sha256");
        const rawBody = await request.text();

        const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
        if (!signature || signature.length !== expected.length) {
          return new Response("Invalid signature", { status: 401 });
        }
        const sigBuf = Buffer.from(signature);
        const expBuf = Buffer.from(expected);
        if (!timingSafeEqual(sigBuf, expBuf)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let payload: Record<string, unknown>;
        try {
          payload = JSON.parse(rawBody);
        } catch {
          return new Response("Invalid JSON body", { status: 400 });
        }

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const result = await processLoyaltyOrder(supabaseAdmin, payload);
          if (result.processed) {
            return new Response("OK", { status: 200 });
          }
          console.log("Shopify order skipped:", result.message);
          return new Response("Skipped", { status: 200 });
        } catch (error) {
          console.error("Failed to process Shopify order webhook:", error);
          return new Response("Processing failed", { status: 500 });
        }
      },
    },
  },
});
