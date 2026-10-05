# Hűségprogram bevezetése

## Cél
Automatikus hűségprogram a pizzatnekem.hu-n, telefonszám alapján:

- **Minden 10. pizza ingyen** – egyedi, egyszer használatos kuponkód.
- **14 napon belüli újrarendelés** – ajándék üdítő kupon.
- A vendég a következő rendelésnél tudja beváltani a kódot a meglévő kosár-kuponmezőben.
- A rendelések teljesülését a Shopify webhookja jelzi az oldalnak, így nem kell manuálisan rögzíteni.

## Megvalósíthatóság
Igen, meg tudjuk valósítani. A meglévő kosár és kedvezményrendszerre építünk, plusz egy adatbázis-táblát és egy Shopify webhook-végpontot kell hozzáadni.

## Működés vázlatosan

```text
Vendég leadja a rendelést Shopify checkouton
        |
        v
Shopify "orders/create" (vagy "orders/paid") webhook
        |
        v
/api/public/shopify-order  -- HMAC aláírás ellenőrzése
        |
        v
Számolás: hány pizzát vásárolt, mikor rendelt utoljára
        |
        v
Ha eléri a 10. pizzát  ->  egyedi kupon a discount_codes táblába
Ha < 14 nap az előző rendeléshez  ->  üdítő kupon
        |
        v
Vendég a /husegprogram oldalon telefonszám megadásával látja a kuponjait
```

## Amit építünk

### 1. Adatbázis (Lovable Cloud / Supabase)

- **`loyalty_customers`** tábla:
  - `phone` – normalizált telefonszám (csak számjegyek), egyedi kulcs.
  - `pizza_count` – eddig fizetett pizzák száma.
  - `free_pizzas_awarded` – eddig kiadott ingyen-pizza kuponok száma.
  - `last_order_at` – legutóbbi rendelés időpontja (az üdítő-kuponhoz).

- **`loyalty_rewards`** tábla:
  - `phone`, `code`, `reward_type` (`free_pizza` / `free_drink`), `value`, `used`, `expires_at`.
  - A kód megegyezik a `discount_codes` táblában létrehozott kuponkóddal.

- **`discount_codes`** tábla kiegészítése:
  - `max_uses` (null = korlátlan).
  - `used_count` (alapértelmezett 0).
  - Így a hűség-kuponokat egyszer használatossá tudjuk tenni.

### 2. Backend webhook végpont

- Fájl: `src/routes/api/public/shopify-order.tsx`.
- `POST` kérés fogadása.
- `X-Shopify-Hmac-Sha256` fejléc ellenőrzése a `SHOPIFY_WEBHOOK_SECRET` kulccsal.
- A rendelésből kinyeri:
  - telefonszámot (normalizálva),
  - pizzák számát (soronkénti `variant_title` tartalmazza a "cm"-et és az ár > 0),
  - alkalmazott kuponokat.
- Frissíti a `loyalty_customers` sort, generálja a kuponokat, és rögzíti a rendelést.
- A rendelésben szereplő kuponok `used_count` értékét növeli.

### 3. Kupon-generálás

- Ingyen pizza kupon: `reward_type = free_pizza`, érték pl. 4290 Ft (egy 30 cm-es pizza alapára), `max_uses = 1`, lejárat pl. 90 nap.
- Üdítő kupon: `reward_type = free_drink`, érték pl. 590 Ft, `max_uses = 1`, lejárat pl. 14 nap.
- Egyedi, véletlenszerű kódszám, pl. `HUSEG-PIZZA-A3F7K2`.

### 4. Frontend – hűségprogram oldal

- Új route: `/husegprogram`.
- Input: telefonszám.
- Megjeleníti:
  - hány pizzánál tart a vendég (10-es "bélyegző" sáv),
  - aktív, még be nem váltott kuponokat,
  - lejárat dátumát.
- A kuponokat a vendég a meglévő kosárban tudja beváltani.

### 5. Kosár-kupon ellenőrzés frissítése

- `validateDiscountCode` figyelembe veszi a `max_uses` / `used_count` mezőket is.
- A hűség-kuponok ugyanúgy működnek, mint a sima kuponok.

## Shopify beállítás (szükséges lépés)

1. A Shopify adminban létre kell hozni egy webhookot:
   - Esemény: `orders/create` (vagy `orders/paid`).
   - URL: `https://pizzatnekem.hu/api/public/shopify-order`.
   - Formátum: JSON.
2. A webhook részleteiben megjelenő **Webhook secret**-et hozzá kell adni a projekt titkos kulcsaihoz `SHOPIFY_WEBHOOK_SECRET` néven.
3. A webhook csak az éles, publikált domainre küldhető, ezért a publikált `https://pizzatnekem.hu` cím kell.

## Tesztelés

1. Tesztrendelés leadása Shopify checkouton (tesztkártyával vagy személyes átvétellel).
2. Ellenőrzés, hogy a webhook elérte-e a végpontot (szerver-log / adatbázis).
3. `/husegprogram` oldalon a megadott telefonszámra megjelenik-e a kupon.
4. A kupon beírása a kosárban csökkenti-e a fizetendő összeget.

## Korlátozások / fontos tudnivalók

- A vendéget a telefonszáma azonosítja; ha más telefonszámmal rendel, külön hűségszámlálója lesz.
- A 14 napos üdítő-kuponhoz szükség van egy üdítő termékre (vagy fix összegű kuponra). Javaslat: kezdetben fix 590 Ft-os kupon, amit bármely termékre felhasználhat.
- A webhook csak akkor működik, ha a Shopify adminban aktív és a secret helyesen van eltárolva.
- A kuponok egyedi, egyszer használatosak; ha a vendég nem használja fel lejáratig, elveszik.

## Technikai részletek

- Migráció: `loyalty_customers`, `loyalty_rewards` létrehozása, `discount_codes` bővítése.
- Végpont: `src/routes/api/public/shopify-order.tsx` (`createFileRoute` + `server.handlers.POST`).
- HMAC ellenőrzés: `crypto.createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)`.
- Adatbázis-műveletek: `supabaseAdmin` a webhook handlerben (`await import('@/integrations/supabase/client.server')`).
- Kupon-generálás: `src/lib/loyalty.server.ts` segédfüggvények.
- Lekérdezés: `src/lib/loyalty.functions.ts` (`getLoyaltyStatus`).
- UI: `src/routes/husegprogram.tsx` + `src/components/LoyaltyCard.tsx`.
