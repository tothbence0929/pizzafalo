import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { initAnalytics, trackPageView } from "@/lib/analytics";

/**
 * Betölti a mérőkódokat és minden útvonalváltásnál oldalmegtekintést mér.
 */
export function useAnalytics() {
  const router = useRouter();

  useEffect(() => {
    initAnalytics();
    trackPageView();

    const unsubscribe = router.subscribe("onResolved", () => {
      trackPageView();
    });
    return unsubscribe;
  }, [router]);
}
