import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Flame } from "lucide-react";
import heroVideo from "@/assets/hero-video.mp4.asset.json";

export function HeroVideo() {
  return (
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover opacity-80"
          poster={undefined}
        >
          <source src={heroVideo.url} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,oklch(0.1_0.02_30/0.4)_100%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20 text-center lg:px-8">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand animate-float">
            <Flame className="h-4 w-4" />
            <span>300 °C-os kemencében sült pizza</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl text-shadow">
            Pizzafaló
            <span className="block text-brand mt-2">Szeged</span>
          </h1>

          <p className="mx-auto max-w-xl text-lg text-muted-foreground sm:text-xl text-shadow-sm">
            Kemencében sült, friss alapanyagokból készült pizzák villámgyors kiszállítással Szegeden
            és környékén.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="h-12 px-8 text-base font-semibold bg-brand text-brand-foreground hover:bg-brand/90 brand-glow animate-pulse-glow"
              asChild
            >
              <Link to="/menunk">
                Rendelj most
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 text-base border-border/60 bg-background/40 backdrop-blur-sm hover:bg-background/60"
              asChild
            >
              <Link to="/menunk">Megnézem az étlapot</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <Flame className="h-4 w-4 text-brand" />
              <span>MIndig frissen készítve</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-brand">🍕</span>
              <span>Házi készítésű és friss alapanyagok</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

