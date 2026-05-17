/**
 * Phase 3 — Chaos Threshold System
 * Replaces the 0-5 discrete level with a continuous 1–100 score.
 * Effects are gated by "bands": ranges of the score where certain
 * effects become available and intensify progressively.
 */

export interface ChaosConfig {
  // Core effects (Phase 2)
  shakeIntensity: number;
  shakeDuration: number;
  buttonEscapeRadius: number;
  buttonEscapeChance: number;
  glitchChance: number;
  warningChance: number;
  floatingMessageChance: number;
  bgDistortionIntensity: number;
  bgDistortionChance: number;
  maxFloatingMessages: number;

  // Phase 3 effects
  soundEnabled: boolean;
  soundIntensity: number;
  voiceChance: number;
  osNotificationChance: number;
  cursorDistortionLevel: number;
  browserCorruptionLevel: number;
  horrorAtmosphere: number;
  ambientPulseSpeed: number;

  // Phase 4 physics
  physicsEnabled: boolean;
  fragmentSpawnChance: number;   // 0-1
  fragmentSpawnCount: number;    // max per event
  panelSpawnChance: number;      // 0-1
  floatingButtonChance: number;  // 0-1
  gravityY: number;              // 0-3 multiplier
  maxPhysicsBodies: number;      // performance cap
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.min(1, Math.max(0, t));
}

function lerpConfig(a: ChaosConfig, b: ChaosConfig, t: number): ChaosConfig {
  const l = (av: number, bv: number) => lerp(av, bv, t);
  return {
    shakeIntensity: l(a.shakeIntensity, b.shakeIntensity),
    shakeDuration: l(a.shakeDuration, b.shakeDuration),
    buttonEscapeRadius: l(a.buttonEscapeRadius, b.buttonEscapeRadius),
    buttonEscapeChance: l(a.buttonEscapeChance, b.buttonEscapeChance),
    glitchChance: l(a.glitchChance, b.glitchChance),
    warningChance: l(a.warningChance, b.warningChance),
    floatingMessageChance: l(a.floatingMessageChance, b.floatingMessageChance),
    bgDistortionIntensity: l(a.bgDistortionIntensity, b.bgDistortionIntensity),
    bgDistortionChance: l(a.bgDistortionChance, b.bgDistortionChance),
    maxFloatingMessages: Math.round(l(a.maxFloatingMessages, b.maxFloatingMessages)),
    soundEnabled: t >= 0.5 ? b.soundEnabled : a.soundEnabled,
    soundIntensity: l(a.soundIntensity, b.soundIntensity),
    voiceChance: l(a.voiceChance, b.voiceChance),
    osNotificationChance: l(a.osNotificationChance, b.osNotificationChance),
    cursorDistortionLevel: Math.round(l(a.cursorDistortionLevel, b.cursorDistortionLevel)),
    browserCorruptionLevel: Math.round(l(a.browserCorruptionLevel, b.browserCorruptionLevel)),
    horrorAtmosphere: l(a.horrorAtmosphere, b.horrorAtmosphere),
    ambientPulseSpeed: l(a.ambientPulseSpeed, b.ambientPulseSpeed),
    physicsEnabled: t >= 0.5 ? b.physicsEnabled : a.physicsEnabled,
    fragmentSpawnChance: l(a.fragmentSpawnChance, b.fragmentSpawnChance),
    fragmentSpawnCount: Math.round(l(a.fragmentSpawnCount, b.fragmentSpawnCount)),
    panelSpawnChance: l(a.panelSpawnChance, b.panelSpawnChance),
    floatingButtonChance: l(a.floatingButtonChance, b.floatingButtonChance),
    gravityY: l(a.gravityY, b.gravityY),
    maxPhysicsBodies: Math.round(l(a.maxPhysicsBodies, b.maxPhysicsBodies)),
  };
}

