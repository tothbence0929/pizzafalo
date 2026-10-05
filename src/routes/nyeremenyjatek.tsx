import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Trophy, Gift, Phone, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/nyeremenyjatek")({
  head: () => ({
    meta: [
      { title: "Nyereményjáték — Nyerj Segway rollert | Pizzafaló Szeged" },
      {
        name: "description",
        content:
          "Rendelj a Pizzafalótól és nyerj egy Segway rollert vagy heti 5×10 000 Ft értékű kupont. Játékszabályzat és részletek.",
      },
      { property: "og:title", content: "Nyereményjáték — Nyerj Segway rollert | Pizzafaló Szeged" },
      {
        property: "og:description",
        content: "Nyerj egy Segway rollert vagy heti 5×10 000 Ft kupont a Pizzafaló nyereményjátékán.",
      },
      { property: "og:url", content: "https://pizzatnekem.hu/nyeremenyjatek" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://pizzatnekem.hu/nyeremenyjatek" }],
  }),
  component: GiveawayPage,
});

function GiveawayPage() {
  return (
    <section className="container mx-auto px-4 py-16 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-10">
        <div className="space-y-3 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-sm font-semibold text-brand">
            <Trophy className="h-4 w-4" />
            Nyereményjáték
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Nyerj egy Segway rollert, vagy heti 5×10 000 Ft kupont
          </h1>
          <p className="text-muted-foreground">
            Minden leadott rendelés egy sorsjegy. A rendelések közt sorsoljuk ki a nyereményeket —
            neked csak rendelned kell.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-brand/30 bg-card/60 p-6">
            <Trophy className="h-6 w-6 text-brand" />
            <h2 className="mt-3 text-lg font-bold text-foreground">Fődíj: Segway roller</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A játék végén egy szerencsés vendégünk egy Segway rollert vihet haza.
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/60 p-6">
            <Gift className="h-6 w-6 text-brand" />
            <h2 className="mt-3 text-lg font-bold text-foreground">Heti 5×10 000 Ft kupon</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Minden héten öt darab, egyenként 10 000 Ft értékű kupont sorsolunk ki a rendelések
              között.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Hogyan tudsz játszani?</h2>
          <ol className="space-y-3 text-muted-foreground">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-bold text-brand">
                1
              </span>
              <span>Rendelj a weboldalunkon a játék időtartama alatt.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-bold text-brand">
                2
              </span>
              <span>
                Minden rendelés egy külön esélyt jelent — minél többször rendelsz, annál nagyobb az
                esélyed.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-bold text-brand">
                3
              </span>
              <span>
                A nyertesekkel a rendelésnél megadott e-mailen vesszük fel a kapcsolatot.
              </span>
            </li>
          </ol>
        </div>

        <div className="space-y-4 rounded-2xl border border-border/60 bg-card/40 p-6">
          <h2 className="text-2xl font-bold text-foreground">Játékszabályzat</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">Szervező:</span> Pizzafaló Pizzéria,
              6726 Szeged, Vedres utca 14.
            </p>
            <p>
              <span className="font-semibold text-foreground">Részvétel:</span> A játékban minden 18
              évet betöltött, Magyarországon lakóhellyel rendelkező természetes személy részt vehet,
              aki a játék időtartama alatt érvényes rendelést ad le a Pizzafalónál.
            </p>
            <p>
              <span className="font-semibold text-foreground">Sorsolás:</span> A kuponokat hetente,
              a fődíjat a játék lezárásakor sorsoljuk ki a leadott és kifizetett rendelések közül,
              véletlenszerű módon.
            </p>
            <p>
              <span className="font-semibold text-foreground">Nyeremények:</span> 1 db Segway roller
              és hetente 5 db, egyenként 10 000 Ft értékű, a Pizzafalónál felhasználható kupon. A
              nyeremény másra át nem ruházható és készpénzre nem váltható.
            </p>
            <p>
              <span className="font-semibold text-foreground">Nyertesek értesítése:</span> A
              nyerteseket a rendelésnél megadott e-mail címen értesítjük. Ha a nyertes 5 munkanapon
              belül nem elérhető, pótnyertest sorsolunk.
            </p>
            <p>
              <span className="font-semibold text-foreground">Adatkezelés:</span> A részvételhez
              megadott adatokat kizárólag a sorsolás lebonyolítása és a nyertes értesítése céljából
              használjuk, harmadik félnek nem adjuk át.
            </p>
            <p>
              <span className="font-semibold text-foreground">Kizárás:</span> A visszamondott,
              törölt vagy ki nem fizetett rendelések nem vesznek részt a sorsolásban. A szervező
              fenntartja a jogot a szabályzat módosítására.
            </p>
            <p className="text-xs">
              A játék pontos időtartama 2026.09.15-2026.10.15 a sorsolás időpontjait a szervező hirdeti ki weben.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button className="bg-brand text-brand-foreground hover:bg-brand/90" asChild>
            <Link to="/menunk">
              Rendelek és játszom
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" className="border-border/60" asChild>
            <a href="tel:+36707923777">
              <Phone className="mr-2 h-4 w-4" />
              +36 70 792 3777
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
