import { createFileRoute, notFound, redirect } from "@tanstack/react-router";

// 301 redirects from the old WooCommerce URLs to the new Shopify/Lovable routes.
// Keys are normalized pathnames (lowercase, no trailing slash, no query string).
const REDIRECTS: Record<string, string> = {
  // Termékek és ételek
  "/termek/songoku-26-cm": "/product/sonka-gomba-kukorica",
  "/en/product/songoku-26-cm": "/product/sonka-gomba-kukorica",
  "/termek/sonka-gomba-26-cm": "/product/sonka-gomba",
  "/termek/sonka-szalami-26-cm": "/product/hawaii-copy",
  "/en/product/sonka-szalami-26-cm": "/product/hawaii-copy",
  "/termek/sonka-26-cm": "/product/sonkas-pizza",
  "/en/product/sonka-26-cm": "/product/sonkas-pizza",
  "/termek/hushegy-26-cm": "/product/hushegy",
  "/en/product/hushegy-26-cm": "/product/hushegy",
  "/termek/magyaros-26-cm": "/product/magyaros",
  "/en/product/magyaros-26-cm": "/product/magyaros",
  "/termek/negysajtos-26-cm": "/product/negysajtos",
  "/en/product/negysajtos-26-cm": "/product/negysajtos",
  "/termek/hawaii-26-cm": "/product/hawaii-1",
  "/termek/juhturos-26-cm": "/product/juhturos",
  "/en/product/juhturos-26-cm": "/product/juhturos",
  "/termek/csipos-26-cm": "/product/csipos",
  "/en/product/csipos-26-cm": "/product/csipos",
  "/termek/dream-26-cm": "/product/dream",
  "/en/product/dream-26-cm": "/product/dream",
  "/termek/vivi-26-cm": "/product/vivi",
  "/termek/bolognai-26-cm": "/menunk",
  "/en/product/bolognai-26-cm": "/menunk",

  // Szószok és számozott termékek
  "/termek/szarvasgombas-majonez-50ml": "/product/szarvasgombas-majonez",
  "/en/product/szarvasgombas-majonez-50ml": "/product/szarvasgombas-majonez",
  "/termek/termek-5": "/product/fokhagymas-tejfolos-szosz",
  "/termek/csipos-pizza-szosz-50ml": "/product/csipos-paradicsomszosz",
  "/termek/termek-9": "/product/fokhagymas-szosz",
  "/en/product/termek-9": "/product/fokhagymas-szosz",
  "/termek/termek-10": "/menunk",
  "/en/product/termek-10": "/menunk",
  "/termek/termek-12": "/menunk",
  "/en/product/termek-12": "/menunk",
  "/termek/termek-3": "/menunk",
  "/en/product/termek-3": "/menunk",
  "/termek/termek-6": "/menunk",
  "/en/product/termek-6": "/menunk",
  "/termek/termek-11": "/menunk",
  "/en/product/termek-11": "/menunk",

  // Kategóriák és gyűjtőoldalak
  "/termekkategoria/akciok": "/ajanlataink",
  "/en/product-category/akciok": "/ajanlataink",
  "/termekkategoria/pizzak-food": "/menunk",
  "/en/product-category/pizzak-food": "/menunk",
  "/termekkategoria/italok": "/menunk",
  "/en/product-category/italok": "/menunk",
  "/en": "/",

  // Egyéb oldalak
  "/adatvedelem": "/contact",
  "/en/adatvedelem": "/contact",
  "/bankkartyas-tajekoztato": "/contact",
  "/en/bankkartyas-tajekoztato": "/contact",
  "/szerzodesi-feltetelek": "/contact",
  "/en/jatekszabalyzat": "/nyeremenyjatek",
};

function normalizePath(pathname: string): string {
  let p = pathname.toLowerCase();
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p;
}

export const Route = createFileRoute("/$")({
  beforeLoad: ({ location }) => {
    const path = normalizePath(location.pathname);

    const target = REDIRECTS[path];
    if (target) {
      throw redirect({ href: target, statusCode: 301 });
    }

    // Catch-all: any other old product URL goes to the menu.
    if (path.startsWith("/termek/") || path.startsWith("/en/product/")) {
      throw redirect({ href: "/menunk", statusCode: 301 });
    }

    throw notFound();
  },
  component: () => null,
});