const ANCHORS: [number, ChaosConfig][] = [
  [0, {
    shakeIntensity: 0, shakeDuration: 0, buttonEscapeRadius: 0,
    buttonEscapeChance: 0, glitchChance: 0, warningChance: 0,
    floatingMessageChance: 0, bgDistortionIntensity: 0,
    bgDistortionChance: 0, maxFloatingMessages: 0,
    soundEnabled: false, soundIntensity: 0, voiceChance: 0,
    osNotificationChance: 0, cursorDistortionLevel: 0,
    browserCorruptionLevel: 0, horrorAtmosphere: 0, ambientPulseSpeed: 1,
    physicsEnabled: false, fragmentSpawnChance: 0, fragmentSpawnCount: 0, panelSpawnChance: 0, floatingButtonChance: 0, gravityY: 1.2, maxPhysicsBodies: 0,
  }],
  [10, {
    shakeIntensity: 3, shakeDuration: 280, buttonEscapeRadius: 20,
    buttonEscapeChance: 0.35, glitchChance: 0.2, warningChance: 0.5,
    floatingMessageChance: 0.3, bgDistortionIntensity: 1,
    bgDistortionChance: 0.2, maxFloatingMessages: 2,
    soundEnabled: true, soundIntensity: 0.15, voiceChance: 0.2,
    osNotificationChance: 0.3, cursorDistortionLevel: 0,
    browserCorruptionLevel: 0, horrorAtmosphere: 0.05, ambientPulseSpeed: 1.1,
    physicsEnabled: true, fragmentSpawnChance: 0.2, fragmentSpawnCount: 1, panelSpawnChance: 0, floatingButtonChance: 0, gravityY: 1.2, maxPhysicsBodies: 8,
  }],
  [25, {
    shakeIntensity: 7, shakeDuration: 380, buttonEscapeRadius: 70,
    buttonEscapeChance: 0.6, glitchChance: 0.45, warningChance: 0.75,
    floatingMessageChance: 0.6, bgDistortionIntensity: 3,
    bgDistortionChance: 0.5, maxFloatingMessages: 5,
    soundEnabled: true, soundIntensity: 0.3, voiceChance: 0.4,
    osNotificationChance: 0.55, cursorDistortionLevel: 1,
    browserCorruptionLevel: 0, horrorAtmosphere: 0.2, ambientPulseSpeed: 1.4,
    physicsEnabled: true, fragmentSpawnChance: 0.5, fragmentSpawnCount: 2, panelSpawnChance: 0.15, floatingButtonChance: 0.1, gravityY: 1.4, maxPhysicsBodies: 20,
  }],
  [45, {
    shakeIntensity: 14, shakeDuration: 480, buttonEscapeRadius: 140,
    buttonEscapeChance: 0.8, glitchChance: 0.65, warningChance: 0.9,
    floatingMessageChance: 0.8, bgDistortionIntensity: 5,
    bgDistortionChance: 0.7, maxFloatingMessages: 8,
    soundEnabled: true, soundIntensity: 0.5, voiceChance: 0.6,
    osNotificationChance: 0.75, cursorDistortionLevel: 1,
    browserCorruptionLevel: 1, horrorAtmosphere: 0.45, ambientPulseSpeed: 1.8,
    physicsEnabled: true, fragmentSpawnChance: 0.7, fragmentSpawnCount: 3, panelSpawnChance: 0.3, floatingButtonChance: 0.25, gravityY: 1.7, maxPhysicsBodies: 35,
  }],
  [65, {
    shakeIntensity: 22, shakeDuration: 560, buttonEscapeRadius: 220,
    buttonEscapeChance: 0.92, glitchChance: 0.8, warningChance: 0.97,
    floatingMessageChance: 0.92, bgDistortionIntensity: 7,
    bgDistortionChance: 0.85, maxFloatingMessages: 12,
    soundEnabled: true, soundIntensity: 0.7, voiceChance: 0.8,
    osNotificationChance: 0.9, cursorDistortionLevel: 2,
    browserCorruptionLevel: 2, horrorAtmosphere: 0.7, ambientPulseSpeed: 2.2,
    physicsEnabled: true, fragmentSpawnChance: 0.85, fragmentSpawnCount: 4, panelSpawnChance: 0.5, floatingButtonChance: 0.4, gravityY: 2.0, maxPhysicsBodies: 50,
  }],
  [85, {
    shakeIntensity: 32, shakeDuration: 640, buttonEscapeRadius: 320,
    buttonEscapeChance: 1, glitchChance: 0.92, warningChance: 1,
    floatingMessageChance: 1, bgDistortionIntensity: 9,
    bgDistortionChance: 0.95, maxFloatingMessages: 18,
    soundEnabled: true, soundIntensity: 0.85, voiceChance: 0.95,
    osNotificationChance: 1, cursorDistortionLevel: 3,
    browserCorruptionLevel: 2, horrorAtmosphere: 0.88, ambientPulseSpeed: 2.8,
    physicsEnabled: true, fragmentSpawnChance: 0.95, fragmentSpawnCount: 5, panelSpawnChance: 0.7, floatingButtonChance: 0.6, gravityY: 2.4, maxPhysicsBodies: 65,
  }],
  [100, {
    shakeIntensity: 45, shakeDuration: 750, buttonEscapeRadius: 450,
    buttonEscapeChance: 1, glitchChance: 1, warningChance: 1,
    floatingMessageChance: 1, bgDistortionIntensity: 10,
    bgDistortionChance: 1, maxFloatingMessages: 25,
    soundEnabled: true, soundIntensity: 1, voiceChance: 1,
    osNotificationChance: 1, cursorDistortionLevel: 3,
    browserCorruptionLevel: 3, horrorAtmosphere: 1, ambientPulseSpeed: 4,
    physicsEnabled: true, fragmentSpawnChance: 1, fragmentSpawnCount: 6, panelSpawnChance: 0.9, floatingButtonChance: 0.8, gravityY: 3.0, maxPhysicsBodies: 80,
  }],
];

export function getChaosConfig(score: number): ChaosConfig {
  const clamped = Math.min(100, Math.max(0, score));
  for (let i = 0; i < ANCHORS.length - 1; i++) {
    const [aScore, aConfig] = ANCHORS[i];
    const [bScore, bConfig] = ANCHORS[i + 1];
    if (clamped >= aScore && clamped <= bScore) {
      const t = (clamped - aScore) / (bScore - aScore);
      return lerpConfig(aConfig, bConfig, t);
    }
  }
  return ANCHORS[ANCHORS.length - 1][1];
}

export function getScoreLabel(score: number): string {
  if (score === 0) return "DORMANT";
  if (score < 10) return "AWAKENING";
  if (score < 25) return "UNSTABLE";
  if (score < 45) return "CORRUPTED";
  if (score < 65) return "FRACTURING";
  if (score < 85) return "CRITICAL";
  if (score < 100) return "TERMINAL";
  return "OBLITERATED";
}

// Legacy compat — used by Phase 2 components as needed
export type ChaosLevel = 0 | 1 | 2 | 3 | 4 | 5;

export function scoreToBand(score: number): ChaosLevel {
  if (score === 0) return 0;
  if (score < 10) return 1;
  if (score < 30) return 2;
  if (score < 55) return 3;
  if (score < 80) return 4;
  return 5;
}

// Backward compat shim used by Phase 2 FloatingMessages
export function getLevelConfig(level: ChaosLevel) {
  const scoreMap: Record<ChaosLevel, number> = { 0: 0, 1: 10, 2: 25, 3: 45, 4: 65, 5: 100 };
  return getChaosConfig(scoreMap[level]);
}