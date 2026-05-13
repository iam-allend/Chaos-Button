import { create } from "zustand";
import { chaosEngine } from "@/engine/chaosEngine";

export type ChaosLevel = 0 | 1 | 2 | 3 | 4 | 5;

interface ChaosState {
  chaosLevel: ChaosLevel;
  pressCount: number;
  isTransitioning: boolean;
  lastPressedAt: number | null;
  incrementChaos: () => void;
  setTransitioning: (value: boolean) => void;
}

// Press count thresholds for level escalation
const LEVEL_THRESHOLDS: [number, ChaosLevel][] = [
  [20, 5],
  [13, 4],
  [7,  3],
  [3,  2],
  [1,  1],
  [0,  0],
];

function computeLevel(count: number): ChaosLevel {
  for (const [threshold, lvl] of LEVEL_THRESHOLDS) {
    if (count >= threshold) return lvl;
  }
  return 0;
}

export const useChaosStore = create<ChaosState>((set, get) => ({
  chaosLevel: 0,
  pressCount: 0,
  isTransitioning: false,
  lastPressedAt: null,

  incrementChaos: () => {
    const { pressCount } = get();
    const newCount = pressCount + 1;
    const newLevel = computeLevel(newCount);

    set({
      pressCount: newCount,
      chaosLevel: newLevel,
      lastPressedAt: Date.now(),
      isTransitioning: true,
    });

    // Fire all chaos events through the engine
    chaosEngine.processPressEvent(newLevel, newCount);

    setTimeout(() => set({ isTransitioning: false }), 600);
  },

  setTransitioning: (value) => set({ isTransitioning: value }),
}));