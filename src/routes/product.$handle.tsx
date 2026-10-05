import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { trackViewItem } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProductByHandle, formatPrice } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { ArrowLeft, Loader2, ShoppingCart } from "lucide-react";
import { UpsellRow } from "@/components/UpsellRow";
import { ExtrasPicker } from "@/components/ExtrasPicker";
import { useExtrasSelection, EXTRAS_TYPE } from "@/lib/extras";
import { EXTRA_TYPES } from "@/components/UpsellRow";
import { isMonthlyFavorite, originalPriceFromDiscounted } from "@/lib/offers";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$handle")({
  loader: async ({ params }) => {
    try {
      return { seo: await fetchProductByHandle(params.handle) };
    } catch {
      return { seo: null };
    }
  },
  head: ({ params, loaderData }) => {
    const p = loaderData?.seo;
    const url = `https://pizzatnekem.hu/product/${params.handle}`;
    const name = p?.title ?? "Pizza";
    const title = `${name} rendelés Szeged — Pizzafaló házhozszállítás`;
    const plain = (p?.description ?? "").replace(/\s+/g, " ").trim();
    const desc = (
      plain
        ? `${name}: ${plain}`
        : `${name} rendelése online, gyors házhozszállítással Szegeden a Pizzafalótól.`
    ).slice(0, 158);
    const img = p?.images?.edges?.[0]?.node?.url as string | undefined;
    const price = p?.priceRange?.minVariantPrice;
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:url", content: url },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (img) {
      const share = `${img}${img.includes("?") ? "&" : "?"}width=1200&height=630&crop=center`;
      meta.push({ property: "og:image", content: share }, { name: "twitter:image", content: share });
    }
    return {
      meta,
      links: [{ rel: "canonical", href: url }],
      scripts: p
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Product",
                name,
                description: plain || desc,
                image: img,
                brand: { "@type": "Brand", name: p.vendor || "Pizzafaló" },
                offers: price
                  ? {
                      "@type": "Offer",
                      price: price.amount,
                      priceCurrency: price.currencyCode,
                      availability: "https://schema.org/InStock",
                      url,
                    }
                  : undefined,
              }),
            },
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Főoldal", item: "https://pizzatnekem.hu/" },
                  { "@type": "ListItem", position: 2, name: "Menünk", item: "https://pizzatnekem.hu/menunk" },
                  { "@type": "ListItem", position: 3, name, item: url },
                ],
              }),
            },
          ]
        : [],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { handle } = Route.useParams();
  const addItem = useCartStore((s) => s.addItem);
  const [adding, setAdding] = useState(false);
  const [variantId, setVariantId] = useState<string | null>(null);
  const {
    options,
    selected: selectedExtras,
    toggle,
    extrasTotal,
    addExtrasToCart,
  } = useExtrasSelection();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", handle],
    queryFn: () => fetchProductByHandle(handle),
  });

  useEffect(() => {
    if (!product) return;
    const first = product.variants.edges[0]?.node;
    trackViewItem({
      id: first?.id ?? product.id,
      name: product.title,
      price: parseFloat(product.priceRange.minVariantPrice.amount),
      quantity: 1,
      category: product.productType,
    });
  }, [product]);



  if (isLoading) {
    return (
      <div className="container mx-auto grid gap-8 px-4 py-12 lg:grid-cols-2 lg:px-8">
        <Skeleton className="aspect-[4/3] w-full rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center lg:px-8">
        <h1 className="text-2xl font-bold text-foreground">A pizza nem található</h1>
        <Button className="mt-6 bg-brand text-brand-foreground hover:bg-brand/90" asChild>
          <Link to="/menunk">Vissza az étlapra</Link>
        </Button>
      </div>
    );
  }

  const variants = product.variants.edges.map((e) => e.node);
  const selected = variants.find((v) => v.id === variantId) ?? variants[0];
  const image = product.images.edges[0]?.node;
  const isPizzaLike = ![...EXTRA_TYPES, EXTRAS_TYPE, "Ajándék", "Ajánlat"].includes(
    product.productType,
  );

  const handleAdd = async () => {
    if (!selected) return;
    setAdding(true);
    await addItem({
      product: { node: product },
      variantId: selected.id,
      variantTitle: selected.title,
      price: selected.price,
      quantity: 1,
      selectedOptions: selected.selectedOptions,
    });
    if (isPizzaLike && selectedExtras.length > 0) await addExtrasToCart();
    setAdding(false);
    toast.success(`${product.title} a kosárban`);
  };

  return (
    <div className="container mx-auto px-4 py-12 lg:px-8">
      <Link
        to="/menunk"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Étlap
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-border/40 bg-card">
          {image ? (
            <img
              src={image.url}
              alt={image.altText ?? product.title}
              className="aspect-[4/3] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center bg-muted text-4xl">
              🍕
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {product.title}
            </h1>
            <p className="mt-3 text-muted-foreground">{product.description}</p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Méret</p>
            <div className="flex flex-wrap gap-2">
              {variants.map((variant) => (
                <Button
                  key={variant.id}
                  variant={selected?.id === variant.id ? "default" : "outline"}
                  className={
                    selected?.id === variant.id
                      ? "bg-brand text-brand-foreground hover:bg-brand/90"
                      : "border-border/60"
                  }
                  onClick={() => setVariantId(variant.id)}
                  disabled={!variant.availableForSale}
                >
                  {variant.title}
                </Button>
              ))}
            </div>
          </div>

          {isPizzaLike && (
            <ExtrasPicker
              options={options}
              selected={selectedExtras}
              onToggle={toggle}
              extrasTotal={extrasTotal}
            />
          )}

          <div className="flex flex-wrap items-center gap-3">
            {product && isMonthlyFavorite({ node: product }) && (
              <Badge className="border-none bg-brand text-brand-foreground">Hónap kedvence · −20%</Badge>
            )}
            <p className="text-3xl font-bold text-brand">
              {selected &&
                formatPrice(
                  String(parseFloat(selected.price.amount) + extrasTotal),
                  selected.price.currencyCode,
                )}
            </p>
            {product && isMonthlyFavorite({ node: product }) && selected && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(originalPriceFromDiscounted(selected.price.amount), selected.price.currencyCode)}
              </span>
            )}
          </div>

          <Button
            size="lg"
            className="h-12 w-full bg-brand text-brand-foreground hover:bg-brand/90 sm:w-auto sm:px-10"
            onClick={handleAdd}
            disabled={adding || !selected?.availableForSale}
          >
            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Kosárba
              </>
            )}
          </Button>
        </div>
      </div>

      <UpsellRow title="Ehhez ajánljuk" excludeHandle={handle} />
    </div>
  );
}
