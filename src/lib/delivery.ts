export interface DeliveryZoneInfo {
  postal_code: string;
  city_area: string | null;
  delivery_fee: number;
  min_order_amount: number;
  eta_min: number;
  eta_max: number;
}

export const DELIVERY_ZONES: DeliveryZoneInfo[] = [
  {
    postal_code: "6720",
    city_area: "Belváros",
    delivery_fee: 490,
    min_order_amount: 0,
    eta_min: 30,
    eta_max: 40,
  },
  {
    postal_code: "6726",
    city_area: "Újszeged",
    delivery_fee: 490,
    min_order_amount: 0,
    eta_min: 30,
    eta_max: 40,
  },
  {
    postal_code: "6721",
    city_area: "Belváros keleti rész",
    delivery_fee: 590,
    min_order_amount: 0,
    eta_min: 35,
    eta_max: 45,
  },
  {
    postal_code: "6722",
    city_area: "Rókus",
    delivery_fee: 590,
    min_order_amount: 0,
    eta_min: 35,
    eta_max: 45,
  },
  {
    postal_code: "6723",
    city_area: "Felsőváros",
    delivery_fee: 690,
    min_order_amount: 0,
    eta_min: 35,
    eta_max: 50,
  },
  {
    postal_code: "6724",
    city_area: "Móraváros",
    delivery_fee: 690,
    min_order_amount: 0,
    eta_min: 35,
    eta_max: 50,
  },
  {
    postal_code: "6725",
    city_area: "Alsóváros",
    delivery_fee: 690,
    min_order_amount: 0,
    eta_min: 35,
    eta_max: 50,
  },
];

export const FREE_SHIPPING_THRESHOLD = 8000;

export function deliveryFeeFor(subtotal: number, zone: DeliveryZoneInfo | null): number {
  if (!zone) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : zone.delivery_fee;
}

export function findZone(postalCode: string): DeliveryZoneInfo | null {
  const code = postalCode.trim();
  return DELIVERY_ZONES.find((z) => z.postal_code === code) ?? null;
}

export function discountValue(
  subtotal: number,
  type: "percentage" | "fixed" | null,
  amount: number,
): number {
  if (!type || amount <= 0) return 0;
  if (type === "percentage") return Math.round((subtotal * amount) / 100);
  return Math.min(amount, subtotal);
}

/**
 * Shopify variants of the "Kiszállítási díj" product, keyed by fee amount.
 * The fee is added to the Shopify cart as a line item so the checkout total
 * matches the zone-based fee shown in our cart.
 */
export const DELIVERY_FEE_VARIANTS: Record<number, string> = {
  490: "gid://shopify/ProductVariant/65894464815453",
  590: "gid://shopify/ProductVariant/65894464848221",
  690: "gid://shopify/ProductVariant/65894464880989",
};

export const DELIVERY_FEE_VARIANT_IDS = Object.values(DELIVERY_FEE_VARIANTS);

export function deliveryFeeVariantId(fee: number): string | null {
  return DELIVERY_FEE_VARIANTS[fee] ?? null;
}

export const PICKUP_ETA_MINUTES = 30;
export const PICKUP_ADDRESS = "6726 Szeged, Vedres utca 14.";
