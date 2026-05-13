import { useEffect } from "react";
import { chaosEngine } from "@/engine/chaosEngine";
import type { ChaosEvent, ChaosEventType } from "@/engine/chaosEvents";

/**
 * Subscribe to one or more chaos event types.
 * Auto-unsubscribes on unmount.
 *
 * Usage:
 *   useChaosEvents("SCREEN_SHAKE", (e) => { ... });
 *   useChaosEvents(["GLITCH_FLASH", "BG_DISTORTION"], handler);
 */
export function useChaosEvents(
  types: ChaosEventType | ChaosEventType[],
  handler: (event: ChaosEvent) => void
): void {
  useEffect(() => {
    const typeList = Array.isArray(types) ? types : [types];
    const unsubscribers = typeList.map((t) => chaosEngine.on(t, handler));
    return () => unsubscribers.forEach((fn) => fn());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}