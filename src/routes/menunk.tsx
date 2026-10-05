import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProducts } from "@/lib/shopify";
import { OFFER_ONLY_TYPES } from "@/lib/offers";
import { isHouseProduct } from "@/lib/brands";

export const Route = createFileRoute("/menunk")({
  head: () => ({
    meta: [
      { title: "Étlap — Pizzafaló Szeged" },
      {
        name: "description",
        content:
          "Böngészd a Pizzafaló teljes étlapját: kemencés pizzák 26 és 30 cm-es méretben, italok, desszertek és szószok.",
      },
      { property: "og:title", content: "Étlap — Pizzafaló Szeged" },
      {
        property: "og:description",
        content: "Kemencés pizzák 26 és 30 cm-ben, italok és desszertek, online rendeléssel.",
      },
      { property: "og:url", content: "https://pizzatnekem.hu/menunk" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://pizzatnekem.hu/menunk" }],
  }),
  component: MenuPage,
});

const CATEGORIES: Array<{ label: string; match: (type: string) => boolean }> = [
  {
    label: "Pizzák",
    match: (t) => !OFFER_ONLY_TYPES.includes(t) && !["Ital", "Desszert", "Szósz"].includes(t),
  },
  { label: "Italok", match: (t) => t === "Ital" },
  { label: "Desszertek", match: (t) => t === "Desszert" },
  { label: "Szószok", match: (t) => t === "Szósz" },
];

function MenuPage() {
  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", "house"],
    queryFn: async () => (await fetchProducts(100)).filter(isHouseProduct),
  });

  return (
    <div className="container mx-auto px-4 py-12 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Étlap</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Minden pizzánk friss, házi tésztából, 300 °C-os kemencében készül. Válaszd ki a méretet, és
        tegyél mellé italt vagy desszertet.
      </p>

      <div className="mt-6 flex flex-col gap-3 rounded-xl border border-brand/30 bg-brand/5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-foreground">Te Pizzád — állítsd össze magad</p>
          <p className="text-sm text-muted-foreground">
            4 alap, sajt alapból rajta, 3 feltét ingyen. 26 cm 3 890 Ft, 30 cm 4 290 Ft.
          </p>
        </div>
        <Button className="bg-brand text-brand-foreground hover:bg-brand/90" asChild>
          <Link to="/te-pizzad">Összeállítom</Link>
        </Button>
      </div>

      {error ? (
        <p className="mt-8 text-sm text-destructive">
          Az étlap most nem elérhető. Kérlek próbáld újra később.
        </p>
      ) : isLoading ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-96 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="mt-10 space-y-14">
          {CATEGORIES.map((category) => {
            const items = (products ?? []).filter((p) => category.match(p.node.productType));
            if (items.length === 0) return null;
            return (
              <section key={category.label}>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  {category.label}
                </h2>
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((product) => (
                    <ProductCard key={product.node.id} product={product} />
                  ))}
                </div>
              </section>
            );
          })}
          {(products ?? []).length === 0 && (
            <p className="text-muted-foreground">Jelenleg nincsenek termékek.</p>
          )}
        </div>
      )}
    </div>
  );
}
