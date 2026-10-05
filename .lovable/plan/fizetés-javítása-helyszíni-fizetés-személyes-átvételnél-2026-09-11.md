# Fizetés javítása + helyszíni fizetés személyes átvételnél

## 1. A 404-es fizetési oldal

A fizetés gomb a `https://pizzatnekem.hu/cart/c/...` címre visz, ami a te weboldalad (nem a Shopify fizetési oldala), ezért 404-et kapsz.

Ez egy régi, a böngészőben elmentett kosárhivatkozás: a hibát korábban javítottuk, de a már létező kosarak megjegyezték a rossz linket.

Amit teszek:

- A fizetési link minden kattintáskor átalakul a Shopify saját címére, nem csak a kosár létrehozásakor. Így a régi, elmentett kosarak is jó helyre visznek.
- A mentett kosár verziót kap: a látogatók régi kosarai automatikusan frissülnek, nem kell nekik gyorsítótárat törölni.
- Ha a kosár már lejárt a Shopify oldalán, a rendszer szól, és üríti a kosarat, hogy újra hozzá tudják adni a tételeket.

## 2. Személyes átvétel: fizetés az étteremben

A kosárban és a fizetés előtt egyértelműen látszik, hogy személyes átvételnél az étteremben lehet fizetni készpénzzel vagy bankkártyával.

- A kosárban a személyes átvétel opció mellett megjelenik: „Fizetés az étteremben – készpénzzel vagy bankkártyával.”
- A fizetéshez tartozó szöveg átvételnél nem az online fizetést hangsúlyozza.
- A rendeléshez megjegyzés kerül a Shopify felé („Személyes átvétel – fizetés az étteremben”), így az étteremben azonnal látszik, hogy nem kiszállítás.

Ahhoz, hogy a Shopify fizetési oldalán tényleg megjelenjen a „fizetés az étteremben” választás, egyszer be kell kapcsolnod a Shopify adminban egy kézi fizetési módot (pl. „Fizetés az étteremben”). Ez nem állítható be kódból — pontos lépéseket adok hozzá, és amíg nincs bekapcsolva, az online fizetés működik átvételnél is.

## 3. Ellenőrzés

- A fizetés gomb után a link tényleg a Shopify fizetési oldalára visz (nem 404).
- Kiszállítás és személyes átvétel esetén is végigpróbálom a kosarat mobil méretben.

## Technikai részletek

- `src/lib/shopify.ts`: `formatCheckoutUrl` exportálva marad; kosár lekérdezéskor (`CART_QUERY`) a `checkoutUrl` is visszajön.
- `src/stores/cartStore.ts`: `getCheckoutUrl()` mindig `formatCheckoutUrl()`-t alkalmaz; `persist` `version: 2` + `migrate`, ami újranormalizálja a mentett `checkoutUrl`-t; `syncCart` frissíti a `checkoutUrl`-t a Shopify válaszából.
- `src/components/cart/CartDrawer.tsx` + `DeliveryAndCoupon.tsx`: átvétel esetén helyszíni fizetés szöveg, gomb feliratának és a lábjegyzet szövegének feltételes változata.
- Kosár attribútum/note beállítása `cartAttributesUpdate` vagy `cartNoteUpdate` mutációval a checkout indítása előtt, a `fulfillment` állapot alapján.
