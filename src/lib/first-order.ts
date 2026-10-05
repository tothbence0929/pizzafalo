/** Feliratkozási ajándék: ajándék üdítő az első rendeléshez (client-safe constants). */

/** Egy 0,5 l-es üdítő értéke Ft-ban — ennyit ír jóvá a kupon. */
export const FIRST_ORDER_DRINK_VALUE = 590;
export const FIRST_ORDER_MIN_AMOUNT = 5000;
export const FIRST_ORDER_EXPIRY_DAYS = 60;
export const FIRST_ORDER_CODE_PREFIX = "UDITO";

/**
 * A Shopify oldalon élő kuponkód, ami minden személyes ajándék üdítő kód mögött áll.
 * A személyes kódokat (UDITO-XXXXXX) a saját adatbázisunk tartja nyilván; ez a
 * közös Shopify kód adja ugyanazt a kedvezményt a Shopify fizetési oldalon.
 */
export const SHOPIFY_FIRST_ORDER_CODE = "UDITOAJANDEK";

export function isFirstOrderCode(code: string | null | undefined): boolean {
  return !!code && code.toUpperCase().startsWith(FIRST_ORDER_CODE_PREFIX);
}
