import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Gift, Loader2, Pizza, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { fetchProducts, formatPrice } from "@/lib/shopify";
import type { ShopifyProduct } from "@/lib/shopify";
import { GIFT_PIZZA_TITLE, MONTHLY_TITLE, findByTitle, isPizza, variantsOf } from "@/lib/offers";
import { useCartStore } from "@/stores/cartStore";
import { cn } from "@/lib/utils";
import type { CartItem } from "@/stores/cartStore";

export function OffersSection({
  compact = false,
  hideMonthly = false,
}: {
  compact?: boolean;
  hideMonthly?: boolean;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["products", "offers"],
    queryFn: () => fetchProducts(100),
    staleTime: 5 * 60 * 1000,
  });

  const products = data ?? [];
  const pizzas = useMemo(() => products.filter(isPizza), [products]);
  const giftPizza = findByTitle(products, GIFT_PIZZA_TITLE);
  const monthly = findByTitle(products, MONTHLY_TITLE);

  return (
    <section className="container mx-auto px-4 py-16 lg:px-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ajánlatok
          </h2>
          <p className="mt-2 text-muted-foreground">
            Nincs kuponkód — válaszd ki a pizzákat, és egy kattintással a kosárba kerül a teljes
            ajánlat.
          </p>
        </div>
        {compact && (
          <Button variant="outline" className="hidden border-border/60 sm:inline-flex" asChild>
            <Link to="/ajanlataink">Összes ajánlat</Link>
          </Button>
        )}
      </div>

      <div
        className={cn(
          "mt-8 grid grid-cols-1 gap-6",
          hideMonthly ? "md:max-w-xl md:mx-auto" : "md:grid-cols-2",
        )}
      >
        <BundleCard
          icon={Pizza}
          badge="Ajándék pizza"
          title="2+1 ajánlat"
          subtitle="2 db 30 cm-es pizza + ajándék"
          description="Válassz két 30 cm-es pizzát, és 26 cm-es sonkás pizzát adunk ajándékba, 0 Ft-ért."
          pizzaCount={2}
          drinkCount={0}
          requiredSize="30 cm"
          pizzas={pizzas}
          giftPizza={giftPizza}
          giftDrink={undefined}
          isLoading={isLoading}
        />
        {!hideMonthly && <MonthlyCard monthly={monthly} isLoading={isLoading} />}
      </div>
    </section>
  );
}

interface BundleCardProps {
  icon: typeof Pizza;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  pizzaCount: number;
  drinkCount: number;
  pizzas: ShopifyProduct[];
  giftPizza: ShopifyProduct | undefined;
  giftDrink: ShopifyProduct | undefined;
  isLoading: boolean;
  /** When set, only this variant size can be chosen for the bundle pizzas. */
  requiredSize?: string;
}

function CardShell({
  icon: Icon,
  badge,
  title,
  subtitle,
  description,
  children,
}: {
  icon: typeof Pizza;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <article className="relative flex flex-col overflow-hidden rounded-xl border border-border/40 bg-card p-6">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/15 text-brand">
          <Icon className="h-5 w-5" />
        </span>
        <Badge className="border-none bg-brand text-brand-foreground">{badge}</Badge>
      </div>
      <h3 className="mt-4 text-xl font-bold text-foreground">{title}</h3>
      <p className="text-sm font-medium text-brand">{subtitle}</p>
      <p className="mt-3 flex-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-5">{children}</div>
    </article>
  );
}

