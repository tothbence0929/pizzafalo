# Mérés: Meta Pixel + Conversions API és Google Analytics (e-kereskedelem)

## Cél
Minden fontos vásárlói lépés mérve legyen a Meta (Facebook) és a Google Analytics felé, hogy a hirdetések optimalizálhatók legyenek és lásd, hol esnek ki a vendégek.

## Mit építünk

1. **Meta Pixel** (azonosító: 25512891468361668) betöltése minden oldalon, oldalletöltés (PageView) méréssel, útvonalváltásnál is.
2. **Google Analytics 4** betöltése ugyanígy, oldalmegtekintés méréssel.
3. **Egységes mérési modul**, ami egy eseményt egyszerre küld a Metának és a Google-nek:
   - terméknézés (`view_item` / ViewContent)
   - kosárba tétel (`add_to_cart` / AddToCart) – pizza, extrák, Te Pizzád, ajánlatok
   - kassza indítása (`begin_checkout` / InitiateCheckout) a fizetés gombnál
   - vásárlás (`purchase` / Purchase)
   - egyéb interakciók: telefonhívás kattintás, hűségprogram és nyereményjáték gombok
4. **Meta Conversions API (szerver oldali mérés)**: a fontos események a szerverről is elmennek a Metának (megbízhatóbb mérés iOS/reklámblokkolók mellett), azonos esemény-azonosítóval, hogy ne duplázódjon.
5. **Vásárlás mérése**: a fizetés a Shopify oldalán zárul, ezért a vásárlás eseményt kétféleképp biztosítjuk:
   - a Shopify-ban is beállítjuk a Meta Pixelt és a GA4-et (ehhez a Shopify adminban egy beállítást kell engedélyezni – megírom pontosan a lépéseket), és
   - a rendelés beérkezésekor a szerver a Conversions API-n keresztül is jelenti a vásárlást.

## Amire még szükség van tőled
- **Google Analytics mérési azonosító** (G-XXXXXXXXXX).
- **Meta Conversions API hozzáférési token** (Meta Events Manager → adatforrás → Beállítások → Conversions API → token generálás). Ezt biztonságos tárolóba kérem majd be, nem kerül a kódba.

E kettő nélkül a böngészőoldali Meta Pixel már működni fog, a többi utólag aktiválódik.

## Technikai részletek
- `src/lib/analytics.ts`: pixel és gtag betöltés, `trackEvent` réteg, esemény-azonosító (`event_id`) generálás a deduplikációhoz.
- `src/routes/__root.tsx`: mérőkódok beillesztése, útvonalváltás követése a router eseményein.
- Meta CAPI: `src/lib/meta-capi.functions.ts` szerver funkció (`createServerFn`), `META_CAPI_ACCESS_TOKEN` titok, Graph API `/events` hívás, hashelt e-mail/telefon ha van.
- Eseményhívások: `ProductCard.tsx`, `product.$handle.tsx`, `te-pizzad.tsx`, `OffersSection.tsx`, `UpsellDialog.tsx`, `cart/CartDrawer.tsx`, `Header.tsx`/`Footer.tsx` (tel: linkek), `LoyaltyBanner.tsx`, `GiveawayBanner.tsx`.
- Meta ID és GA ID nem titkos, kódban/környezeti változóban maradhat; a CAPI token csak szerveroldalon.
