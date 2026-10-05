import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Loader2, Check } from "lucide-react";
import { fetchProducts, formatPrice } from "@/lib/shopify";
import type { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

export const EXTRA_TYPES = ["Ital", "Desszert", "Szósz"];

interface UpsellRowProps {
  title?: string;
  excludeHandle?: string;
  limit?: number;
  compact?: boolean;
}

export function UpsellRow({
  title = "Kérsz mellé valamit?",
  excludeHandle,
  limit = 4,
  compact = false,
}: UpsellRowProps) {
  const { data } = useQuery({
    queryKey: ["products", "extras"],
    queryFn: () => fetchProducts(100),
    staleTime: 5 * 60 * 1000,
  });

  const items = (data ?? [])
    .filter((p) => EXTRA_TYPES.includes(p.node.productType))
    .filter((p) => p.node.handle !== excludeHandle)
    .slice(0, limit);

  if (items.length === 0) return null;

  return (
    <div className={compact ? "" : "mt-12"}>
      <h3
        className={
          compact ? "text-sm font-semibold text-foreground" : "text-xl font-bold text-foreground"
        }
      >
        {title}
      </h3>
      <div
        className={
          compact
            ? "mt-3 grid grid-cols-2 gap-2"
            : "mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        }
      >
        {items.map((item) => (
          <UpsellItem key={item.node.id} product={item} compact={compact} />
        ))}
      </div>
    </div>
  );
}

function UpsellItem({ product, compact }: { product: ShopifyProduct; compact: boolean }) {
  const addItem = useCartStore((s) => s.addItem);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const node = product.node;
  const variant = node.variants.edges[0]?.node;
  const image = node.images.edges[0]?.node;

  const handleAdd = async () => {
    if (!variant) return;
    setAdding(true);
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions ?? [],
    });
    setAdding(false);
    setAdded(true);
    toast.success(`${node.title} a kosárban`);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={adding || !variant?.availableForSale}
      className="group flex items-center gap-3 rounded-lg border border-border/40 bg-secondary/30 p-2 text-left transition-colors hover:border-brand/40 hover:bg-secondary/60 disabled:opacity-50"
    >
      <div
        className={`${compact ? "h-12 w-12" : "h-16 w-16"} flex-shrink-0 overflow-hidden rounded-md bg-muted`}
      >
        {image && (
          <img
            src={image.url}
            alt={image.altText ?? node.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{node.title}</p>
        {variant && (
          <p className="text-sm font-semibold text-brand">
            {formatPrice(variant.price.amount, variant.price.currencyCode)}
          </p>
        )}
      </div>
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground">
        {adding ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : added ? (
          <Check className="h-4 w-4" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
      </span>
    </button>
  );
}
