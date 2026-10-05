import { createFileRoute } from "@tanstack/react-router";
import { OffersSection } from "@/components/OffersSection";
import { UpsellRow } from "@/components/UpsellRow";

export const Route = createFileRoute("/ajanlataink")({
  head: () => ({
    meta: [
      { title: "Ajánlatok — Pizzafaló Szeged" },
      {
        name: "description",
        content:
          "2+1 pizza ajánlat és a hónap kedvence kedvezménnyel, online rendeléshez Szegeden.",
      },
      { property: "og:title", content: "Ajánlatok — Pizzafaló Szeged" },
      {
        property: "og:description",
        content: "2+1 pizza ajánlat és a hónap kedvence kedvezménnyel a Pizzafalótól.",
      },
      { property: "og:url", content: "https://pizzatnekem.hu/ajanlataink" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://pizzatnekem.hu/ajanlataink" }],
  }),
  component: OffersPage,
});

function OffersPage() {
  return (
    <div>
      <OffersSection />
      <div className="container mx-auto px-4 pb-16 lg:px-8">
        <UpsellRow title="Tedd teljessé a rendelést" />
      </div>
    </div>
  );
}
