import { createFileRoute } from "@tanstack/react-router";
import { fetchProducts } from "@/lib/shopify";

const BASE = "https://pizzatnekem.hu";
const STATIC: Array<[string, string, string]> = [
  ["/", "daily", "1.0"],
  ["/menunk", "daily", "0.9"],
  ["/te-pizzad", "weekly", "0.9"],
  ["/ajanlataink", "weekly", "0.8"],
  ["/markak/a-pizza", "weekly", "0.8"],
  ["/markak/gustavos", "weekly", "0.8"],
  ["/husegprogram", "monthly", "0.7"],
  ["/nyeremenyjatek", "weekly", "0.7"],
  ["/contact", "monthly", "0.6"],
];
const HIDDEN_TYPES = ["Szállítás"];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const today = new Date().toISOString().slice(0, 10);
        let products: string[] = [];
        try {
          const list = await fetchProducts(250);
          products = list
            .filter((p) => !HIDDEN_TYPES.includes((p.node as { productType?: string }).productType ?? ""))
            .filter((p) => !/aj[áa]nd[ée]k/i.test(p.node.title))
            .filter((p) => !/kisz[áa]ll[íi]t[áa]si d[íi]j/i.test(p.node.title))
            .map((p) => p.node.handle);
        } catch {
          products = [];
        }
        const urls = [
          ...STATIC.map(
            ([path, freq, pr]) =>
              `<url><loc>${BASE}${path}</loc><lastmod>${today}</lastmod><changefreq>${freq}</changefreq><priority>${pr}</priority></url>`,
          ),
          ...products.map(
            (h) =>
              `<url><loc>${BASE}/product/${encodeURIComponent(h)}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`,
          ),
        ];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
