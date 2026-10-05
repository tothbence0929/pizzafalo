import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Gift, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { subscribeForFirstOrderCoupon } from "@/lib/newsletter.functions";
import { FIRST_ORDER_MIN_AMOUNT } from "@/lib/first-order";
import { trackInteraction } from "@/lib/analytics";

export function FirstOrderSignup() {
  const subscribe = useServerFn(subscribeForFirstOrderCoupon);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const phoneDigits = phone.replace(/\D/g, "");
  const canSubmit = !!email.trim() && phoneDigits.length >= 7;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const result = await subscribe({ data: { email, phone } });
      if (!result.ok || !result.code) {
        toast.error(result.error ?? "A feliratkozás nem sikerült.");
        return;
      }
      setCode(result.code);
      trackInteraction("newsletter_signup");
      toast.success(
        result.alreadySubscribed ? "Ez a kuponkódod már megvolt" : "Megérkezett a kuponkódod!",
      );
    } catch {
      toast.error("A feliratkozás nem sikerült, próbáld újra.");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("A másolás nem sikerült.");
    }
  };

  return (
    <section className="container mx-auto px-4 py-12 lg:px-8">
      <div className="mx-auto max-w-2xl rounded-2xl border-2 border-brand bg-brand/10 p-6 text-center sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand text-brand-foreground">
          <Gift className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
          Ajándék üdítő az első rendelésedhez
        </h2>
        <p className="mt-2 text-muted-foreground">
          Iratkozz fel, és azonnal megkapod a saját kuponkódod egy ajándék 0,5 l-es üdítőre.
          Érvényes {FIRST_ORDER_MIN_AMOUNT.toLocaleString("hu-HU")} Ft rendelési érték felett,
          egyszer használható.
        </p>

        {code ? (
          <div className="mt-6 space-y-3">
            <p className="text-sm font-medium text-foreground">A kuponkódod:</p>
            <div className="flex items-center justify-center gap-2">
              <span className="rounded-lg border-2 border-dashed border-brand bg-card px-4 py-2 text-xl font-bold tracking-wider text-brand">
                {code}
              </span>
              <Button variant="outline" size="icon" onClick={copyCode} aria-label="Kód másolása">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Írd be a kosárban a „Kuponkód” mezőbe a rendelés leadása előtt.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3 text-left">
            <Input
              type="email"
              inputMode="email"
              placeholder="E-mail-címed"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="bg-card"
            />
            <Input
              type="tel"
              inputMode="tel"
              placeholder="Telefonszámod"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="bg-card"
            />
            <p className="text-xs text-muted-foreground">
              A telefonszámra gyűjtjük a pecséteket is a hűségprogramban.
            </p>
            <Button
              onClick={handleSubmit}
              disabled={loading || !canSubmit}
              className="h-12 w-full bg-brand font-semibold text-brand-foreground hover:bg-brand/90"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Kérem az ajándék üdítőt"
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
