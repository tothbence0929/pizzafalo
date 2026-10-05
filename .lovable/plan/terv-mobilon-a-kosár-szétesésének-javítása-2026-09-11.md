# Terv: Mobilon a kosár szétesésének javítása

## Cél

Az iPhone 13 (és hasonló keskeny készülékek) előtti kosár panelen a tételek rendesen látszódjanak, ne csússzanak ki a képernyőről, és a mennyiség-választó/törlés gombok mindig elérhetők legyenek.

## Megállapított hibák

1. A `CartDrawer.tsx` kosártétel-sora `flex gap-4`-et használ, ahol a bal oldalon 64×64 kép, középen a szövegblokk, jobbra a mennyiség- és törlés-gombok vannak. Nagyobb nevű termékek, extrák listája vagy hosszabb cím esetén a középső szöveg nem csökken eléggé, és a jobb oldali gombsor kilóg vagy összenyomódik.
2. A kiválasztott variánsokat/extrákat listázó `<p>` nincs lecsíkoltatva/törve, így egyetlen hosszú sor kitolja a flex elemet.
3. Az alsó összesítő szekcióban a teljes sor (`Részösszeg`, kedvezmény, szállítás, fizetendő) egysorban van; nagy összegeknél vagy hosszabb címkéknél szintén összecsúszhat.
4. A `DeliveryAndCoupon.tsx` kuponbeviteli sorában az input és a „Beváltás” gomb `flex gap-2`-vel van egymás mellé téve; nagy betűméretnél a gomb összenyomódhat.

## Változtatások

1. **Kosártétel-sor átrendezése** (`src/components/cart/CartDrawer.tsx`):
   - Cseréljük az egyszerű `flex gap-4` elrendezést CSS grid-re: `grid-cols-[auto_minmax(0,1fr)_auto]`.
   - A középső szöveges rész `min-w-0` maradjon, de a cím kapjon `truncate` vagy `whitespace-normal break-words` viselkedést, a variánslista pedig legyen `text-sm text-muted-foreground line-clamp-2`.
   - A jobb oldali törlés+mennyiség oszlopot tartsuk egyben, és `min-w-0` segítségével engedjük zsugorodni. Szükség esetén a mennyiség-sor alá kerüljön egy külön sorban mobilon (`grid` helyett kisebb viewportra vertikális elrendezés).
   - A képet tegyük `shrink-0`-ra.
2. **Összesítő sorok javítása** (`src/components/cart/CartDrawer.tsx`):
   - Minden `flex justify-between` sort cseréljük `grid grid-cols-[minmax(0,1fr)_auto]`-ra, hogy a bal címke törhessen több sorba, de a jobb összeg ne tolja ki.
   - A „Fizetendő” sort is ugyanígy formázzuk.
3. **Kupon sor javítása** (`src/components/cart/DeliveryAndCoupon.tsx`):
   - A kuponkód input+gombsort alakítsuk `grid grid-cols-[minmax(0,1fr)_auto]`-ra, és a gomb szövege mobilon maradjon „Beváltás” (vagy rövidítés), de ne csússzon össze.
4. **Gyors ellenőrzés**:
   - Typecheck futtatása.
   - Böngészős teszt mobilméretben (iPhone 13 viewport: 390×844) kosár megnyitásával, legalább 2–3 különböző termék hozzáadásával.
