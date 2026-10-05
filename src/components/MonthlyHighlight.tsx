import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchProducts, formatPrice } from "@/lib/shopify";
import {
  MONTHLY_TITLE,
  MONTHLY_DISCOUNT_PERCENT,
  findByTitle,
  originalPriceFromDiscounted,
  variantsOf,
} from "@/lib/offers";
import { useCartStore } from "@/stores/cartStore";
import { useUpsellStore } from "@/stores/upsellStore";

export function MonthlyHighlight() {
  const { data, isLoading } = useQuery({
    queryKey: ["products", "offers"],
    queryFn: () => fetchProducts(100),
    staleTime: 5 * 60 * 1000,
  });

  const monthly = findByTitle(data ?? [], MONTHLY_TITLE);
  const variants = variantsOf(monthly);
  const [variantId, setVariantId] = useState<string | null>(null);
  const selected = variants.find((v) => v.id === variantId) ?? variants[0];
  const image = monthly?.node.images.edges[0]?.node;

  const addItem = useCartStore((s) => s.addItem);
  const showUpsell = useUpsellStore((s) => s.show);
  const [adding, setAdding] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-56 items-center justify-center rounded-2xl border border-brand/30 bg-brand/5">
        <Loader2 className="h-5 w-5 animate-spin text-brand" />
      </div>
    );
  }

  if (!monthly || !selected) return null;

  const handleAdd = async () => {
    setAdding(true);
    try {
      await addItem({
        product: monthly,
        variantId: selected.id,
        variantTitle: selected.title,
        price: selected.price,
        quantity: 1,
        selectedOptions: selected.selectedOptions ?? [],
      });
      toast.success("Hónap kedvence a kosárban", {
        description: `${selected.title} — 20% kedvezménnyel`,
      });
      showUpsell(monthly.node.title);
    } finally {
      setAdding(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-brand/40 bg-brand/5">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative aspect-[4/3] md:aspect-auto md:min-h-64">
          {image ? (
            <img
              src={image.url}
              alt={image.altText ?? monthly.node.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-4xl">
              🍕
            </div>
          )}
          <Badge className="absolute left-4 top-4 border-none bg-brand text-brand-foreground">
            Hónap kedvence- Csak weben −20%
          </Badge>
        </div>

        <div className="flex flex-col justify-center gap-4 p-6 lg:p-8">
          <p className="flex items-center gap-2 text-sm font-semibold text-brand">
            <Star className="h-4 w-4" />
            Az aktuális akciónk
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Kolbász-Kukorica pizza 20% kedvezménnyel
          </h2>
          <p className="text-sm text-muted-foreground">
            A hónap pizzája kedvezményes áron — válassz méretet, és egyetlen kattintással a kosárba
            kerül.
          </p>

          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const active = selected.id === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVariantId(v.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-border/60 text-muted-foreground hover:border-brand/50 hover:text-foreground"
                  }`}
                >
                  {v.title}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-base text-muted-foreground line-through">
                {formatPrice(
                  originalPriceFromDiscounted(selected.price.amount),
                  selected.price.currencyCode,
                )}
              </span>
              <span className="text-2xl font-bold text-brand">
                {formatPrice(selected.price.amount, selected.price.currencyCode)}
              </span>
              <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-brand-foreground">
                −{MONTHLY_DISCOUNT_PERCENT}%
              </span>
            </div>
            <Button
              size="lg"
              className="bg-brand font-semibold text-brand-foreground hover:bg-brand/90"
              onClick={handleAdd}
              disabled={adding}
            >
              {adding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Kosárba
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
