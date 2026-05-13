"use client";

import { useAnimation } from "framer-motion";
import { useChaosEvents } from "./useChaosEvents";
import type { ChaosEvent } from "@/engine/chaosEvents";
import type { ButtonEscapePayload } from "@/engine/chaosEvents";

/**
 * Returns Framer Motion controls for the button escape movement.
 * The button drifts to a random offset, then snaps back.
 */
export function useButtonEscape() {
  const controls = useAnimation();

  useChaosEvents("BUTTON_ESCAPE", async (event: ChaosEvent) => {
    const { x, y, duration } = event.payload as ButtonEscapePayload;

    // Drift away
    await controls.start({
      x,
      y,
      transition: {
        duration: duration * 0.4,
        ease: [0.16, 1, 0.3, 1],
      },
    });

    // Brief pause at offset
    await new Promise((r) => setTimeout(r, 80));

    // Snap back with spring
    await controls.start({
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    });
  });

  return controls;
}