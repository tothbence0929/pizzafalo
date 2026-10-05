import { Pizza, Star, Truck } from "lucide-react";

export function SocialProof() {
  return (
    <section className="border-y border-border/40 bg-secondary/20">
      <div className="container mx-auto grid grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-3 lg:px-8">
        <div className="flex items-center justify-center gap-3 text-center sm:text-left">
          <Pizza className="h-6 w-6 flex-shrink-0 text-brand" />
          <p className="text-sm font-semibold text-foreground">
            Több ezer kiszállított pizza tapasztalatával Szeged környékén
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Star className="h-6 w-6 flex-shrink-0 text-brand" />
          <p className="text-sm font-semibold text-foreground">
            Visszatérő vendégek és változatos kedvezmények
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Truck className="h-6 w-6 flex-shrink-0 text-brand" />
          <p className="text-sm font-semibold text-foreground">
            Gyors kiszállítás minden szegedi zónába, 30–50 perc
          </p>
        </div>
      </div>
    </section>
  );
}

