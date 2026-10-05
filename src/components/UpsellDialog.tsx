import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { fetchProducts } from "@/lib/shopify";
import { EXTRA_TYPES, UpsellRow } from "@/components/UpsellRow";
import { useUpsellStore } from "@/stores/upsellStore";

export function UpsellDialog() {
  const { open, lastItemTitle, close } = useUpsellStore();

  const { data } = useQuery({
    queryKey: ["products", "extras"],
    queryFn: () => fetchProducts(100),
    staleTime: 5 * 60 * 1000,
  });

  const hasExtras = (data ?? []).some((p) => EXTRA_TYPES.includes(p.node.productType));
  if (!hasExtras) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className="bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Kérsz hozzá üdítőt vagy szószt?</DialogTitle>
          <DialogDescription>
            {lastItemTitle ? `${lastItemTitle} a kosárban. ` : ""}
            Egy kattintással hozzáadhatod a kedvenc kiegészítőidet.
          </DialogDescription>
        </DialogHeader>
        <UpsellRow title="Népszerű kiegészítők" limit={4} compact />
        <Button variant="outline" className="mt-2 w-full border-border/60" onClick={close}>
          Nem, köszönöm
        </Button>
      </DialogContent>
    </Dialog>
  );
}
