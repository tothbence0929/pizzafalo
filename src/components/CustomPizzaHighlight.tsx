import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Pizza, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchProducts, formatPrice } from "@/lib/shopify";
import { CUSTOM_PIZZA_TITLE, findByTitle, variantsOf } from "@/lib/offers";
import heroTePizzad from "@/assets/hero-te-pizzad.jpg.asset.json";

export function CustomPizzaHighlight() {
  const { data, isLoading } = useQuery({
    queryKey: ["products", "offers"],
    queryFn: () => fetchProducts(100),
    staleTime: 5 * 60 * 1000,
  });

  const product = findByTitle(data ?? [], CUSTOM_PIZZA_TITLE);
  const variants = variantsOf(product);

  if (isLoading) {
    return (
      <div className="flex h-56 items-center justify-center rounded-2xl border border-brand/30 bg-brand/5">
        <Loader2 className="h-5 w-5 animate-spin text-brand" />
      </div>
    );
  }

  if (!product || variants.length === 0) return null;

  const cheapest = variants.reduce((min, v) =>
    parseFloat(v.price.amount) < parseFloat(min.price.amount) ? v : min,
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-brand/40 bg-brand/5">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative aspect-[4/3] md:aspect-auto md:min-h-64">
          <img
            src={heroTePizzad.url}
            alt={product?.node.title ?? "Te Pizzád"}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <Badge className="absolute left-4 top-4 border-none bg-brand text-brand-foreground">
            Saját pizza
          </Badge>
        </div>

        <div className="flex flex-col justify-center gap-4 p-6 lg:p-8">
          <p className="flex items-center gap-2 text-sm font-semibold text-brand">
            <Pizza className="h-4 w-4" />
            Állítsd össze a sajátod
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Te Pizzád
          </h2>
          <p className="text-sm text-muted-foreground">
            Válassz 4 féle alap közül, 3 feltét ingyen, afölött extra áron. Kérheted sajttal töltött
            széllel is.
          </p>

          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <span
                key={v.id}
                className="rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground"
              >
                {v.title} — {formatPrice(v.price.amount, v.price.currencyCode)}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span className="text-2xl font-bold text-foreground">
              {formatPrice(cheapest.price.amount, cheapest.price.currencyCode)}{" "}
              <span className="text-sm font-normal text-muted-foreground">tól</span>
            </span>
            <Button
              size="lg"
              className="bg-brand font-semibold text-brand-foreground hover:bg-brand/90"
              asChild
            >
              <Link to="/te-pizzad">
                Összeállítom
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
