import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BRANDS } from "@/lib/brands";
import { ArrowRight } from "lucide-react";

export function BrandsSection() {
  return (
    <section className="container mx-auto px-4 py-16 lg:px-8">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Márkáink egy konyhából
        </h2>
        <p className="mt-2 text-muted-foreground">
          A Pizzafaló mellett két további pizzamárkánk is nálunk készül, ugyanazzal a kiszállítással
          és rendelési idővel.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {BRANDS.map((brand) => (
          <Card
            key={brand.slug}
            className="group flex flex-col overflow-hidden border-border/40 bg-card-gradient transition-all hover:border-brand/30"
          >
            <Link to="/markak/$brand" params={{ brand: brand.slug }} className="block">
              <img
                src={brand.image}
                alt={`${brand.name} pizza`}
                width={1200}
                height={800}
                loading="lazy"
                className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
            <div className="flex flex-1 flex-col p-6">
              <p className="text-xs font-medium uppercase tracking-wide text-brand">
                {brand.tagline}
              </p>
              <h3 className="mt-1 text-xl font-semibold text-foreground">{brand.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{brand.description}</p>
              <div className="mt-auto pt-5">
                <Button className="bg-brand text-brand-foreground hover:bg-brand/90" asChild>
                  <Link to="/markak/$brand" params={{ brand: brand.slug }}>
                    Étlap megnyitása
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
