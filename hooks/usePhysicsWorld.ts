"use client";

import { useEffect, useRef, useCallback } from "react";
import { physicsEngine, type BodyState } from "@/engine/physicsEngine";
import { getChaosConfig } from "@/engine/chaosThresholds";
import { useChaosStore } from "@/store/chaosStore";

interface UsePhysicsWorldOptions {
  onTick?: (states: BodyState[]) => void;
  enabled?: boolean;
}

/**
 * Initializes the physics world and drives it with requestAnimationFrame.
 * Calls onTick every frame with fresh body positions for DOM sync.
 * Also syncs gravity to chaosScore.
 */
export function usePhysicsWorld({ onTick, enabled = true }: UsePhysicsWorldOptions = {}) {
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const chaosScore = useChaosStore((s) => s.chaosScore);

  // Keep gravity in sync with chaos score
  useEffect(() => {
    if (!physicsEngine.isInitialized) return;
    const cfg = getChaosConfig(chaosScore);
    physicsEngine.setGravity(0, cfg.gravityY);
  }, [chaosScore]);

  const tick = useCallback(
    (time: number) => {
      if (!enabled) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const delta = lastTimeRef.current ? time - lastTimeRef.current : 16;
      lastTimeRef.current = time;

      physicsEngine.tick(delta);

      if (onTick) {
        const states = physicsEngine.getState();
        onTick(states);
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [enabled, onTick]
  );

  useEffect(() => {
    if (!enabled) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    physicsEngine.init(w, h);

    const handleResize = () => {
      physicsEngine.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [enabled, tick]);
}