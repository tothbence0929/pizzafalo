import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Clock } from "lucide-react";
import { useHoursStore } from "@/stores/hoursStore";
import { useCartStore } from "@/stores/cartStore";
import { buildScheduledAt, getPreorderDays } from "@/lib/preorder";
import { toast } from "sonner";

const HOURS = [
  { day: "Hétfő", time: "Zárva" },
  { day: "Kedd – Péntek", time: "16:00 – 21:45" },
  { day: "Szombat – Vasárnap", time: "10:30 – 21:45" },
];

function getCurrentOpeningStatus() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Budapest",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const weekday = value("weekday");
  const currentTime = `${value("hour")}:${value("minute")}`;
  const weekend = weekday === "Sat" || weekday === "Sun";
  const weekdayOpen = ["Tue", "Wed", "Thu", "Fri"].includes(weekday);
  const todayOpen = weekend ? "10:30" : weekdayOpen ? "16:00" : null;
  const todayClose = todayOpen ? "21:45" : null;

  return {
    open: Boolean(todayOpen && todayClose && currentTime >= todayOpen && currentTime < todayClose),
    todayOpen,
    todayClose,
  };
}

export function OpeningHoursNotice() {
  const { open, setStatus } = useHoursStore();
  const [dismissed, setDismissed] = useState(false);
  const setScheduledAt = useCartStore((s) => s.setScheduledAt);

  const startPreorder = () => {
    const days = getPreorderDays();
    const first = days[0];
    if (first?.slots[0]) {
      setScheduledAt(buildScheduledAt(first.date, first.slots[0]));
      toast.success("Előrendelés bekapcsolva — a kosárban választhatsz időpontot.");
    }
    setDismissed(true);
  };

  useEffect(() => {
    if (open !== null) return;
    const status = getCurrentOpeningStatus();
    setStatus(status.open, status.todayOpen, status.todayClose);
  }, [open, setStatus]);

  return (
    <AlertDialog open={open === false && !dismissed}>
      <AlertDialogContent className="border-border/40 bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-foreground">
            <Clock className="h-5 w-5 text-brand" />
            Jelenleg zárva vagyunk
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Most nem tudunk azonnal rendelést fogadni, de előrendelhetsz későbbi időpontra. Nézz körül az étlapon, és gyere vissza
                nyitvatartási időben!
              </p>
              <ul className="space-y-1.5 rounded-lg bg-secondary/40 p-3 text-sm">
                {HOURS.map((h) => (
                  <li key={h.day} className="flex justify-between gap-4">
                    <span className="text-muted-foreground">{h.day}</span>
                    <span className="font-medium text-foreground">{h.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogAction
            className="bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={startPreorder}
          >
            Előrendelek későbbre
          </AlertDialogAction>
          <AlertDialogAction
            className="border border-border/60 bg-secondary text-foreground hover:bg-secondary/80"
            onClick={() => setDismissed(true)}
          >
            Rendben, körülnézek
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
