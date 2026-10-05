/**
 * Preorder slot helpers. All times are Europe/Budapest local times and are
 * stored as "YYYY-MM-DDTHH:mm" strings (no timezone suffix) so the kitchen
 * always sees the same wall-clock time the customer picked.
 */

export const SLOT_STEP_MINUTES = 15;
/** Earliest lead time for a preorder placed for today. */
export const MIN_LEAD_MINUTES = 45;
/** How many days ahead (including today) can be picked. */
export const PREORDER_DAYS = 7;

const DAY_NAMES = [
  "Vasárnap",
  "Hétfő",
  "Kedd",
  "Szerda",
  "Csütörtök",
  "Péntek",
  "Szombat",
] as const;

/** day of week (0 = Sunday) -> opening window, null when closed */
const OPENING: Record<number, { open: string; close: string } | null> = {
  0: { open: "10:30", close: "21:45" },
  1: null,
  2: { open: "16:00", close: "21:45" },
  3: { open: "16:00", close: "21:45" },
  4: { open: "16:00", close: "21:45" },
  5: { open: "16:00", close: "21:45" },
  6: { open: "10:30", close: "21:45" },
};

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function toMinutes(time: string): number {
  const [h = "0", m = "0"] = time.split(":");
  return Number(h) * 60 + Number(m);
}

function fromMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function budapestNow(): { date: string; minutes: number; dayOfWeek: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Budapest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
    dayOfWeek: WEEKDAY_INDEX[get("weekday")] ?? 0,
  };
}

function addDays(date: string, days: number): string {
  const [y = "1970", m = "01", d = "01"] = date.split("-");
  const base = Date.UTC(Number(y), Number(m) - 1, Number(d));
  const next = new Date(base + days * 86_400_000);
  return next.toISOString().slice(0, 10);
}

export interface PreorderDay {
  /** YYYY-MM-DD */
  date: string;
  label: string;
  slots: string[]; // "18:30"
}

/** Selectable days with their available 15-minute slots. */
export function getPreorderDays(): PreorderDay[] {
  const now = budapestNow();
  const days: PreorderDay[] = [];

  for (let offset = 0; offset < PREORDER_DAYS; offset++) {
    const dayOfWeek = (now.dayOfWeek + offset) % 7;
    const window = OPENING[dayOfWeek];
    if (!window) continue;

    const date = addDays(now.date, offset);
    const openMin = toMinutes(window.open);
    const closeMin = toMinutes(window.close);
    const earliest =
      offset === 0 ? Math.max(openMin, now.minutes + MIN_LEAD_MINUTES) : openMin;
    const first = Math.ceil(earliest / SLOT_STEP_MINUTES) * SLOT_STEP_MINUTES;

    const slots: string[] = [];
    for (let t = first; t <= closeMin - SLOT_STEP_MINUTES; t += SLOT_STEP_MINUTES) {
      slots.push(fromMinutes(t));
    }
    if (slots.length === 0) continue;

    const dayName = DAY_NAMES[dayOfWeek] ?? "";
    days.push({
      date,
      label: offset === 0 ? `Ma (${dayName})` : offset === 1 ? `Holnap (${dayName})` : dayName,
      slots,
    });
  }

  return days;
}

export function buildScheduledAt(date: string, time: string): string {
  return `${date}T${time}`;
}

export function parseScheduledAt(value: string): { date: string; time: string } | null {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/.exec(value);
  if (!match?.[1] || !match[2]) return null;
  return { date: match[1], time: match[2] };
}

/** Human readable label, e.g. "szeptember 24., csütörtök 18:30". */
export function formatScheduledAt(value: string): string {
  const parsed = parseScheduledAt(value);
  if (!parsed) return value;
  const [y = "0", m = "1", d = "1"] = parsed.date.split("-");
  const dateLabel = new Intl.DateTimeFormat("hu-HU", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date(Date.UTC(Number(y), Number(m) - 1, Number(d))));
  return `${dateLabel} ${parsed.time}`;
}

/** True when the stored slot is still in the future and inside opening hours. */
export function isScheduledAtValid(value: string | null): boolean {
  if (!value) return false;
  const parsed = parseScheduledAt(value);
  if (!parsed) return false;
  return getPreorderDays().some(
    (day) => day.date === parsed.date && day.slots.includes(parsed.time),
  );
}
