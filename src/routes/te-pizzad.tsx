import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProducts, formatPrice } from "@/lib/shopify";
import type { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { useExtraOptions } from "@/lib/extras";
import { Loader2, ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";
import heroTePizzad from "@/assets/hero-te-pizzad.jpg.asset.json";

export const CUSTOM_PIZZA_TYPE = "Egyedi";
export const FREE_TOPPING_TYPE = "Ingyenes feltét";
const FREE_TOPPING_LIMIT = 3;

export const Route = createFileRoute("/te-pizzad")({
  head: () => ({
    meta: [
      { title: "Te Pizzád — állítsd össze | Pizzafaló Szeged" },
      {
        name: "description",
        content:
          "Állítsd össze a saját pizzádat: 4 alap közül választhatsz, a sajt alapból rajta van, és 3 feltét ingyenes. 26 cm 3 890 Ft, 30 cm 4 290 Ft.",
      },
      { property: "og:title", content: "Te Pizzád — állítsd össze | Pizzafaló Szeged" },
      {
        property: "og:description",
        content: "Válassz alapot, és 3 ingyenes feltétet. 26 cm 3 890 Ft, 30 cm 4 290 Ft.",
      },
      { property: "og:url", content: "https://pizzatnekem.hu/te-pizzad" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://pizzatnekem.hu/te-pizzad" }],
  }),
  component: CustomPizzaPage,
});

function optionValue(
  variant: { selectedOptions: Array<{ name: string; value: string }> },
  name: string,
) {
  return variant.selectedOptions.find((o) => o.name === name)?.value ?? "";
}

function CustomPizzaPage() {
  const addItem = useCartStore((s) => s.addItem);
  const paidExtras = useExtraOptions();
  const [size, setSize] = useState("26 cm");
  const [base, setBase] = useState("Paradicsom");
  const [toppings, setToppings] = useState<string[]>([]);
  const [crust, setCrust] = useState(false);
  const [adding, setAdding] = useState(false);
  const [done, setDone] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", "custom-pizza"],
    queryFn: () => fetchProducts(100),
    staleTime: 5 * 60 * 1000,
  });

  const pizza: ShopifyProduct | undefined = (products ?? []).find(
    (p) => p.node.productType === CUSTOM_PIZZA_TYPE,
  );
  const freeProduct: ShopifyProduct | undefined = (products ?? []).find(
    (p) => p.node.productType === FREE_TOPPING_TYPE,
  );

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 px-4 py-12 lg:px-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!pizza || !freeProduct) {
    return (
      <div className="container mx-auto px-4 py-20 text-center lg:px-8">
        <h1 className="text-2xl font-bold text-foreground">Te Pizzád jelenleg nem elérhető</h1>
        <p className="mt-3 text-muted-foreground">Kérlek próbáld újra később.</p>
      </div>
    );
  }

  const pizzaVariants = pizza.node.variants.edges.map((e) => e.node);
  const sizes = [...new Set(pizzaVariants.map((v) => optionValue(v, "Méret")))];
  const bases = [...new Set(pizzaVariants.map((v) => optionValue(v, "Alap")))];
  const selectedVariant =
    pizzaVariants.find(
      (v) => optionValue(v, "Méret") === size && optionValue(v, "Alap") === base,
    ) ?? pizzaVariants[0];

  const freeVariants = freeProduct.node.variants.edges.map((e) => e.node);
  const crustOption = paidExtras.find((o) => o.isCrust);

  const paidPriceFor = (label: string) =>
    parseFloat(paidExtras.find((o) => !o.isCrust && o.label === label)?.price.amount ?? "0");

  const extraToppings = toppings.slice(FREE_TOPPING_LIMIT);
  const toppingsTotal = extraToppings.reduce((sum, label) => sum + paidPriceFor(label), 0);
  const crustTotal = crust && crustOption ? parseFloat(crustOption.price.amount) : 0;
  const total =
    (selectedVariant ? parseFloat(selectedVariant.price.amount) : 0) + toppingsTotal + crustTotal;
  const currency = selectedVariant?.price.currencyCode ?? "HUF";
  const freeLeft = Math.max(0, FREE_TOPPING_LIMIT - toppings.length);

  const toggleTopping = (label: string) =>
    setToppings((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );

  const handleAdd = async () => {
    if (!selectedVariant) return;
    setAdding(true);

    await addItem({
      product: pizza,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions,
    });

    for (const [index, label] of toppings.entries()) {
      if (index < FREE_TOPPING_LIMIT) {
        const variant = freeVariants.find((v) => v.title === label);
        if (variant) {
          await addItem({
            product: freeProduct,
            variantId: variant.id,
            variantTitle: variant.title,
            price: variant.price,
            quantity: 1,
            selectedOptions: variant.selectedOptions,
          });
        }
      } else {
        const paid = paidExtras.find((o) => !o.isCrust && o.label === label);
        if (paid) {
          await addItem({
            product: paid.product,
            variantId: paid.variantId,
            variantTitle: paid.variantTitle,
            price: paid.price,
            quantity: 1,
            selectedOptions: paid.selectedOptions,
          });
        }
      }
    }

    if (crust && crustOption) {
      await addItem({
        product: crustOption.product,
        variantId: crustOption.variantId,
        variantTitle: crustOption.variantTitle,
        price: crustOption.price,
        quantity: 1,
        selectedOptions: crustOption.selectedOptions,
      });
    }

    setAdding(false);
    setDone(true);
    toast.success("Te Pizzád a kosárban", { description: `${size} • ${base}` });
    setToppings([]);
    setCrust(false);
    setTimeout(() => setDone(false), 1800);
  };

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
      active
        ? "border-brand bg-brand text-brand-foreground"
        : "border-border/60 text-muted-foreground hover:border-brand/50 hover:text-foreground"
    }`;

  return (
    <div className="container mx-auto px-4 py-12 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Te Pizzád</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Állítsd össze a saját pizzádat: válassz alapot, a sajt alapból rajta van, és{" "}
        {FREE_TOPPING_LIMIT} feltét ingyenes. Utána minden további feltét a saját árán kerül rá.
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-border/40 bg-card">
          <img
            src={heroTePizzad.url}
            alt={pizza.node.title}
            className="aspect-[4/3] w-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="space-y-7">
          <div>
            <p className="mb-3 text-sm font-medium text-foreground">Méret</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSize(value)}
                  className={chip(size === value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1 text-sm font-medium text-foreground">Alap</p>
            <p className="mb-3 text-xs text-muted-foreground">
              A sajt minden pizzán alapból rajta van.
            </p>
            <div className="flex flex-wrap gap-2">
              {bases.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setBase(value)}
                  className={chip(base === value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1 text-sm font-medium text-foreground">Feltétek</p>
            <p className="mb-3 text-xs text-muted-foreground">
              {freeLeft > 0
                ? `Még ${freeLeft} feltét ingyenes.`
                : "Az ingyenes feltéteket felhasználtad — a további feltétek felárasak."}
            </p>
            <div className="flex flex-wrap gap-2">
              {freeVariants.map((variant) => {
                const label = variant.title;
                const active = toppings.includes(label);
                const index = toppings.indexOf(label);
                const isFree = active ? index < FREE_TOPPING_LIMIT : freeLeft > 0;
                const price = paidPriceFor(label);
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => toggleTopping(label)}
                    className={chip(active)}
                  >
                    {label}
                    <span className={`ml-2 text-xs ${active ? "opacity-80" : "opacity-70"}`}>
                      {isFree ? "ingyen" : `+${formatPrice(String(price), currency)}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {crustOption && (
            <div>
              <p className="mb-3 text-sm font-medium text-foreground">Extra</p>
              <button type="button" onClick={() => setCrust((v) => !v)} className={chip(crust)}>
                {crustOption.label}
                <span className="ml-2 text-xs opacity-80">
                  +{formatPrice(crustOption.price.amount, crustOption.price.currencyCode)}
                </span>
              </button>
            </div>
          )}

          <div className="border-t border-border/40 pt-6">
            <p className="text-3xl font-bold text-brand">{formatPrice(String(total), currency)}</p>
            <Button
              size="lg"
              className="mt-4 h-12 w-full bg-brand text-brand-foreground hover:bg-brand/90 sm:w-auto sm:px-10"
              onClick={handleAdd}
              disabled={adding || !selectedVariant?.availableForSale}
            >
              {adding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : done ? (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Hozzáadva
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Kosárba
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
