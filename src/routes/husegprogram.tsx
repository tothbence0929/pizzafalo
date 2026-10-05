import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoyaltyCard } from "@/components/LoyaltyCard";
import { getLoyaltyStatus } from "@/lib/loyalty.functions";
import { normalizePhone } from "@/lib/loyalty";
import { Loader2, Search } from "lucide-react";

export const Route = createFileRoute("/husegprogram")({
  head: () => ({
    meta: [
      { title: "Hűségprogram — Pizzafaló Szeged" },
      {
        name: "description",
        content:
          "Gyűjtsd a pizzákat a Pizzafaló hűségprogramjában: minden 10. pizza ingyen, 14 napon belüli újrarendelésre ajándék üdítő.",
      },
      { property: "og:title", content: "Hűségprogram — Pizzafaló Szeged" },
      {
        property: "og:description",
        content: "Minden 10. pizza ingyen és 14 napon belüli újrarendelésre ajándék üdítő a Pizzafalótól.",
      },
      { property: "og:url", content: "https://pizzatnekem.hu/husegprogram" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://pizzatnekem.hu/husegprogram" }],
  }),
  component: LoyaltyPage,
});

function LoyaltyPage() {
  const [phoneInput, setPhoneInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof getLoyaltyStatus>> | null>(null);
  const fetchStatus = useServerFn(getLoyaltyStatus);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = normalizePhone(phoneInput);
    if (!phone) {
      setResult({ customer: null, rewards: [] });
      return;
    }
    setLoading(true);
    try {
      const data = await fetchStatus({ data: { phone: phoneInput } });
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container mx-auto px-4 py-16 lg:px-8">
      <div className="mx-auto max-w-xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Hűségprogram
          </h1>
          <p className="text-muted-foreground">
            Minden 10. pizza ingyen, és ha 2 héten belül újra rendelsz, ajándék üdítő jár.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="loyalty-phone" className="text-foreground">
              Telefonszám
            </Label>
            <Input
              id="loyalty-phone"
              type="tel"
              inputMode="tel"
              placeholder="pl. +36 70 792 3777"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="bg-secondary/40"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Hűségadatok lekérdezése
          </Button>
        </form>

        {result && (
          <LoyaltyCard
            customer={result.customer as { phone: string; pizza_count: number; free_pizzas_awarded: number; last_order_at: string | null } | null}
            rewards={result.rewards}
          />
        )}
      </div>
    </section>
  );
}
