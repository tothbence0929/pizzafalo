import { useMemo } from "react";
import { CalendarClock, Zap } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import {
  buildScheduledAt,
  formatScheduledAt,
  getPreorderDays,
  parseScheduledAt,
} from "@/lib/preorder";
import { trackInteraction } from "@/lib/analytics";

export function PreorderPicker() {
  const { orderTiming, scheduledAt, setOrderTiming, setScheduledAt } = useCartStore();
  const days = useMemo(() => getPreorderDays(), []);
  const parsed = scheduledAt ? parseScheduledAt(scheduledAt) : null;
  const selectedDate = parsed?.date ?? days[0]?.date ?? "";
  const selectedDay = days.find((d) => d.date === selectedDate) ?? days[0];
  const isScheduled = orderTiming === "scheduled";

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setOrderTiming("asap")}
          className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
            !isScheduled
              ? "border-brand bg-brand text-brand-foreground"
              : "border-border/60 bg-secondary/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Zap className="h-4 w-4" />
          Mielőbb kérem
        </button>
        <button
          type="button"
          onClick={() => {
            setOrderTiming("scheduled");
            trackInteraction("preorder_open");
            if (!scheduledAt && selectedDay?.slots[0]) {
              setScheduledAt(buildScheduledAt(selectedDay.date, selectedDay.slots[0]));
            }
          }}
          className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
            isScheduled
              ? "border-brand bg-brand text-brand-foreground"
              : "border-border/60 bg-secondary/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          <CalendarClock className="h-4 w-4" />
          Előrendelés
        </button>
      </div>

      {isScheduled && (
        <div className="space-y-2 rounded-lg border-2 border-brand bg-brand/10 p-3">
          {days.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Jelenleg nincs választható előrendelési időpont.
            </p>
          ) : (
            <>
              <label className="text-sm font-medium text-foreground" htmlFor="preorder-day">
                Mikor kéred?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  id="preorder-day"
                  value={selectedDay?.date ?? ""}
                  onChange={(e) => {
                    const day = days.find((d) => d.date === e.target.value);
                    if (day?.slots[0]) setScheduledAt(buildScheduledAt(day.date, day.slots[0]));
                  }}
                  className="rounded-md border border-border/60 bg-secondary/40 px-2 py-2 text-sm text-foreground"
                >
                  {days.map((day) => (
                    <option key={day.date} value={day.date}>
                      {day.label}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Időpont"
                  value={parsed?.time ?? selectedDay?.slots[0] ?? ""}
                  onChange={(e) => {
                    if (selectedDay) setScheduledAt(buildScheduledAt(selectedDay.date, e.target.value));
                  }}
                  className="rounded-md border border-border/60 bg-secondary/40 px-2 py-2 text-sm text-foreground"
                >
                  {(selectedDay?.slots ?? []).map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
              {scheduledAt && (
                <p className="text-xs font-semibold text-brand">
                  Előrendelés erre az időpontra: {formatScheduledAt(scheduledAt)}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
