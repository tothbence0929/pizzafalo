import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchProducts } from "@/lib/shopify";
import type { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";

export const EXTRAS_TYPE = "Feltét";
export const STUFFED_CRUST_TITLE = "Sajttal töltött szél";

export interface ExtraOption {
  product: ShopifyProduct;
  variantId: string;
  label: string;
  price: { amount: string; currencyCode: string };
  available: boolean;
  isCrust: boolean;
  selectedOptions: Array<{ name: string; value: string }>;
  variantTitle: string;
}

export function useExtraOptions() {
  const { data } = useQuery({
    queryKey: ["products", "extras-toppings"],
    queryFn: () => fetchProducts(100),
    staleTime: 5 * 60 * 1000,
  });

  const options: ExtraOption[] = (data ?? [])
    .filter((p) => p.node.productType === EXTRAS_TYPE)
    .flatMap((product) =>
      product.node.variants.edges.map(({ node: variant }) => {
        const isCrust = product.node.title === STUFFED_CRUST_TITLE;
        return {
          product,
          variantId: variant.id,
          label: isCrust || variant.title === "Default Title" ? product.node.title : variant.title,
          price: variant.price,
          available: variant.availableForSale,
          isCrust,
          selectedOptions: variant.selectedOptions ?? [],
          variantTitle: variant.title,
        };
      }),
    );

  // Stuffed crust first, then toppings by price
  options.sort((a, b) => {
    if (a.isCrust !== b.isCrust) return a.isCrust ? -1 : 1;
    return parseFloat(a.price.amount) - parseFloat(b.price.amount);
  });

  return options;
}

/** Selection state + helper to push the chosen extras into the cart. */
export function useExtrasSelection() {
  const options = useExtraOptions();
  const addItem = useCartStore((s) => s.addItem);
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (variantId: string) =>
    setSelected((prev) =>
      prev.includes(variantId) ? prev.filter((id) => id !== variantId) : [...prev, variantId],
    );

  const chosen = options.filter((o) => selected.includes(o.variantId));

  const extrasTotal = chosen.reduce((sum, o) => sum + parseFloat(o.price.amount), 0);

  const addExtrasToCart = async () => {
    for (const option of chosen) {
      await addItem({
        product: option.product,
        variantId: option.variantId,
        variantTitle: option.variantTitle,
        price: option.price,
        quantity: 1,
        selectedOptions: option.selectedOptions,
      });
    }
    setSelected([]);
  };

  return { options, selected, toggle, chosen, extrasTotal, addExtrasToCart };
}
