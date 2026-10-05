# Ghost kitchen márkák: A Pizza. és Gustavo's bekötése

## Cél
A két ghost kitchen márka a Pizzafaló oldalon belül kap saját oldalt és márkaválasztót. Termékek ugyanabba a Shopify boltba kerülnek; kosár, checkout, szállítási zónák, díjak, nyitvatartás változatlanul közösek (ugyanaz a konyha, ugyanaz a telefonszám és a 6726 Szeged cím).

## Begyűjtött étlap (Wolt alapján, jóváhagyásra)

### A Pizza. — pan style, 30 cm / 26 cm
| Pizza | Feltétek | 30 cm | 26 cm |
|---|---|---|---|
| Fullos húsimádó | paradicsom, mozzarella, sonka, kolbász, tarja, szalámi | 4 390 | 3 590 |
| Pajta pan | paradicsom, mozzarella, sonka, gomba, kukorica, lilahagyma | 3 890 | 3 390 |
| Klasszik szalámi | paradicsom, mozzarella, extra szalámi | 3 890 | 3 290 |
| Tüzes kolbászos | paradicsom, mozzarella, kolbász, jalapeno, lilahagyma | 3 890 | 3 290 |
| Betyár pan | tejföl, mozzarella, tarja, kolbász, lilahagyma, jalapeno | 3 990 | 3 390 |
| Kéksajtos-kukoricás | tejföl, mozzarella, kéksajt, kukorica, sonka | 3 990 | 3 190 |
| Pásztor pan | tejföl, mozzarella, juhtúró, lilahagyma, szalámi | 3 990 | 3 390 |
| Hawaii hot | paradicsom, mozzarella, kolbász, ananász, jalapeno | 3 990 | 3 390 |
| 5 Sajtos pan | sajtkrém, mozzarella, camembert, kéksajt, füstölt sajt | 4 390 | — |
| Classic margherita | paradicsom, extra mozzarella, oregánó | 2 990 | 2 590 |
| Veggie pan | paradicsom, mozzarella, lilahagyma, kukorica, olíva | 3 890 | 2 890 |
| Fokhagymás sajtos | tejfölös fokhagymás alap, mozzarella, füstölt sajt | 6 280 | 5 780 |

### Gustavo's — pizza and more, 30 cm
| Termék | Feltétek | Ár |
|---|---|---|
| Margherita | paradicsom, mozzarella, oregánó | 3 390 |
| Sonkás | paradicsom, mozzarella, sonka | 3 490 |
| Kolbászos | paradicsom, mozzarella, kolbász | 3 590 |
| Sonka-kukorica | paradicsom, mozzarella, sonka, kukorica | 3 890 |
| Sonka-gomba-kukorica | paradicsom, mozzarella, sonka, gomba, kukorica | 3 990 |
| Négysajtos | sajtkrém, mozzarella, camembert, kéksajt | 4 390 |
| Juhtúrós tarjás | tejfölös fokhagymás alap, mozzarella, juhtúró, tarja, lilahagyma | 3 990 |
| Kertész | paradicsomos alap, mozzarella, olíva, lilahagyma, kukorica, jalapeño | 3 990 |
| Csípős ananászos | paradicsom, mozzarella, sonka, ananász, jalapeño | 3 790 |
| Csípős szalámis | paradicsom, mozzarella, szalámi, jalapeño | 3 890 |
| Mindent bele | paradicsom, mozzarella, kolbász, tarja, szalámi, sonka | 4 390 |
| Jutka kedvence | paradicsomos alap, mozzarella, kéksajt, kolbász, lilahagyma, kukorica | 3 990 |
| Főni kedvence | BBQ paradicsomos alap, mozzarella, szalámi, kukorica, lilahagyma | 3 890 |
| Gabi kedvence | paradicsomos alap, mozzarella, olíva, lilahagyma | 3 790 |
| Ügyvéd Úr kedvence | csípős paradicsomos alap, mozzarella, kolbász, gomba, jalapeño | 3 690 |
| Calzone: Húsimádó | paradicsom, mozzarella, kolbász, tarja, szalámi, sonka | 3 990 |
| Calzone: Sajtimádó | paradicsom, mozzarella, kéksajt, camembert, füstölt sajt | 3 990 |
| Calzone: Csípős | csípős paradicsom, mozzarella, kolbász, jalapeño | 3 990 |
| Calzone: Klasszik | paradicsom, mozzarella, sonka, kukorica, gomba | 3 990 |

Két észrevétel: az A Pizza. „Fokhagymás sajtos" ára (6 280 / 5 780 Ft) kiugrik a többi közül, Gustavo's-nál pedig a Woltban csak 30 cm-es árak vannak (egy 26 cm-es tétel kivételével). Ezeket Shopifyban te fogod pontosítani.

## Megvalósítás
1. **Shopify feltöltés**: a fenti termékek létrehozása `vendor = "A Pizza."` illetve `vendor = "Gustavo's"` mezővel; A Pizza.-nál 26/30 cm variánsokkal, Gustavo's-nál 30 cm alapból (26 cm variáns is létrejön, árát te állítod). Az árakat feltöltés után Shopify adminban szerkesztheted, a weboldal automatikusan azt mutatja.
2. **Képek**: Wolt-képek helyett a márkákhoz illő generált illusztrációkat teszek fel, amíg saját fotókat nem adsz — a Wolt fotók jogilag nem biztos, hogy szabadon átvehetők.
3. **Márka-regiszter**: `src/lib/brands.ts` — név, slug, vendor, leírás, kiemelt szín.
4. **Terméklekérés**: `fetchProducts` vendor-szűréssel (Storefront API `query: "vendor:..."`).
5. **Új oldal**: `src/routes/markak.$brand.tsx` — `/markak/a-pizza`, `/markak/gustavos` a meglévő `ProductCard` ráccsal, kategóriabontással; ismeretlen slug esetén 404.
6. **Fejléc**: `src/components/Header.tsx` márkaválasztó (desktop lenyíló, mobil menüpontok).
7. **Főoldal**: márkabemutató szekció a három márkával.
8. **Szűrések**: a Pizzafaló `/menunk` és „Népszerű pizzáink" csak a Pizzafaló vendort mutatja, hogy ne keveredjenek a márkák.
9. **SEO**: márka oldalak head() meta + canonical, `public/sitemap.xml` bővítése.
10. **Ellenőrzés**: typecheck + Playwright (márkaváltás, kosárba rakás, checkout zónadíjjal).

## Mit nem változtatunk
- Szállítási zónák, díjak, nyitvatartás, ingyenes szállítási küszöb.
- Kosár, checkout, kuponok, hűségprogram, nyereményjáték.
- A Pizzafaló márka megjelenése.
