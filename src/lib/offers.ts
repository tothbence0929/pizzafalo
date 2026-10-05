import type { ShopifyProduct } from "@/lib/shopify";

export const GIFT_PIZZA_TITLE = "Ajándék sonkás pizza 26 cm";
export const GIFT_DRINK_TITLE = "Ajándék üdítő 0,5 l";
export const CUSTOM_PIZZA_TITLE = "Te Pizzád";
export const MONTHLY_TITLE = "Hónap kedvence — Kolbász-Kukorica";
export const MONTHLY_DISCOUNT_PERCENT = 20;

/** Product types that must never show up in the regular menu / upsell lists. */
export const OFFER_ONLY_TYPES = [
  "Ajándék",
  "Ajánlat",
  "Feltét",
  "Egyedi",
  "Ingyenes feltét",
  "Szósz",
  "Szállítás",
];

export function isPizza(product: ShopifyProduct) {
  return product.node.productType === "Pizza";
}

export function isMonthlyFavorite(product: ShopifyProduct) {
  return product.node.title === MONTHLY_TITLE;
}

export function findByTitle(products: ShopifyProduct[], title: string) {
  return products.find((p) => p.node.title === title);
}

export type Variant = ShopifyProduct["node"]["variants"]["edges"][number]["node"];

export function variantsOf(product?: ShopifyProduct): Variant[] {
  return product?.node.variants.edges.map((e) => e.node) ?? [];
}

export function originalPriceFromDiscounted(amount: string): string {
  const discounted = parseFloat(amount);
  if (!discounted || discounted <= 0) return amount;
  return (discounted / (1 - MONTHLY_DISCOUNT_PERCENT / 100)).toFixed(2);
}
