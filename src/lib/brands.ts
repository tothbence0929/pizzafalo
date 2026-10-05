import type { ShopifyProduct } from "@/lib/shopify";
import gustavosImage from "@/assets/brand-gustavos.jpg";

const A_PIZZA_IMAGE =
  "https://cdn.shopify.com/s/files/1/1108/9631/6765/files/a-pizza-klasszik-szalami.jpg?v=1789424990";

export const HOUSE_VENDOR = "Pizzafaló";

export interface Brand {
  slug: string;
  name: string;
  tagline: string;
  vendor: string;
  description: string;
  image: string;
  categories: Array<{ label: string; types: string[] }>;
}

export const BRANDS: Brand[] = [
  {
    slug: "a-pizza",
    name: "A Pizza.",
    tagline: "Pan style pizza",
    vendor: "A Pizza.",
    description:
      "Belül puha, kívül ropogós vastag tészta, gazdagon megpakolva. Pan style pizzák 26 és 30 cm-es méretben, ugyanabból a szegedi konyhából.",
    image: A_PIZZA_IMAGE,
    categories: [{ label: "Pan style pizzák", types: ["Pizza"] }],
  },
  {
    slug: "gustavos",
    name: "Gustavo's",
    tagline: "Pizza and more",
    vendor: "Gustavo's",
    description:
      "Klasszikus és vegetáriánus pizzák, fehér alapos különlegességek és forró, szaftos calzonék — prémium alapanyagokból.",
    image: gustavosImage,
    categories: [
      { label: "Pizzák", types: ["Pizza"] },
      { label: "Calzone", types: ["Calzone"] },
    ],
  },
];

export function findBrand(slug: string): Brand | undefined {
  return BRANDS.find((b) => b.slug === slug);
}

export function isHouseProduct(product: ShopifyProduct) {
  return !product.node.vendor || product.node.vendor === HOUSE_VENDOR;
}
