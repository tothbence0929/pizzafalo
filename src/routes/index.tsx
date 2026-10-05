import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { HeroVideo } from "@/components/HeroVideo";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

import { fetchProducts } from "@/lib/shopify";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import { OffersSection } from "@/components/OffersSection";
import { OFFER_ONLY_TYPES } from "@/lib/offers";
import { SocialProof } from "@/components/SocialProof";
import { LoyaltyBanner } from "@/components/LoyaltyBanner";
import { GiveawayBanner } from "@/components/GiveawayBanner";
import { MonthlyHighlight } from "@/components/MonthlyHighlight";
import { CustomPizzaHighlight } from "@/components/CustomPizzaHighlight";
import { BrandsSection } from "@/components/BrandsSection";
import { isHouseProduct } from "@/lib/brands";
import { FirstOrderSignup } from "@/components/FirstOrderSignup";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pizzafaló Szeged — Kemencés pizza házhozszállítás" },
      {
        name: "description",
        content:
          "300 °C-os kemencében sült pizzák friss alapanyagokból, gyors kiszállítással Szegeden. Rendelj online a Pizzafalótól!",
      },
      { property: "og:title", content: "Pizzafaló Szeged — Kemencés pizza házhozszállítás" },
      {
        property: "og:description",
        content: "Kemencés pizzák Szegeden, gyors kiszállítással. Rendelj online!",
      },
      { property: "og:url", content: "https://pizzatnekem.hu/" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://pizzatnekem.hu/" }],
  }),
  component: Index,
});

function Index() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", "featured", "regular-only"],
    queryFn: async () => {
      const allProducts = await fetchProducts(100);
      return allProducts
        .filter(
          (product) =>
            isHouseProduct(product) && !OFFER_ONLY_TYPES.includes(product.node.productType),
        )
        .slice(0, 6);
    },
  });

  return (
    <div>
      <HeroVideo />

      <SocialProof />

      <FirstOrderSignup />

      <LoyaltyBanner />

      <GiveawayBanner />

      <div className="bg-brand/5">
        <OffersSection hideMonthly />
      </div>

      <section className="container mx-auto px-4 py-16 lg:px-8 space-y-10">
        <MonthlyHighlight />
        <CustomPizzaHighlight />

        <div className="my-4 flex items-center gap-4" role="separator" aria-hidden="true">
          <span className="h-[3px] flex-1 rounded-full bg-gradient-to-r from-transparent to-brand" />
          <span className="h-2.5 w-2.5 rotate-45 rounded-[2px] bg-brand" />
          <span className="h-[3px] flex-1 rounded-full bg-gradient-to-l from-transparent to-brand" />
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Népszerű pizzáink
            </h2>
            <p className="mt-2 text-muted-foreground">A vendégeink kedvencei, kemencében sütve.</p>
          </div>
          <Button variant="outline" className="hidden sm:inline-flex border-border/60" asChild>
            <Link to="/menunk">
              Teljes étlap
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80 w-full rounded-lg" />
              ))
            : products?.map((product) => <ProductCard key={product.node.id} product={product} />)}
        </div>
      </section>

      <div className="bg-brand/5">
        <BrandsSection />
      </div>
    </div>
  );
}
