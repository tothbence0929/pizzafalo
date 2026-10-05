/**
 * Egységes mérési réteg: Meta Pixel (böngésző) + Meta Conversions API (szerver)
 * + Google Analytics 4. Csak böngészőben fut.
 */
import { sendMetaEvent } from "@/lib/meta-capi.functions";
import { getAnalyticsConfig } from "@/lib/analytics-config.functions";

export const META_PIXEL_ID = "25512891468361668";

/** A GA4 azonosítót a szerveren tároljuk; induláskor töltjük be. */
let gaMeasurementId =
  (import.meta.env["VITE_GA_MEASUREMENT_ID"] as string | undefined) ?? "";
export function getGaMeasurementId() {
  return gaMeasurementId;
}

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean; callMethod?: unknown; version?: string };
    _fbq?: unknown;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __analyticsReady?: boolean;
  }
}

function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function newEventId() {
  if (isBrowser() && window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readCookie(name: string): string | undefined {
  if (!isBrowser()) return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

/** Egyszer betölti a Meta Pixelt és a GA4-et. */
export function initAnalytics() {
  if (!isBrowser() || window.__analyticsReady) return;
  window.__analyticsReady = true;

  // --- Meta Pixel ---
  type Fbq = NonNullable<Window["fbq"]>;
  const fbq = function (...args: unknown[]) {
    const f = window.fbq as Fbq;
    if (f.callMethod) (f.callMethod as (...a: unknown[]) => void).apply(f, args);
    else (f.queue as unknown[]).push(args);
  } as Fbq;
  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";
  window.fbq = fbq;
  window._fbq = fbq;
  const fbScript = document.createElement("script");
  fbScript.async = true;
  fbScript.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(fbScript);
  fbq("init", META_PIXEL_ID);

  // --- Google Analytics 4 ---
  const initGa = (late = false) => {
    if (!isBrowser() || !gaMeasurementId || window.gtag) return;
    window.dataLayer = window.dataLayer || [];
    // A gtag.js csak az `arguments` objektumot ismeri fel, sima tömböt nem.
    const gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    } as (...args: unknown[]) => void;
    window.gtag = gtag;
    const gaScript = document.createElement("script");
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`;
    document.head.appendChild(gaScript);
    gtag("js", new Date());
    gtag("config", gaMeasurementId, { send_page_view: false });
    // Ha az azonosító később érkezett, az első oldalmegtekintés még nem ment ki.
    if (late) {
      gtag("event", "page_view", {
        page_path: window.location.pathname,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  };
  initGa();
  // Ha nincs build-time azonosító, a szerveren tárolt értéket kérjük le.
  if (!gaMeasurementId) {
    void getAnalyticsConfig()
      .then((config) => {
        if (config.gaMeasurementId) {
          gaMeasurementId = config.gaMeasurementId;
          initGa(true);
        }
      })
      .catch(() => {
        /* a mérés hibája ne törje meg az oldalt */
      });
  }
}

export interface TrackedItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
  category?: string;
}

const CURRENCY = "HUF";

function gaItems(items: TrackedItem[]) {
  return items.map((i) => ({
    item_id: i.id,
    item_name: i.name,
    item_variant: i.variant,
    item_category: i.category,
    price: i.price,
    quantity: i.quantity,
  }));
}

function itemsValue(items: TrackedItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

function fireCapi(
  eventName: string,
  eventId: string,
  value?: number,
  items?: TrackedItem[],
  extra?: { email?: string; phone?: string },
) {
  void sendMetaEvent({
    data: {
      eventName,
      eventId,
      eventSourceUrl: isBrowser() ? window.location.href : undefined,
      value,
      currency: CURRENCY,
      contentIds: items?.map((i) => i.id),
      contents: items?.map((i) => ({ id: i.id, quantity: i.quantity, item_price: i.price })),
      fbp: readCookie("_fbp"),
      fbc: readCookie("_fbc"),
      email: extra?.email,
      phone: extra?.phone,
    },
  }).catch(() => {
    /* a mérés hibája soha ne törje meg a vásárlást */
  });
}

export function trackPageView(path?: string) {
  if (!isBrowser()) return;
  const eventId = newEventId();
  window.fbq?.("track", "PageView", {}, { eventID: eventId });
  if (gaMeasurementId) {
    window.gtag?.("event", "page_view", {
      page_path: path ?? window.location.pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }
  fireCapi("PageView", eventId);
}

export function trackViewItem(item: TrackedItem) {
  if (!isBrowser()) return;
  const eventId = newEventId();
  const value = item.price * item.quantity;
  window.fbq?.(
    "track",
    "ViewContent",
    {
      content_ids: [item.id],
      content_name: item.name,
      content_type: "product",
      value,
      currency: CURRENCY,
    },
    { eventID: eventId },
  );
  window.gtag?.("event", "view_item", {
    currency: CURRENCY,
    value,
    items: gaItems([item]),
  });
  fireCapi("ViewContent", eventId, value, [item]);
}

export function trackAddToCart(item: TrackedItem) {
  if (!isBrowser()) return;
  const eventId = newEventId();
  const value = item.price * item.quantity;
  window.fbq?.(
    "track",
    "AddToCart",
    {
      content_ids: [item.id],
      content_name: item.name,
      content_type: "product",
      value,
      currency: CURRENCY,
    },
    { eventID: eventId },
  );
  window.gtag?.("event", "add_to_cart", {
    currency: CURRENCY,
    value,
    items: gaItems([item]),
  });
  fireCapi("AddToCart", eventId, value, [item]);
}

export function trackBeginCheckout(items: TrackedItem[], value?: number) {
  if (!isBrowser()) return;
  const eventId = newEventId();
  const total = value ?? itemsValue(items);
  window.fbq?.(
    "track",
    "InitiateCheckout",
    {
      content_ids: items.map((i) => i.id),
      content_type: "product",
      num_items: items.reduce((s, i) => s + i.quantity, 0),
      value: total,
      currency: CURRENCY,
    },
    { eventID: eventId },
  );
  window.gtag?.("event", "begin_checkout", {
    currency: CURRENCY,
    value: total,
    items: gaItems(items),
  });
  fireCapi("InitiateCheckout", eventId, total, items);
}

export function trackPurchase(
  items: TrackedItem[],
  value: number,
  transactionId?: string,
  buyer?: { email?: string; phone?: string },
) {
  if (!isBrowser()) return;
  const eventId = transactionId ? `purchase-${transactionId}` : newEventId();
  window.fbq?.(
    "track",
    "Purchase",
    {
      content_ids: items.map((i) => i.id),
      content_type: "product",
      value,
      currency: CURRENCY,
    },
    { eventID: eventId },
  );
  window.gtag?.("event", "purchase", {
    transaction_id: transactionId,
    currency: CURRENCY,
    value,
    items: gaItems(items),
  });
  fireCapi("Purchase", eventId, value, items, buyer);
}

/** Egyéb interakciók: telefonhívás, hűségprogram, nyereményjáték. */
export function trackInteraction(
  name:
    | "phone_call"
    | "loyalty_click"
    | "giveaway_click"
    | "custom_pizza_start"
    | "preorder_open"
    | "preorder_set"
    | "newsletter_signup",
  params?: Record<string, unknown>,
) {
  if (!isBrowser()) return;
  const eventId = newEventId();
  const metaName = name === "phone_call" ? "Contact" : "Lead";
  window.fbq?.("trackCustom", name, params ?? {}, { eventID: eventId });
  window.fbq?.("track", metaName, params ?? {}, { eventID: `${eventId}-std` });
  window.gtag?.("event", name, params ?? {});
  fireCapi(metaName, `${eventId}-std`);
}
