import { Link } from "@tanstack/react-router";
import { trackInteraction } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Gift, ArrowRight } from "lucide-react";
import { PIZZA_THRESHOLD } from "@/lib/loyalty";

export function LoyaltyBanner() {
  return (
    <section className="border-y border-brand/20 bg-brand/5">
      <div className="container mx-auto px-4 py-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-brand/30 bg-card/60 p-5 backdrop-blur-sm sm:flex-row sm:p-6">
          <div className="flex items-start gap-4 sm:items-center">
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
              <Gift className="h-6 w-6" />
            </span>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">
                Minden {PIZZA_THRESHOLD}. pizza ingyen
              </h2>
              <p className="text-sm text-muted-foreground">
                Gyűjtsd a rendeléseidet telefonszámoddal — a {PIZZA_THRESHOLD}. pizzád ajándékba adjuk.
              </p>
            </div>
          </div>
          <Button
            className="w-full flex-shrink-0 bg-brand text-brand-foreground hover:bg-brand/90 sm:w-auto"
            asChild
          >
            <Link to="/husegprogram" onClick={() => trackInteraction("loyalty_click")}>
              Hűségprogram részletei
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
