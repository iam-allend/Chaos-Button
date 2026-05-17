/**
 * Chaos Engine — Phase 4 (Physics Extended)
 */

import {
  ChaosEvent,
  ChaosEventType,
  FLOATING_MESSAGES,
  GLITCH_COLORS,
  OS_NOTIFICATIONS,
  VOICE_LINES,
  WARNING_MESSAGES,
  BROWSER_CORRUPT_VALUES,
  FRAGMENT_TEXTS,
  makeEvent,
  randomFrom,
  type FragmentContent,
  type PanelVariant,
} from "./chaosEvents";
import { getChaosConfig } from "./chaosThresholds";
import { audioEngine } from "./audioEngine";

type EventListener = (event: ChaosEvent) => void;

const PANEL_VARIANTS: PanelVariant[] = [
  "error_dialog",
  "terminal",
  "task_manager",
  "not_found",
  "fake_console",
];

const FRAGMENT_TYPES: FragmentContent[] = [
  "code_line",
  "ui_element",
  "error_text",
  "icon",
  "binary",
  "percentage",
];

const FLOATING_BTN_LABELS = [
  "ABORT", "RETRY", "IGNORE", "PANIC", "¿WHY?",
  "UNDO", "REDO", "NO", "YES?", "HELP",
  "DELETE ALL", "FORMAT C:", "sudo chaos",
];

const FLOATING_BTN_COLORS = [
  "rgba(6,182,212,0.85)",
  "rgba(139,92,246,0.85)",
  "rgba(239,68,68,0.85)",
  "rgba(34,197,94,0.85)",
  "rgba(245,158,11,0.85)",
];

class ChaosEngineClass {
  private listeners = new Map<ChaosEventType, Set<EventListener>>();

  on(type: ChaosEventType, cb: EventListener): () => void {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(cb);
    return () => this.listeners.get(type)?.delete(cb);
  }

  emit(event: ChaosEvent): void {
    this.listeners.get(event.type)?.forEach((cb) => cb(event));
  }

