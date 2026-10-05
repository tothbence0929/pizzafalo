import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ShopifyProduct } from "@/lib/shopify";
import { formatPrice } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { useUpsellStore } from "@/stores/upsellStore";
import { EXTRA_TYPES } from "@/components/UpsellRow";
import { ExtrasPicker } from "@/components/ExtrasPicker";
import { useExtrasSelection, EXTRAS_TYPE } from "@/lib/extras";
import { isMonthlyFavorite, originalPriceFromDiscounted } from "@/lib/offers";
import { ShoppingCart, Eye, Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProductCardProps {
  product: ShopifyProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const node = product.node;
  const addItem = useCartStore((state) => state.addItem);
  const showUpsell = useUpsellStore((s) => s.show);
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [extrasOpen, setExtrasOpen] = useState(false);
  const {
    options,
    selected: selectedExtras,
    toggle,
    extrasTotal,
    addExtrasToCart,
  } = useExtrasSelection();
  const isPizzaLike = ![...EXTRA_TYPES, EXTRAS_TYPE, "Ajándék", "Ajánlat"].includes(
    node.productType,
  );

  const variants = node.variants.edges.map((e) => e.node);
  const [variantId, setVariantId] = useState<string | null>(null);
  const selected = variants.find((v) => v.id === variantId) ?? variants[0];
  const firstImage = node.images.edges[0]?.node;

  const handleAdd = async () => {
    if (!selected) return;
    setAdding(true);
    await addItem({
      product,
      variantId: selected.id,
      variantTitle: selected.title,
      price: selected.price,
      quantity: 1,
      selectedOptions: selected.selectedOptions ?? [],
    });
    if (isPizzaLike && selectedExtras.length > 0) await addExtrasToCart();
    setAdding(false);
    setJustAdded(true);
    toast.success(`${node.title} a kosárban`, {
      description: selected.title !== "Default Title" ? selected.title : undefined,
    });
    if (!EXTRA_TYPES.includes(node.productType)) showUpsell(node.title);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const showSizes = variants.length > 1;

  return (
    <Card className="group flex flex-col overflow-hidden bg-card-gradient border-border/40 transition-all duration-300 hover:border-brand/30 hover:shadow-xl hover:shadow-brand/5">
      <Link
        to="/product/$handle"
        params={{ handle: node.handle }}
        className="block relative aspect-[4/3] overflow-hidden"
      >
        {firstImage ? (
          <img
            src={firstImage.url}
            alt={firstImage.altText ?? node.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground">
            🍕
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent opacity-60" />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link to="/product/$handle" params={{ handle: node.handle }}>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-brand transition-colors">
                {node.title}
              </h3>
            </Link>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {node.description || "Friss, ízletes fogás"}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {isMonthlyFavorite(product) && (
              <Badge className="border-none bg-brand text-brand-foreground">−20%</Badge>
            )}
            <div className="flex items-center gap-2">
              {isMonthlyFavorite(product) && selected && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(originalPriceFromDiscounted(selected.price.amount), selected.price.currencyCode)}
                </span>
              )}
              <span className="text-lg font-bold text-brand whitespace-nowrap">
                {selected
                  ? formatPrice(selected.price.amount, selected.price.currencyCode)
                  : formatPrice(
                      node.priceRange.minVariantPrice.amount,
                      node.priceRange.minVariantPrice.currencyCode,
                    )}
              </span>
            </div>
          </div>
        </div>

        {showSizes && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {node.options[0]?.name ?? "Méret"}
            </p>
            <div className="flex flex-wrap gap-2">
              {variants.map((variant) => {
                const active = selected?.id === variant.id;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setVariantId(variant.id)}
                    disabled={!variant.availableForSale}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 ${
                      active
                        ? "border-brand bg-brand text-brand-foreground"
                        : "border-border/60 text-muted-foreground hover:border-brand/50 hover:text-foreground"
                    }`}
                  >
                    {variant.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isPizzaLike && options.length > 0 && (
          <div className="mt-4 border-t border-border/40 pt-3">
            <button
              type="button"
              onClick={() => setExtrasOpen((v) => !v)}
              className="flex w-full items-center justify-between text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
            >
              <span>
                Extrák, sajtos szél
                {selectedExtras.length > 0 ? ` (${selectedExtras.length})` : ""}
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${extrasOpen ? "rotate-180" : ""}`}
              />
            </button>
            {extrasOpen && (
              <ExtrasPicker
                options={options}
                selected={selectedExtras}
                onToggle={toggle}
                extrasTotal={extrasTotal}
                compact
              />
            )}
          </div>
        )}

        <div className="mt-auto flex items-center gap-2 pt-4">
          <Button
            size="sm"
            className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={handleAdd}
            disabled={adding || !selected?.availableForSale}
          >
            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : justAdded ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Hozzáadva
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Kosárba
              </>
            )}
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="border-border/60 hover:bg-secondary"
            asChild
          >
            <Link to="/product/$handle" params={{ handle: node.handle }}>
              <Eye className="h-4 w-4" />
              <span className="sr-only">Részletek</span>
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
