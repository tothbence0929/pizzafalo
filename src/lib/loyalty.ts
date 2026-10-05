export const FREE_PIZZA_VALUE = 4290; // Ft, egy 30 cm-es pizza alapára
export const FREE_DRINK_VALUE = 590; // Ft
export const FREE_PIZZA_EXPIRY_DAYS = 90;
export const FREE_DRINK_EXPIRY_DAYS = 14;
export const DRINK_ELIGIBILITY_DAYS = 14;
export const PIZZA_THRESHOLD = 10;

export function normalizePhone(phone: unknown): string | null {
  if (!phone || typeof phone !== "string") return null;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 7 ? digits : null;
}
