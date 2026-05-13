/**
 * Chaos Engine
 * Given the current chaos level + press count, decides which events to fire.
 * This is pure logic — no React, no side effects. Fully testable.
 */

import {
  ChaosEvent,
  ChaosEventType,
  FLOATING_MESSAGES,
  GLITCH_COLORS,
  WARNING_MESSAGES,
  makeEvent,
  randomFrom,
} from "./chaosEvents";
import { getLevelConfig } from "./chaosThresholds";
import type { ChaosLevel } from "@/store/chaosStore";

type EventListener = (event: ChaosEvent) => void;

class ChaosEngineClass {
  private listeners = new Map<ChaosEventType, Set<EventListener>>();

  // Subscribe to a specific event type
  on(type: ChaosEventType, cb: EventListener): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(cb);
    return () => this.listeners.get(type)?.delete(cb);
  }

  // Emit an event to all subscribers
  emit(event: ChaosEvent): void {
    this.listeners.get(event.type)?.forEach((cb) => cb(event));
  }

  /**
   * Called every time the button is pressed.
   * Rolls dice against LevelConfig probabilities and emits matching events.
   */
  processPressEvent(level: ChaosLevel, pressCount: number): void {
    if (level === 0) return;
    const cfg = getLevelConfig(level);

    // 1. Screen shake — always on press if level > 0
    this.emit(
      makeEvent("SCREEN_SHAKE", {
        intensity: cfg.shakeIntensity,
        duration: cfg.shakeDuration,
      })
    );

    // 2. Button escape
    if (Math.random() < cfg.buttonEscapeChance) {
      const angle = Math.random() * Math.PI * 2;
      const radius = cfg.buttonEscapeRadius * (0.5 + Math.random() * 0.5);
      this.emit(
        makeEvent("BUTTON_ESCAPE", {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          duration: 0.5 + Math.random() * 0.4,
        })
      );
    }

    // 3. Glitch flash
    if (Math.random() < cfg.glitchChance) {
      this.emit(
        makeEvent("GLITCH_FLASH", {
          color: randomFrom(GLITCH_COLORS),
          duration: 80 + Math.random() * 120,
        })
      );
    }

    // 4. Background distortion
    if (Math.random() < cfg.bgDistortionChance) {
      this.emit(
        makeEvent("BG_DISTORTION", {
          intensity: cfg.bgDistortionIntensity * (0.6 + Math.random() * 0.4),
          duration: 600 + Math.random() * 800,
        })
      );
    }

    // 5. Warning message
    if (Math.random() < cfg.warningChance) {
      const positions = ["top", "bottom", "center"] as const;
      this.emit(
        makeEvent("WARNING_MESSAGE", {
          message: randomFrom(WARNING_MESSAGES),
          position: randomFrom([...positions]),
          duration: 1800 + Math.random() * 1200,
        })
      );
    }

    // 6. Floating message
    if (Math.random() < cfg.floatingMessageChance) {
      this.emit(
        makeEvent("FLOATING_MESSAGE", {
          id: `fm_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          message: randomFrom(FLOATING_MESSAGES),
          x: 10 + Math.random() * 80, // % from left
          y: 10 + Math.random() * 80, // % from top
          color: randomFrom([
            "rgba(6,182,212,0.7)",
            "rgba(139,92,246,0.7)",
            "rgba(239,68,68,0.6)",
            "rgba(255,255,255,0.4)",
          ]),
        })
      );
    }

    // 7. Intensity change broadcast
    this.emit(makeEvent("INTENSITY_CHANGE", { level, pressCount }));
  }
}

// Singleton — one engine for the whole app
export const chaosEngine = new ChaosEngineClass();