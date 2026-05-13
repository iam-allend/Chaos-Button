"use client";

import { useAnimation } from "framer-motion";
import { useChaosEvents } from "./useChaosEvents";
import type { ChaosEvent } from "@/engine/chaosEvents";
import type { ScreenShakePayload } from "@/engine/chaosEvents";

/**
 * Returns Framer Motion controls that shake when SCREEN_SHAKE fires.
 * Attach to a motion.div wrapping the whole scene.
 */
export function useScreenShake() {
  const controls = useAnimation();

  useChaosEvents("SCREEN_SHAKE", async (event: ChaosEvent) => {
    const { intensity, duration } = event.payload as ScreenShakePayload;
    const steps = 6;
    const stepDuration = duration / steps / 1000;

    const keyframes = Array.from({ length: steps }, (_, i) => {
      const decay = 1 - i / steps;
      const x = (Math.random() - 0.5) * 2 * intensity * decay;
      const y = (Math.random() - 0.5) * 2 * intensity * decay;
      return { x, y };
    });
    keyframes.push({ x: 0, y: 0 });

    for (const frame of keyframes) {
      await controls.start({
        x: frame.x,
        y: frame.y,
        transition: { duration: stepDuration, ease: "easeOut" },
      });
    }
  });

  return controls;
}