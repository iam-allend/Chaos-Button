/**
 * Chaos Event System
 * All events are typed, named, and carry a payload.
 * Components subscribe to specific event types via useChaosEvents hook.
 */

export type ChaosEventType =
  | "SCREEN_SHAKE"
  | "BUTTON_ESCAPE"
  | "GLITCH_FLASH"
  | "BG_DISTORTION"
  | "WARNING_MESSAGE"
  | "FLOATING_MESSAGE"
  | "INTENSITY_CHANGE";

export interface ChaosEvent<T = unknown> {
  id: string;
  type: ChaosEventType;
  timestamp: number;
  payload: T;
}

// ─── Typed Payloads ────────────────────────────────────────────────

export interface ScreenShakePayload {
  intensity: number;
  duration: number;
}

export interface ButtonEscapePayload {
  x: number;
  y: number;
  duration: number;
}

export interface GlitchFlashPayload {
  color: string;
  duration: number;
}

export interface BgDistortionPayload {
  intensity: number;
  duration: number;
}

export interface WarningMessagePayload {
  message: string;
  position: "top" | "bottom" | "center";
  duration: number;
}

export interface FloatingMessagePayload {
  id: string;
  message: string;
  x: number;
  y: number;
  color: string;
}

export interface IntensityChangePayload {
  level: number;
  pressCount: number;
}

// ─── Content Pools ─────────────────────────────────────────────────

export const WARNING_MESSAGES = [
  "SYSTEM INTEGRITY: COMPROMISED",
  "CONTAINMENT BREACH DETECTED",
  "REALITY_THREAD.EXE HAS STOPPED",
  "UNAUTHORIZED ACCESS — LEVEL ESCALATING",
  "WARNING: CAUSALITY LOOP FORMING",
  "DO NOT CONTINUE",
  "KERNEL PANIC IMMINENT",
  "YOU WERE TOLD NOT TO PRESS IT",
  "TEMPORAL ANOMALY DETECTED",
  "MEMORY OVERFLOW: STACK CORRUPTED",
  "CANNOT UNDO THIS",
  "ENTROPY INCREASING",
  "SIGNAL LOST — RECALIBRATING",
  "THIS IS YOUR FINAL WARNING",
];

export const FLOATING_MESSAGES = [
  "why",
  "stop",
  "don't",
  "no",
  "please",
  "ERROR",
  "help",
  "too late",
  "oh no",
  "what have you done",
  "irreversible",
  "you fool",
  "chaos++",
  "null",
  "undefined",
  "NaN",
  "⚠",
  "!!!",
  "abort()",
  "signal: 9",
  "segfault",
];

export const GLITCH_COLORS = [
  "rgba(6,182,212,0.06)",    // cyan
  "rgba(139,92,246,0.06)",   // violet
  "rgba(239,68,68,0.04)",    // red
  "rgba(255,255,255,0.03)",  // white
];

// ─── Factory helpers ────────────────────────────────────────────────

export function makeEvent<T>(type: ChaosEventType, payload: T): ChaosEvent<T> {
  return {
    id: `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    timestamp: Date.now(),
    payload,
  };
}

export function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}