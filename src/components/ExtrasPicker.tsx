import { Check, Plus } from "lucide-react";
import { formatPrice } from "@/lib/shopify";
import type { ExtraOption } from "@/lib/extras";

interface ExtrasPickerProps {
  options: ExtraOption[];
  selected: string[];
  onToggle: (variantId: string) => void;
  extrasTotal: number;
  compact?: boolean;
}

export function ExtrasPicker({
  options,
  selected,
  onToggle,
  extrasTotal,
  compact = false,
}: ExtrasPickerProps) {
  if (options.length === 0) return null;

  const crust = options.filter((o) => o.isCrust);
  const toppings = options.filter((o) => !o.isCrust);
  const currency = options[0]?.price.currencyCode ?? "HUF";

  return (
    <div className={compact ? "mt-4 space-y-3" : "space-y-5"}>
      {crust.length > 0 && (
        <div className="space-y-2">
          {crust.map((option) => (
            <ExtraChip
              key={option.variantId}
              option={option}
              active={selected.includes(option.variantId)}
              onToggle={onToggle}
              full
            />
          ))}
        </div>
      )}

      {toppings.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Extra feltétek
          </p>
          <div className="flex flex-wrap gap-2">
            {toppings.map((option) => (
              <ExtraChip
                key={option.variantId}
                option={option}
                active={selected.includes(option.variantId)}
                onToggle={onToggle}
              />
            ))}
          </div>
        </div>
      )}

      {extrasTotal > 0 && (
        <p className="text-sm font-medium text-brand">
          Extrák: +{formatPrice(String(extrasTotal), currency)}
        </p>
      )}
    </div>
  );
}

function ExtraChip({
  option,
  active,
  onToggle,
  full = false,
}: {
  option: ExtraOption;
  active: boolean;
  onToggle: (variantId: string) => void;
  full?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(option.variantId)}
      disabled={!option.available}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 ${
        full ? "w-full justify-between rounded-lg px-4 py-2.5 text-sm" : ""
      } ${
        active
          ? "border-brand bg-brand text-brand-foreground"
          : "border-border/60 text-muted-foreground hover:border-brand/50 hover:text-foreground"
      }`}
    >
      <span className="flex items-center gap-2">
        {active ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        {option.label}
      </span>
      <span className={active ? "" : "text-foreground/80"}>
        +{formatPrice(option.price.amount, option.price.currencyCode)}
      </span>
    </button>
  );
}