function BundleCard(props: BundleCardProps) {
  const { pizzaCount, drinkCount, pizzas, giftPizza, giftDrink, isLoading, requiredSize } = props;
  const allowedVariants = (product?: ShopifyProduct) =>
    variantsOf(product).filter((v) => !requiredSize || v.title === requiredSize);
  const [open, setOpen] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const [adding, setAdding] = useState(false);

  const [pizzaChoices, setPizzaChoices] = useState<Array<{ handle: string; variantId: string }>>(
    Array.from({ length: pizzaCount }, () => ({ handle: "", variantId: "" })),
  );
  const [drinkChoices, setDrinkChoices] = useState<string[]>(
    Array.from({ length: drinkCount }, () => ""),
  );

  const giftPizzaVariant = variantsOf(giftPizza)[0];
  const giftDrinkVariants = variantsOf(giftDrink);

  const resolved = pizzaChoices.map((choice) => {
    const product = pizzas.find((p) => p.node.handle === choice.handle);
    const variant = allowedVariants(product).find((v) => v.id === choice.variantId);
    return { product, variant };
  });

  const ready =
    resolved.every((r) => r.product && r.variant) &&
    (drinkCount === 0 || drinkChoices.every((d) => d)) &&
    (drinkCount === 0 ? !!giftPizzaVariant : giftDrinkVariants.length > 0);

  const pizzaTotal = resolved.reduce(
    (sum, r) => sum + (r.variant ? parseFloat(r.variant.price.amount) : 0),
    0,
  );
  const currency = resolved[0]?.variant?.price.currencyCode ?? "HUF";

  const handleAdd = async () => {
    if (!ready) return;
    setAdding(true);
    try {
      const lines: Array<Omit<CartItem, "lineId">> = [];
      for (const r of resolved) {
        lines.push({
          product: r.product!,
          variantId: r.variant!.id,
          variantTitle: r.variant!.title,
          price: r.variant!.price,
          quantity: 1,
          selectedOptions: r.variant!.selectedOptions ?? [],
        });
      }
      if (drinkCount === 0 && giftPizza && giftPizzaVariant) {
        lines.push({
          product: giftPizza,
          variantId: giftPizzaVariant.id,
          variantTitle: giftPizzaVariant.title,
          price: giftPizzaVariant.price,
          quantity: 1,
          selectedOptions: giftPizzaVariant.selectedOptions ?? [],
        });
      }
      if (drinkCount > 0 && giftDrink) {
        for (const variantId of drinkChoices) {
          const variant = giftDrinkVariants.find((v) => v.id === variantId);
          if (!variant) continue;
          lines.push({
            product: giftDrink,
            variantId: variant.id,
            variantTitle: variant.title,
            price: variant.price,
            quantity: 1,
            selectedOptions: variant.selectedOptions ?? [],
          });
        }
      }
      for (const line of lines) {
        await addItem(line);
      }
      toast.success(`${props.title} a kosárban`, {
        description:
          drinkCount === 0
            ? "Az ajándék pizzát 0 Ft-ért adtuk hozzá."
            : "A két ajándék üdítőt 0 Ft-ért adtuk hozzá.",
      });
      setOpen(false);
    } finally {
      setAdding(false);
    }
  };

  return (
    <CardShell {...props}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ajánlat összeállítása"}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[85vh] overflow-y-auto bg-card sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">{props.title}</DialogTitle>
            <DialogDescription>{props.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {pizzaChoices.map((choice, index) => {
              const product = pizzas.find((p) => p.node.handle === choice.handle);
              const variants = allowedVariants(product);
              return (
                <div key={index} className="rounded-lg border border-border/40 bg-secondary/20 p-3">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {index + 1}. pizza
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Select
                      value={choice.handle}
                      onValueChange={(handle) =>
                        setPizzaChoices((prev) =>
                          prev.map((c, i) => (i === index ? { handle, variantId: "" } : c)),
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Válassz pizzát" />
                      </SelectTrigger>
                      <SelectContent>
                        {pizzas.map((p) => (
                          <SelectItem key={p.node.handle} value={p.node.handle}>
                            {p.node.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={choice.variantId}
                      onValueChange={(variantId) =>
                        setPizzaChoices((prev) =>
                          prev.map((c, i) => (i === index ? { ...c, variantId } : c)),
                        )
                      }
                      disabled={!product}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Méret" />
                      </SelectTrigger>
                      <SelectContent>
                        {variants.map((v) => (
                          <SelectItem key={v.id} value={v.id} disabled={!v.availableForSale}>
                            {v.title} — {formatPrice(v.price.amount, v.price.currencyCode)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })}

            {drinkCount > 0 &&
              drinkChoices.map((value, index) => (
                <div
                  key={`drink-${index}`}
                  className="rounded-lg border border-dashed border-brand/40 bg-brand/5 p-3"
                >
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-brand">
                    <Gift className="h-3.5 w-3.5" />
                    {index + 1}. ajándék üdítő
                  </p>
                  <Select
                    value={value}
                    onValueChange={(variantId) =>
                      setDrinkChoices((prev) => prev.map((v, i) => (i === index ? variantId : v)))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Válassz üdítőt" />
                    </SelectTrigger>
                    <SelectContent>
                      {giftDrinkVariants.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.title} — 0 Ft
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}

            {drinkCount === 0 && (
              <div className="flex items-center gap-2 rounded-lg border border-dashed border-brand/40 bg-brand/5 p-3 text-sm text-foreground">
                <Gift className="h-4 w-4 text-brand" />
                Ajándék: sonkás pizza 26 cm — 0 Ft
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border/40 pt-3">
              <span className="text-sm text-muted-foreground">Fizetendő az ajánlatért</span>
              <span className="text-lg font-bold text-foreground">
                {formatPrice(pizzaTotal.toFixed(2), currency)}
              </span>
            </div>

            <Button
              className="h-11 w-full bg-brand text-brand-foreground hover:bg-brand/90"
              onClick={handleAdd}
              disabled={!ready || adding}
            >
              {adding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Ajánlat a kosárba
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CardShell>
  );
}

function MonthlyCard({
  monthly,
  isLoading,
}: {
  monthly: ShopifyProduct | undefined;
  isLoading: boolean;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const variants = variantsOf(monthly);
  const [variantId, setVariantId] = useState<string | null>(null);
  const selected = variants.find((v) => v.id === variantId) ?? variants[0];
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!monthly || !selected) return;
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
    } finally {
      setAdding(false);
    }
  };

  return (
    <CardShell
      icon={Star}
      badge="-20%"
      title="Hónap kedvence"
      subtitle="Kolbász-Kukorica"
      description="A hónap pizzája 20% kedvezménnyel, minden méretben. Válassz méretet, és mehet a kosárba."
    >
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => {
            const active = selected?.id === v.id;
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
        {selected && (
          <p className="text-lg font-bold text-foreground">
            {formatPrice(selected.price.amount, selected.price.currencyCode)}
          </p>
        )}
        <Button
          className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
          onClick={handleAdd}
          disabled={isLoading || adding || !selected}
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
    </CardShell>
  );
}
