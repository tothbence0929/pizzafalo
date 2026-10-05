# Terv: checkout 404 javítása és személyes átvétel helyben fizetésre állítása

## Cél
A fizetés gomb ne dobjon 404-et, és a személyes átvételnél a vendég tudja, hogy az étteremben fizet (készpénz/bankkártya/OTP SZÉP kártya).

## Háttér
A Shopify a checkout URL-ben időnként az új `pizzatnekem.myshopify.com` aldomaint adja vissza. A jelenlegi kód minden checkout URL-t a rég beállított `szeged-pizza-delivery-dcz9n-1zagy2pw.myshopify.com` domainer írja át. Ez elvileg ugyanaz a bolt, de a munkamenet/átirányítás miatt 404-et eredményezhet. Emellett a személyes átvétel szövege és a Shopify-nak küldött jelölés még nem teljesen egyértelmű.

## Teendők

### 1. Checkout URL normalizálás (`src/lib/shopify.ts`)
- A `formatCheckoutUrl` függvényt úgy módosítani, hogy ha a Shopify által visszaadott host már `*.myshopify.com`, akkor azt megtartsa (csak https-re kényszerítse és hozzáadja a `channel=online_store` paramétert).
- Csak akkor írja át a fix `SHOPIFY_STORE_PERMANENT_DOMAIN`-re, ha az URL az alkalmazás saját egyedi domainjét (`pizzatnekem.hu`, `www.pizzatnekem.hu`) vagy más nem-shopify domaint tartalmazza.
- Így mind a `szeged-pizza-delivery-dcz9n-1zagy2pw.myshopify.com`, mind a `pizzatnekem.myshopify.com` működni fog.

### 2. Személyes átvétel fizetési szövegei
- `src/lib/shopify.ts` `setCartFulfillmentInfo` metódusában a "Fizetés" cart-attribútumot és a rendelésjegyzetet kiegészíteni az OTP SZÉP kártyával.
- Példa: "Az étteremben (készpénz, bankkártya vagy OTP SZÉP kártya)".
- A `src/components/cart/DeliveryAndCoupon.tsx` megfelelő sorát is szinkronban tartani.

### 3. Checkout gomb és kosárállapot
- `src/components/cart/CartDrawer.tsx` `handleCheckout` függvényében, ha a `setCartFulfillmentInfo` új `checkoutUrl`-t ad vissza, azt frissíteni a `cartStore` állapotában is, hogy a következő megnyitás is a legfrissebb URL-t használja.
- A fizetés gomb felirata személyes átvételnél legyen "Rendelés véglegesítése", kiszállításnál maradjon "Fizetés Shopify-on".

### 4. Ellenőrzés
- TypeScript ellenőrzés (`npx tsc --noEmit`).
- Egy Playwright-teszt, amely kosárba tesz egy terméket, megnyitja a kosarat, kitölti az irányítószámot (vagy személyes átvételt választ), rákattint a fizetés gombra, és ellenőrzi, hogy az új lapon a checkout URL nem 404-et, hanem Shopify checkout oldalt tölt be.

## Neked szükséges beállítás
A személyes átvétel helyben fizetéséhez engedélyezned kell a Shopify adminban egy kézi fizetési módot (Settings → Payments → Manual payment methods), például:
"Fizetés az étteremben — készpénz, bankkártya vagy OTP SZÉP kártya".
Enélkül a Shopify checkout-ban továbbra sem fog megjelenni a helyben fizetés lehetősége.
