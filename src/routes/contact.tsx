import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Clock, MapPin, Phone, Mail } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Kapcsolat — Pizzafaló Szeged" },
      {
        name: "description",
        content:
          "Pizzafaló Szeged elérhetőségei: telefonszám, cím, nyitvatartás és kiszállítási terület.",
      },
      { property: "og:title", content: "Kapcsolat — Pizzafaló Szeged" },
      { property: "og:description", content: "Hívj minket, vagy nézd meg a nyitvatartásunkat." },
      { property: "og:url", content: "https://pizzatnekem.hu/contact" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://pizzatnekem.hu/contact" }],
  }),
  component: ContactPage,
});

const hours = [
  { day: "Hétfő", time: "Zárva" },
  { day: "Kedd – Péntek", time: "16:00 – 21:45" },
  { day: "Szombat – Vasárnap", time: "10:30 – 21:45" },
];

function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Kapcsolat</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Kérdésed van a rendelésről? Keress minket bátran.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card className="space-y-4 border-border/40 bg-card-gradient p-6">
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-5 w-5 text-brand" />
            <div>
              <p className="font-medium text-foreground">Telefon</p>
              <a href="tel:+36707923777" className="text-muted-foreground hover:text-foreground">
                +36 70 792 3777
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 text-brand" />
            <div>
              <p className="font-medium text-foreground">E-mail</p>
              <a
                href="mailto:pizzafalopizzeria@gmail.com"
                className="text-muted-foreground hover:text-foreground"
              >
                pizzafalopizzeria@gmail.com
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 text-brand" />
            <div>
              <p className="font-medium text-foreground">Cím</p>
              <p className="text-muted-foreground">6726 Szeged, Vedres utca 14.</p>
            </div>
          </div>
        </Card>

        <Card className="border-border/40 bg-card-gradient p-6">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-brand" />
            <p className="font-medium text-foreground">Nyitvatartás</p>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {hours.map((h) => (
              <li key={h.day} className="flex justify-between border-b border-border/30 pb-2">
                <span className="text-muted-foreground">{h.day}</span>
                <span className="text-foreground">{h.time}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