  processPressEvent(score: number, pressCount: number): void {
    if (score === 0) return;
    const cfg = getChaosConfig(score);
    const r = Math.random;

    // ── Phase 2: core effects ──────────────────────────────────────

    this.emit(makeEvent("SCREEN_SHAKE", {
      intensity: cfg.shakeIntensity,
      duration: cfg.shakeDuration,
    }));

    if (r() < cfg.buttonEscapeChance) {
      const angle = r() * Math.PI * 2;
      const radius = cfg.buttonEscapeRadius * (0.5 + r() * 0.5);
      this.emit(makeEvent("BUTTON_ESCAPE", {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        duration: 0.4 + r() * 0.5,
      }));
    }

    if (r() < cfg.glitchChance) {
      this.emit(makeEvent("GLITCH_FLASH", {
        color: randomFrom(GLITCH_COLORS),
        duration: 80 + r() * 120,
      }));
    }

    if (r() < cfg.bgDistortionChance) {
      this.emit(makeEvent("BG_DISTORTION", {
        intensity: cfg.bgDistortionIntensity * (0.6 + r() * 0.4),
        duration: 600 + r() * 800,
      }));
    }

    if (r() < cfg.warningChance) {
      const positions = ["top", "bottom", "center"] as const;
      this.emit(makeEvent("WARNING_MESSAGE", {
        message: randomFrom(WARNING_MESSAGES),
        position: randomFrom([...positions]),
        duration: 1800 + r() * 1200,
      }));
    }

    if (r() < cfg.floatingMessageChance) {
      this.emit(makeEvent("FLOATING_MESSAGE", {
        id: `fm_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        message: randomFrom(FLOATING_MESSAGES),
        x: 8 + r() * 84,
        y: 8 + r() * 84,
        color: randomFrom([
          "rgba(6,182,212,0.7)",
          "rgba(139,92,246,0.7)",
          "rgba(239,68,68,0.6)",
          "rgba(255,255,255,0.4)",
        ]),
      }));
    }

    // ── Phase 3: immersive effects ─────────────────────────────────

    if (cfg.soundEnabled) {
      const soundMap: [number, string][] = [
        [0.0, "thud"], [0.4, "glitch"], [0.6, "error"],
        [0.75, "static"], [0.85, "heartbeat"],
      ];
      let chosen = "thud";
      for (const [threshold, name] of soundMap) {
        if (r() > threshold) chosen = name;
      }
      if (score > 40 && r() < 0.15) chosen = "drone";
      audioEngine.play(chosen, cfg.soundIntensity);
    }

    if (r() < cfg.voiceChance) {
      this.emit(makeEvent("SYSTEM_VOICE", randomFrom(VOICE_LINES)));
    }

    if (r() < cfg.osNotificationChance) {
      const notif = randomFrom(OS_NOTIFICATIONS);
      this.emit(makeEvent("OS_NOTIFICATION", {
        ...notif,
        id: `notif_${Date.now()}`,
        duration: 4000 + r() * 2000,
      }));
    }

    if (cfg.cursorDistortionLevel > 0) {
      this.emit(makeEvent("CURSOR_DISTORT", { level: cfg.cursorDistortionLevel }));
    }

    if (cfg.browserCorruptionLevel > 0 && r() < 0.6) {
      const elements = ["addressbar", "tab", "title"] as const;
      const el = randomFrom([...elements]);
      const pool = BROWSER_CORRUPT_VALUES[el] ?? BROWSER_CORRUPT_VALUES.tab;
      this.emit(makeEvent("BROWSER_CORRUPT", {
        level: cfg.browserCorruptionLevel,
        element: el,
        value: randomFrom(pool),
      }));
    }

    if (cfg.horrorAtmosphere > 0.1 && r() < cfg.horrorAtmosphere * 0.6) {
      this.emit(makeEvent("HORROR_PULSE", { intensity: cfg.horrorAtmosphere }));
      if (cfg.horrorAtmosphere > 0.5) {
        audioEngine.play("heartbeat", cfg.soundIntensity * 0.6);
      }
    }

    // ── Phase 4: physics events ────────────────────────────────────

    if (cfg.physicsEnabled) {
      // Spawn fragments — burst of falling text/icons
      if (r() < cfg.fragmentSpawnChance) {
        const count = Math.max(1, Math.floor(cfg.fragmentSpawnCount * (0.5 + r() * 0.5)));
        const type = randomFrom(FRAGMENT_TYPES);
        const pool = FRAGMENT_TEXTS[type];
        this.emit(makeEvent("SPAWN_FRAGMENT", {
          x: 10 + r() * 80,
          y: -5,
          content: type,
          text: randomFrom(pool),
          velocityX: (r() - 0.5) * 8,
          velocityY: 2 + r() * 4,
          count,
        }));
      }

      // Spawn draggable broken panel
      if (r() < cfg.panelSpawnChance) {
        this.emit(makeEvent("SPAWN_PANEL", {
          x: 10 + r() * 70,
          y: 5 + r() * 30,
          variant: randomFrom(PANEL_VARIANTS),
        }));
      }

      // Spawn floating button debris
      if (r() < cfg.floatingButtonChance) {
        this.emit(makeEvent("SPAWN_FLOATING_BUTTON", {
          x: 20 + r() * 60,
          y: 10 + r() * 40,
          label: randomFrom(FLOATING_BTN_LABELS),
          color: randomFrom(FLOATING_BTN_COLORS),
        }));
      }

      // Global physics impulse on high chaos
      if (score >= 65 && r() < 0.25) {
        this.emit(makeEvent("PHYSICS_IMPULSE", {
          forceX: (r() - 0.5) * 0.06,
          forceY: -(r() * 0.08),
          targetAll: true,
        }));
      }

      // Update gravity with chaos
      this.emit(makeEvent("INTENSITY_CHANGE", { score, pressCount }));
    } else {
      this.emit(makeEvent("INTENSITY_CHANGE", { score, pressCount }));
    }
  }
}

export const chaosEngine = new ChaosEngineClass();