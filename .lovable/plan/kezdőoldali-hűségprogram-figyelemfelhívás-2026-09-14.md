# Kezdőoldali hűségprogram figyelemfelhívás

## Cél
A főoldalon jól látható, de nem tolakodó sáv/kártya hívja fel a figyelmet a "Minden 10. pizza ingyen" hűségprogramra, egyértelmű gombbal a részletekért.

## Mit építünk
1. Új komponens: `src/components/LoyaltyBanner.tsx`
   - Rövid főcím: pl. "Minden 10. pizza ingyen"
   - 1–2 soros magyarázat: "Gyűjtsd a rendeléseidet telefonszámoddal, és a 10. pizzád ajándékba adjuk."
   - CTA gomb: "Hűségprogram részletei" → `/husegprogram`
   - Megjelenés: brand színek, rounded kártya/banner stílus, meglévő dizájnnyelvhez illeszkedik.
2. Beillesztés a főoldalra (`src/routes/index.tsx`)
   - Hely: közvetlenül a `<SocialProof />` szekció után, az ajánlatok szekció elé.
   - Mobil és asztali nézeten is jól olvasható legyen.

## Technikai részletek
- Használt elemek: `Button`, `Link` (TanStack Router), `Gift` ikon (lucide-react), meglévő szín-/térköz tokenek.
- A `PIZZA_THRESHOLD` konstans az `src/lib/loyalty.ts`-ből kerül be, hogy a szám forráshelyesen maradjon.
- Nincs backend vagy adatbázis változtatás; tisztán prezentációs módosítás.

## Ellenőrzés
- TypeScript typecheck futtatása.
- Főoldal betöltése preview-ben, a banner és a gomb kattinthatóságának ellenőrzése.
