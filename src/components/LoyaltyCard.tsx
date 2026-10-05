import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Gift, Pizza, TicketPercent } from "lucide-react";
import { toast } from "sonner";
import { PIZZA_THRESHOLD } from "@/lib/loyalty";
import type { LoyaltyReward } from "@/lib/loyalty.functions";

interface LoyaltyCustomer {
  phone: string;
  pizza_count: number;
  free_pizzas_awarded: number;
  last_order_at: string | null;
}

interface LoyaltyCardProps {
  customer: LoyaltyCustomer | null;
  rewards: LoyaltyReward[];
}

export function LoyaltyCard({ customer, rewards }: LoyaltyCardProps) {
  const progress = customer ? customer.pizza_count % PIZZA_THRESHOLD : 0;

  const activeRewards = useMemo(() => {
    const now = new Date().toISOString();
    return rewards.filter((r) => {
      const code = r.discount_codes;
      if (!code) return false;
      const notExpired = !code.expires_at || code.expires_at > now;
      const hasUsesLeft = code.max_uses === null || code.used_count < code.max_uses;
      return notExpired && hasUsesLeft;
    });
  }, [rewards]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Kód másolva", { description: code });
  };

  if (!customer) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>Még nincs hűségadat ehhez a telefonszámhoz.</p>
          <p className="mt-1 text-sm">Rendelj egy pizzát, és itt gyűjtheted a bélyegeket.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Pizza className="h-5 w-5 text-brand" />
            Hűségpontok
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {customer.pizza_count} pizzát rendeltél eddig. Minden {PIZZA_THRESHOLD}. pizza ingyen!
          </p>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: PIZZA_THRESHOLD }).map((_, i) => (
              <div
                key={i}
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold ${
                  i < progress
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-border/60 bg-secondary/40 text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
          <p className="text-sm font-medium text-brand">
            {progress === 0 && customer.pizza_count > 0
              ? "Gratulálunk, a következő rendelésedhez ingyen pizza jár!"
              : `Még ${PIZZA_THRESHOLD - progress} pizza, és jár egy ingyen pizza.`}
          </p>
        </CardContent>
      </Card>

      {activeRewards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Gift className="h-5 w-5 text-brand" />
              Aktív kuponjaid
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeRewards.map((reward, index) => {
              const code = reward.discount_codes!;
              const isPizza = reward.reward_type === "free_pizza";
              return (
                <div
                  key={index}
                  className="flex flex-col gap-2 rounded-lg border border-border/40 bg-secondary/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="border-none bg-brand text-brand-foreground">
                        {isPizza ? "Ingyen pizza" : "Ingyen üdítő"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {code.value.toLocaleString("hu-HU")} Ft
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-lg font-semibold text-foreground">
                      <TicketPercent className="h-4 w-4 text-brand" />
                      {code.code}
                    </div>
                    {code.expires_at && (
                      <p className="text-xs text-muted-foreground">
                        Érvényes: {new Date(code.expires_at).toLocaleDateString("hu-HU")}-ig
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 border-border/60"
                    onClick={() => copyCode(code.code)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Másolás
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
