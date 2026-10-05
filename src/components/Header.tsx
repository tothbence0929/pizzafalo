import { Link, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { trackInteraction } from "@/lib/analytics";
import { Phone, Menu, MapPin } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/pizzafalo-logo.jpg.asset.json";

export function Header() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Főoldal" },
    { to: "/menunk", label: "Menünk" },
    { to: "/te-pizzad", label: "Te Pizzád" },
    { to: "/ajanlataink", label: "Ajánlataink" },
    { to: "/markak/a-pizza", label: "A Pizza." },
    { to: "/markak/gustavos", label: "Gustavo's" },
    { to: "/contact", label: "Kapcsolat" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <img src={logo.url} alt="Pizzafaló logó" className="h-11 w-auto object-contain" />
          <span className="sr-only">Pizzafaló</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="[&.active]:text-brand [&.active]:font-medium px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
            asChild
          >
            <a href="tel:+36707923777"
              onClick={() => trackInteraction("phone_call")}>
              <Phone className="h-4 w-4" />
              <span>+36 70 792 3777</span>
            </a>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden border-brand/50 bg-brand/10 text-brand hover:bg-brand/20"
            asChild
          >
            <a href="tel:+36707923777"
              onClick={() => trackInteraction("phone_call")} aria-label="Hívj minket: +36 70 792 3777">
              <Phone className="h-5 w-5" />
            </a>
          </Button>
          <CartDrawer />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border/40 bg-card/95 backdrop-blur-xl">
          <nav className="container mx-auto flex flex-col p-4 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="[&.active]:text-brand [&.active]:font-medium px-4 py-3 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="tel:+36707923777"
              onClick={() => trackInteraction("phone_call")}
              className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary"
            >
              <Phone className="h-4 w-4" />
              +36 70 792 3777
            </a>
            <a
              href="https://maps.google.com/?q=6726+Szeged+Vedres+utca+14"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary"
            >
              <MapPin className="h-4 w-4" />
              6726 Szeged, Vedres utca 14
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
