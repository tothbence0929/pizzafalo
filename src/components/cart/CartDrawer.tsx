import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingCart, Minus, Plus, Trash2, ExternalLink, Loader2, Clock } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import {
  formatPrice,
  setCartDiscountCode,
  setCartFulfillmentInfo,
  syncDeliveryFeeLine,
} from "@/lib/shopify";
import { Link } from "@tanstack/react-router";
import { trackBeginCheckout } from "@/lib/analytics";
import { UpsellRow } from "@/components/UpsellRow";
import { DeliveryAndCoupon } from "@/components/cart/DeliveryAndCoupon";
import {
  findZone,
  discountValue,
  deliveryFeeFor,
  deliveryFeeVariantId,
  DELIVERY_FEE_VARIANT_IDS,
  FREE_SHIPPING_THRESHOLD,
  PICKUP_ETA_MINUTES,
  PICKUP_ADDRESS,
} from "@/lib/delivery";
import { useHoursStore } from "@/stores/hoursStore";
import { formatScheduledAt } from "@/lib/preorder";
import { isFirstOrderCode, SHOPIFY_FIRST_ORDER_CODE } from "@/lib/first-order";
import { CalendarClock } from "lucide-react";

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const {
    items,
    isLoading,
    isSyncing,
    updateQuantity,
    removeItem,
    getCheckoutUrl,
    syncCart,
    getSubtotal,
    getTotalQuantity,
    postalCode,
    fulfillment,
    discountCode,
    discountType,
    discountAmount,
    orderTiming,
    scheduledAt,
  } = useCartStore();
  const totalItems = getTotalQuantity();
  const subtotal = getSubtotal();
  const currency = items[0]?.price.currencyCode || "HUF";
  const isPickup = fulfillment === "pickup";
  const zone = findZone(postalCode);
  const discount = discountValue(subtotal, discountType, discountAmount);
  const afterDiscount = Math.max(0, subtotal - discount);
  const deliveryFee = isPickup ? 0 : deliveryFeeFor(afterDiscount, zone);
  const total = afterDiscount + deliveryFee;
  const belowMin = !isPickup && !!zone && subtotal < zone.min_order_amount;
  const isOpenNow = useHoursStore((s) => s.open);
  const isPreorder = orderTiming === "scheduled" && !!scheduledAt;
  const canOrder = (isPickup || (!!zone && !belowMin)) && (isOpenNow !== false || isPreorder);

  useEffect(() => {
    if (isOpen) syncCart();
  }, [isOpen, syncCart]);

  const handleCheckout = async () => {
    trackBeginCheckout(
      items.map((i) => ({
        id: i.variantId,
        name: i.product.node.title,
        price: parseFloat(i.price.amount),
        quantity: i.quantity,
        variant: i.variantTitle,
        category: i.product.node.productType,
      })),
      total,
    );
    let checkoutUrl = getCheckoutUrl();
    const { cartId, setCheckoutUrl } = useCartStore.getState();
    if (cartId) {
      // Charge our own zone-based delivery fee as a cart line item.
      const feeSync = await syncDeliveryFeeLine(
        cartId,
        isPickup || deliveryFee === 0 ? null : deliveryFeeVariantId(deliveryFee),
        DELIVERY_FEE_VARIANT_IDS,
      );
      if (feeSync.checkoutUrl) {
        checkoutUrl = feeSync.checkoutUrl;
        setCheckoutUrl(checkoutUrl);
      }
      if (discountCode) {
        const codeForShopify = isFirstOrderCode(discountCode)
          ? SHOPIFY_FIRST_ORDER_CODE
          : discountCode;
        const discountSync = await setCartDiscountCode(cartId, codeForShopify);
        if (discountSync.checkoutUrl) {
          checkoutUrl = discountSync.checkoutUrl;
          setCheckoutUrl(checkoutUrl);
        }
      }
      const result = await setCartFulfillmentInfo(cartId, {
        mode: isPickup ? "pickup" : "delivery",
        postalCode: isPickup ? undefined : postalCode,
        scheduledAt: isPreorder && scheduledAt ? scheduledAt : undefined,
        note: isPickup
          ? `Személyes átvétel — fizetés az étteremben (készpénz, bankkártya vagy OTP SZÉP kártya). Átvétel: ${PICKUP_ADDRESS}`
          : `Kiszállítás — irányítószám: ${postalCode}`,
      });
      if (result.checkoutUrl) {
        checkoutUrl = result.checkoutUrl;
        setCheckoutUrl(checkoutUrl);
      }
    }
    if (checkoutUrl) {
      window.open(checkoutUrl, "_blank");
      setIsOpen(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative border-border/60 bg-background/80 hover:bg-secondary"
        >
          <ShoppingCart className="h-5 w-5" />
          {mounted && totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-brand text-brand-foreground border-none">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full bg-card border-l border-border/40">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="text-foreground">Kosár</SheetTitle>
          <SheetDescription>
            {totalItems === 0 ? "A kosarad üres" : `${totalItems} tétel a kosaradban`}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col flex-1 pt-6 min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">A kosarad üres</p>
                <Button className="mt-4 bg-brand text-brand-foreground hover:bg-brand/90" asChild>
                  <Link to="/menunk" onClick={() => setIsOpen(false)}>
                    Étlap megtekintése
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pr-2 min-h-0 no-scrollbar">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.variantId}
                      className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 p-3 rounded-lg bg-secondary/30"
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden shrink-0 bg-muted">
                        {item.product.node.images?.edges?.[0]?.node && (
                          <img
                            src={item.product.node.images.edges[0].node.url}
                            alt={item.product.node.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium break-words text-foreground leading-tight">
                          {item.product.node.title}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.selectedOptions.map((option) => option.value).join(" • ")}
                        </p>
                        <p className="font-semibold text-brand mt-0.5">
                          {formatPrice(item.price.amount, item.price.currencyCode)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end justify-between gap-2 shrink-0 min-w-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.variantId)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 border-border/60"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            disabled={isLoading}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm text-foreground">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 border-border/60"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            disabled={isLoading}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 border-t border-border/40 pt-4">
                  <UpsellRow title="Kérsz mellé valamit?" compact />
                </div>
                <div className="mt-4 space-y-4 border-t border-border/40 pt-4">
                  <DeliveryAndCoupon />
                  <div className="space-y-1 text-sm">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-muted-foreground">
                      <span className="break-words">Részösszeg</span>
                      <span className="text-right whitespace-nowrap">
                        {formatPrice(subtotal.toFixed(2), currency)}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-brand">
                        <span className="break-words">Kedvezmény ({discountCode})</span>
                        <span className="text-right whitespace-nowrap">
                          −{formatPrice(discount.toFixed(2), currency)}
                        </span>
                      </div>
                    )}
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 text-muted-foreground">
                      <span className="break-words">
                        {isPickup
                          ? "Személyes átvétel"
                          : `Kiszállítás${zone ? ` (${zone.postal_code})` : ""}`}
                      </span>
                      <span className="text-right whitespace-nowrap">
                        {isPickup ? (
                          <span className="font-semibold text-brand">Díjmentes</span>
                        ) : !zone ? (
                          "add meg az irsz-t"
                        ) : deliveryFee === 0 ? (
                          <span className="font-semibold text-brand">Ingyenes</span>
                        ) : (
                          formatPrice(deliveryFee.toFixed(2), currency)
                        )}
                      </span>
                    </div>
                    {!isPickup && zone && deliveryFee > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {FREE_SHIPPING_THRESHOLD.toLocaleString("hu-HU")} Ft felett ingyenes a
                        szállítás — még{" "}
                        {(FREE_SHIPPING_THRESHOLD - afterDiscount).toLocaleString("hu-HU")} Ft
                        hiányzik.
                      </p>
                    )}
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-t border-border/40 pt-2">
                      <span className="text-lg font-semibold text-foreground break-words">
                        Fizetendő
                      </span>
                      <span className="text-xl font-bold text-foreground text-right whitespace-nowrap">
                        {formatPrice(total.toFixed(2), currency)}
                      </span>
                    </div>
                    {isPreorder && scheduledAt ? (
                      <p className="flex items-center gap-1.5 pt-1 font-medium text-brand">
                        <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                        Előrendelés: {formatScheduledAt(scheduledAt)}
                      </p>
                    ) : isPickup ? (
                      <p className="flex items-center gap-1.5 pt-1 font-medium text-brand">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        Személyes átvétel {PICKUP_ETA_MINUTES} percen belül — {PICKUP_ADDRESS}
                      </p>
                    ) : (
                      zone && (
                        <p className="flex items-center gap-1.5 pt-1 font-medium text-brand">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          Várható kiszállítás: {zone.eta_min}–{zone.eta_max} perc
                        </p>
                      )
                    )}
                  </div>
                  {!isPickup && !zone && (
                    <p className="text-center text-xs font-medium text-destructive">
                      {postalCode.length === 4
                        ? "Erre az irányítószámra sajnos nem szállítunk ki, így a rendelés nem adható le."
                        : "Add meg a kiszállítási irányítószámot a rendelés leadásához."}
                    </p>
                  )}
                  {isOpenNow === false && !isPreorder && (
                    <p className="text-center text-xs font-medium text-destructive">
                      Jelenleg zárva vagyunk, rendelést csak nyitvatartási időben tudunk fogadni.
                    </p>
                  )}
                  {belowMin && (
                    <p className="text-center text-xs font-medium text-destructive">
                      Minimum rendelési érték erre a zónára:{" "}
                      {zone?.min_order_amount.toLocaleString("hu-HU")} Ft.
                    </p>
                  )}
                  <p className="text-xs text-center text-muted-foreground">
                    {isPickup
                      ? "Személyes átvételnél az étteremben fizethetsz készpénzzel, bankkártyával vagy OTP SZÉP kártyával — online fizetést is választhatsz."
                      : "Biztonságos online fizetés a Shopify rendszerén keresztül. Utánvét nem elérhető."}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 pt-3 border-t border-border/40 bg-card">
                <Button
                  onClick={handleCheckout}
                  className="w-full h-12 bg-brand text-brand-foreground hover:bg-brand/90 font-semibold"
                  size="lg"
                  disabled={items.length === 0 || isLoading || isSyncing || !canOrder}
                >
                  {isLoading || isSyncing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {isPickup ? "Rendelés véglegesítése" : "Fizetés Shopify-on"}
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
