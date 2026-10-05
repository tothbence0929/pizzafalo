import { Link } from "@tanstack/react-router";
import { trackInteraction } from "@/lib/analytics";
import { Phone, MapPin, Mail, Clock } from "lucide-react";

export function Footer() {
  return (
    <>
      <footer className="mt-16 border-t border-border/40 bg-card/40 pb-24 md:pb-0">
        <div className="container mx-auto grid grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-3 lg:px-8">
          <div className="rounded-xl border border-brand/30 bg-brand/10 p-5">
            <p className="text-sm font-semibold text-foreground">Segítségre van szükséged?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Hívj minket, és telefonon is leadhatod a rendelést.
            </p>
            <a
              href="tel:+36707923777"
              onClick={() => trackInteraction("phone_call")}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
            >
              <Phone className="h-4 w-4" />
              +36 70 792 3777
            </a>
          </div>

          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Pizzafaló Pizzéria</p>
            <a
              href="https://maps.google.com/?q=6726+Szeged+Vedres+utca+14"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-foreground"
            >
              <MapPin className="h-4 w-4 text-brand" />
              6726 Szeged, Vedres utca 14.
            </a>
            <a
              href="mailto:pizzafalopizzeria@gmail.com"
              className="flex items-center gap-2 hover:text-foreground"
            >
              <Mail className="h-4 w-4 text-brand" />
              pizzafalopizzeria@gmail.com
            </a>
            <p className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" />
              <span>
                Hétfő: zárva
                <br />
                Kedd–péntek: 16:00–21:45
                <br />
                Szombat–vasárnap: 10:30–21:45
              </span>
            </p>
          </div>

          <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Oldalak</p>
            <Link to="/" className="hover:text-foreground">
              Főoldal
            </Link>
            <Link to="/menunk" className="hover:text-foreground">
              Menünk
            </Link>
            <Link to="/ajanlataink" className="hover:text-foreground">
              Ajánlataink
            </Link>
            <Link to="/husegprogram" className="hover:text-foreground">
              Hűségprogram
            </Link>
            <Link to="/nyeremenyjatek" className="hover:text-foreground">
              Nyereményjáték
            </Link>
            <Link to="/contact" className="hover:text-foreground">
              Kapcsolat
            </Link>
          </nav>
        </div>
      </footer>

      <a
        href="tel:+36707923777"
              onClick={() => trackInteraction("phone_call")}
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-2 border-t border-brand/40 bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground md:hidden"
      >
        <Phone className="h-4 w-4" />
        Segítségre van szükséged? Hívj minket!
      </a>
    </>
  );
}
