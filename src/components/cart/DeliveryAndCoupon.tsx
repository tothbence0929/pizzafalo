import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Truck, TicketPercent, X, Loader2, Store } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import {
  findZone,
  FREE_SHIPPING_THRESHOLD,
  deliveryFeeFor,
  PICKUP_ETA_MINUTES,
  PICKUP_ADDRESS,
} from "@/lib/delivery";
import { validateDiscountCode } from "@/lib/shop-data.functions";
import { toast } from "sonner";
import { PreorderPicker } from "@/components/cart/PreorderPicker";

export function DeliveryAndCoupon() {
  const {
    postalCode,
    setPostalCode,
    fulfillment,
    setFulfillment,
    discountCode,
    discountType,
    discountAmount,
    setDiscount,
    getSubtotal,
  } = useCartStore();
  const subtotal = getSubtotal();
  const zone = findZone(postalCode);
  const isPickup = fulfillment === "pickup";
  const validate = useServerFn(validateDiscountCode);
  const [codeInput, setCodeInput] = useState("");
  const [checking, setChecking] = useState(false);

  const applyCode = async () => {
    const code = codeInput.trim().toUpperCase();
    if (!code) return;
    setChecking(true);
    try {
      const found = await validate({ data: { code } });
      if (!found) {
        toast.error("Ez a kuponkód nem érvényes.");
      } else if (subtotal < found.min_order_amount) {
        toast.error(
          `A kupon ${found.min_order_amount.toLocaleString("hu-HU")} Ft rendelési értéktől érvényes.`,
        );
      } else {
        setDiscount(found.code, found.value, found.discount_type as "percentage" | "fixed");
        setCodeInput("");
        toast.success(`${found.code} kupon aktiválva`);
      }
    } catch {
      toast.error("A kupon ellenőrzése nem sikerült.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setFulfillment("delivery")}
          className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
            !isPickup
              ? "border-brand bg-brand text-brand-foreground"
              : "border-border/60 bg-secondary/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Truck className="h-4 w-4" />
          Kiszállítás
        </button>
        <button
          type="button"
          onClick={() => setFulfillment("pickup")}
          className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
            isPickup
              ? "border-brand bg-brand text-brand-foreground"
              : "border-border/60 bg-secondary/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Store className="h-4 w-4" />
          Személyes átvétel
        </button>
      </div>

      {isPickup ? (
        <div className="rounded-lg border-2 border-brand bg-brand/10 p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-brand" />
            <span className="font-semibold text-foreground">
              Személyes átvétel {PICKUP_ETA_MINUTES} percen belül
            </span>
          </div>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {PICKUP_ADDRESS}
          </p>
          <p className="mt-1 text-xs font-semibold text-brand">
            Nincs szállítási díj — átvétel a pizzériában.
          </p>
          <p className="mt-1 text-xs font-medium text-foreground">
            Fizetés az étteremben: készpénzzel, bankkártyával vagy OTP SZÉP kártyával.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <label
            htmlFor="cart-postal"
            className="flex items-center gap-2 text-sm font-medium text-foreground"
          >
            <MapPin className="h-4 w-4 text-brand" />
            Kiszállítási irányítószám
          </label>
          <Input
            id="cart-postal"
            inputMode="numeric"
            maxLength={4}
            placeholder="pl. 6720"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="bg-secondary/40"
          />
          {postalCode.length === 4 && !zone && (
            <p className="text-sm text-destructive">
              Erre az irányítószámra sajnos nem szállítunk ki.
            </p>
          )}
          {zone && (
            <div className="rounded-lg border border-brand/40 bg-brand/10 p-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-brand" />
                <span className="font-semibold text-foreground">
                  Várható kiszállítás: {zone.eta_min}–{zone.eta_max} perc
                </span>
              </div>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="h-3.5 w-3.5" />
                {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                  <>
                    {zone.city_area} ({zone.postal_code}) —{" "}
                    <span className="font-semibold text-brand">ingyenes szállítás</span>
                  </>
                ) : (
                  <>
                    {zone.city_area} ({zone.postal_code}) —{" "}
                    {deliveryFeeFor(subtotal, zone).toLocaleString("hu-HU")} Ft szállítási díj,{" "}
                    {FREE_SHIPPING_THRESHOLD.toLocaleString("hu-HU")} Ft felett ingyenes
                  </>
                )}
              </p>
              {subtotal < FREE_SHIPPING_THRESHOLD && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Még {(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString("hu-HU")} Ft, és ingyenes
                  a szállítás.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <PreorderPicker />

      {discountCode ? (
        <div className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2">
          <Badge className="border-none bg-brand text-brand-foreground">
            <TicketPercent className="mr-1 h-3 w-3" />
            {discountCode}
            {discountType === "percentage"
              ? ` −${discountAmount}%`
              : ` −${discountAmount.toLocaleString("hu-HU")} Ft`}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={() => setDiscount(null, 0, null)}
            aria-label="Kupon törlése"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <Input
            placeholder="Kuponkód"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && applyCode()}
            className="bg-secondary/40 uppercase min-w-0"
          />
          <Button
            variant="outline"
            className="border-border/60 whitespace-nowrap"
            onClick={applyCode}
            disabled={checking}
          >
            {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Beváltás"}
          </Button>
        </div>
      )}
    </div>
  );
}
