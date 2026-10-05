import { createServerFn } from "@tanstack/react-start";

/**
 * Publikus mérési konfiguráció (GA4 mérési azonosító). Nem érzékeny adat,
 * de a titkos tárolóból érkezik, ezért szerveren olvassuk ki.
 */
export const getAnalyticsConfig = createServerFn({ method: "GET" }).handler(
  async () => {
    return {
      gaMeasurementId: process.env["GOOGLE_ANALYTICS_MEASUREMENT_ID"] ?? "",
    };
  },
);
