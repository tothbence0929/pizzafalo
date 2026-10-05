import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { fetchProducts } from "@/lib/shopify";
import { findBrand, BRANDS } from "@/lib/brands";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/markak/$brand")({
  loader: ({ params }) => {
    const brand = findBrand(params.brand);
    if (!brand) throw notFound();
    return { brand };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Nem található" }, { name: "robots", content: "noindex" }],
      };
    }
    const { brand } = loaderData;
    const title = `${brand.name} — ${brand.tagline} | Szeged`;
    return {
      meta: [
        { title },
        { name: "description", content: brand.description },
        { property: "og:title", content: title },
        { property: "og:description", content: brand.description },
        { property: "og:url", content: `https://pizzatnekem.hu/markak/${brand.slug}` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `https://pizzatnekem.hu/markak/${brand.slug}` }],
    };
  },
  component: BrandPage,
});

function BrandPage() {
  const { brand } = Route.useLoaderData();
  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", "brand", brand.vendor],
    queryFn: () => fetchProducts(100, `vendor:"${brand.vendor}"`),
  });

  const others = BRANDS.filter((b) => b.slug !== brand.slug);

  return (
    <div className="container mx-auto px-4 py-12 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-border/40">
        <img
          src={brand.image}
          alt={`${brand.name} pizza`}
          width={1200}
          height={800}
          className="h-56 w-full object-cover sm:h-72"
        />
        <div className="p-6">
          <p className="text-sm font-medium uppercase tracking-wide text-brand">{brand.tagline}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {brand.name}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{brand.description}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Ugyanaz a konyha, ugyanaz a kiszállítás: szegedi zónák szerinti díjjal, 8 000 Ft felett
            ingyen. Személyes átvétel is választható.
          </p>
        </div>
      </div>

      {error ? (
        <p className="mt-10 text-sm text-destructive">
          Az étlap most nem elérhető. Kérlek próbáld újra később.
        </p>
      ) : isLoading ? (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-96 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="mt-12 space-y-14">
          {brand.categories.map((category) => {
            const items = (products ?? []).filter((p) =>
              category.types.includes(p.node.productType),
            );
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

      <div className="mt-16 flex flex-wrap gap-3">
        {others.map((b) => (
          <Button key={b.slug} variant="outline" className="border-border/60" asChild>
            <Link to="/markak/$brand" params={{ brand: b.slug }}>
              {b.name}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ))}
        <Button variant="outline" className="border-border/60" asChild>
          <Link to="/menunk">
            Pizzafaló étlap
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
