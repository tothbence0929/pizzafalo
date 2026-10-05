# Előrendelés + első rendelési kedvezmény

## 1. Előrendelés (zárás után is lehessen rendelni)

- A kosárban az „Kiszállítás / Személyes átvétel” alatt új választó: **Most kérem** vagy **Előrendelés**.
- Előrendelésnél a vásárló kiválasztja a napot (ma / következő 6 nyitva tartó nap) és egy 15 perces időpontot, csak a nyitvatartáson belül (hétfő zárva, kedd–péntek 16:00–21:45, szombat–vasárnap 10:30–21:45). A legkorábbi választható idő a mai napon a jelenlegi idő + 45 perc.
- Ha zárva vagyunk, a felugró ablak már nem csak elküld az étlapra: egy „Előrendelek későbbre” gombbal azonnal megnyílik az időpontválasztó, és a rendelés leadható. A kosárban a „jelenleg zárva” tiltás csak akkor marad, ha nincs kiválasztott előrendelési időpont.
- A választott időpont bekerül a kosár összegzésébe, és a Shopify rendelésre is felkerül külön adatként és a megjegyzésben („Előrendelés: 2026-09-24 18:30 – Kiszállítás”), hogy a konyha lássa.
- Az időpont a kosárral együtt megmarad újratöltés után is.

## 2. Első rendelés: 15% kedvezmény 5000 Ft felett, feliratkozással

- Új főoldali és kosárbeli figyelemfelhívás: „Első rendelésed 15% kedvezménnyel 5000 Ft felett — iratkozz fel, és máris a tiéd a kupon.”
- Feliratkozás e-mail-címmel (+ opcionális telefonszám). Feliratkozás után a képernyőn azonnal megjelenik a **saját, egyszer felhasználható kuponkód**, egy kattintással a kosárba illeszthető.
- Ugyanaz az e-mail-cím csak egyszer kap kódot; ismételt feliratkozásnál a korábbi kódot kapja vissza.
- A kupon 15%, minimum 5000 Ft rendelési értéknél, 60 napig érvényes, egyszer használható.
- A kedvezmény a Shopify fizetési oldalán is érvényesül, nem csak a mi kosarunkban.

## Technikai részletek

- **Adatbázis:** új `newsletter_subscribers` tábla (email, telefon, kiosztott kupon, létrehozás ideje) és `first_order_coupons` kódkészlet-tábla (kód, foglalt-e, kinek). RLS bekapcsolva, kliensből nincs olvasás; minden művelet `createServerFn` szerverfunkcióban fut (`src/lib/newsletter.functions.ts`), service role klienssel.
- **Shopify:** egy 15%-os, 5000 Ft minimumú price rule, alá előre legenerált egyedi kódkészlet (kb. 200 kód), ezek töltik a `first_order_coupons` táblát. A kosárban alkalmazott kód a Storefront `cartDiscountCodesUpdate` mutációval kerül a Shopify kosárba (`src/lib/shopify.ts`), így a fizetési oldalon is levonódik. A meglévő `validateDiscountCode` és `discount_codes` logika változatlan marad, a kuponmező mindkét fajta kódot elfogadja.
- **Kosár állapot:** `cartStore`-ba `orderTiming: "asap" | "scheduled"` és `scheduledAt` (ISO) kerül, persist verzió emelés migrációval. `src/lib/preorder.ts` számolja a választható napokat/időpontokat az eddigi nyitvatartási szabályokból.
- **Érintett fájlok:** `src/lib/preorder.ts` (új), `src/lib/newsletter.functions.ts` (új), `src/components/cart/PreorderPicker.tsx` (új), `src/components/FirstOrderSignup.tsx` (új), `src/components/cart/DeliveryAndCoupon.tsx`, `src/components/cart/CartDrawer.tsx`, `src/components/OpeningHoursNotice.tsx`, `src/stores/cartStore.ts`, `src/lib/shopify.ts`, `src/routes/index.tsx`.
- **Mérés:** feliratkozás és előrendelés `trackInteraction` eseményként jelenik meg a meglévő Meta/GA mérésben.

## Amit tőled kérek

- Küldjük-e e-mailben is a kupont a feliratkozónak (ehhez e-mail feladó beállítás kell), vagy elég, ha a képernyőn megjelenik és vágólapra másolható?
