"use client";

import { useState, useCallback, useEffect } from "react";
import { useChaosEvents } from "@/hooks/useChaosEvents";
import { useChaosStore } from "@/store/chaosStore";
import { getChaosConfig } from "@/engine/chaosThresholds";
import { physicsEngine } from "@/engine/physicsEngine";
import { usePhysicsWorld } from "@/hooks/usePhysicsWorld";
import FallingFragment from "./FallingFragment";
import BouncingPanel from "./BouncingPanel";
import FloatingButton from "./FloatingButton";
import type { ChaosEvent } from "@/engine/chaosEvents";
import type {
  SpawnFragmentPayload,
  SpawnPanelPayload,
  SpawnFloatingButtonPayload,
  PhysicsImpulsePayload,
  FragmentContent,
  PanelVariant,
  FRAGMENT_TEXTS as FragmentTextsType,
} from "@/engine/chaosEvents";
import { FRAGMENT_TEXTS } from "@/engine/chaosEvents";

interface FragmentItem {
  id: string;
  x: number;
  y: number;
  text: string;
  content: FragmentContent;
  velocityX: number;
  velocityY: number;
}

interface PanelItem {
  id: string;
  x: number;
  y: number;
  variant: PanelVariant;
}

interface FloatingBtnItem {
  id: string;
  x: number;
  y: number;
  label: string;
  color: string;
}

const MAX_FRAGMENTS = 40;
const MAX_PANELS = 6;
const MAX_FLOATING_BTNS = 10;

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function PhysicsLayer() {
  const [fragments, setFragments] = useState<FragmentItem[]>([]);
  const [panels, setPanels] = useState<PanelItem[]>([]);
  const [floatingBtns, setFloatingBtns] = useState<FloatingBtnItem[]>([]);
  const chaosScore = useChaosStore((s) => s.chaosScore);
  const cfg = getChaosConfig(chaosScore);

  // Boot physics world
  usePhysicsWorld({ enabled: cfg.physicsEnabled });

  // ── SPAWN_FRAGMENT ──────────────────────────────────────────────
  const handleFragment = useCallback((event: ChaosEvent) => {
    const payload = event.payload as SpawnFragmentPayload;
    const count = Math.min(payload.count, 4); // local safety cap

    setFragments((prev) => {
      if (prev.length >= MAX_FRAGMENTS) return prev;
      const newItems: FragmentItem[] = Array.from({ length: count }, (_, i) => {
        const contentType = payload.content;
        const pool = FRAGMENT_TEXTS[contentType];
        return {
          id: `frag_${Date.now()}_${i}_${Math.random().toString(36).slice(2)}`,
          x: Math.max(5, Math.min(95, payload.x + (Math.random() - 0.5) * 20)),
          y: payload.y,
          text: randomFrom(pool),
          content: contentType,
          velocityX: payload.velocityX + (Math.random() - 0.5) * 4,
          velocityY: payload.velocityY + Math.random() * 2,
        };
      });
      return [...prev, ...newItems].slice(-MAX_FRAGMENTS);
    });
  }, []);

  // ── SPAWN_PANEL ─────────────────────────────────────────────────
  const handlePanel = useCallback((event: ChaosEvent) => {
    const payload = event.payload as SpawnPanelPayload;
    setPanels((prev) => {
      if (prev.length >= MAX_PANELS) return prev;
      return [
        ...prev,
        {
          id: `panel_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          x: payload.x,
          y: payload.y,
          variant: payload.variant,
        },
      ];
    });
  }, []);

  // ── SPAWN_FLOATING_BUTTON ───────────────────────────────────────
  const handleFloatingBtn = useCallback((event: ChaosEvent) => {
    const payload = event.payload as SpawnFloatingButtonPayload;
    setFloatingBtns((prev) => {
      if (prev.length >= MAX_FLOATING_BTNS) return prev;
      return [
        ...prev,
        {
          id: `fbtn_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          x: payload.x,
          y: payload.y,
          label: payload.label,
          color: payload.color,
        },
      ];
    });
  }, []);

  // ── PHYSICS_IMPULSE ─────────────────────────────────────────────
  const handleImpulse = useCallback((event: ChaosEvent) => {
    const { forceX, forceY, targetAll } = event.payload as PhysicsImpulsePayload;
    if (!targetAll) return;
    const states = physicsEngine.getState();
    states.forEach(({ id }) => {
      physicsEngine.applyImpulse(id, forceX, forceY);
    });
  }, []);

  useChaosEvents("SPAWN_FRAGMENT", handleFragment);
  useChaosEvents("SPAWN_PANEL", handlePanel);
  useChaosEvents("SPAWN_FLOATING_BUTTON", handleFloatingBtn);
  useChaosEvents("PHYSICS_IMPULSE", handleImpulse);

  // ── Lifecycle handlers ──────────────────────────────────────────
  const removeFragment = useCallback((id: string) => {
    setFragments((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const removePanel = useCallback((id: string) => {
    setPanels((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const removeFloatingBtn = useCallback((id: string) => {
    setFloatingBtns((prev) => prev.filter((b) => b.id !== id));
  }, []);

  if (!cfg.physicsEnabled) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 33 }}
      aria-hidden="true"
    >
      {/* Pointer events enabled only on interactive physics items */}
      <div className="pointer-events-auto absolute inset-0">
        {/* Falling fragments */}
        {fragments.map((frag) => (
          <FallingFragment
            key={frag.id}
            {...frag}
            onExpire={removeFragment}
          />
        ))}

        {/* Bouncing draggable panels */}
        {panels.map((panel) => (
          <BouncingPanel
            key={panel.id}
            {...panel}
            onClose={removePanel}
          />
        ))}

        {/* Floating button debris */}
        {floatingBtns.map((btn) => (
          <FloatingButton
            key={btn.id}
            {...btn}
            onExpire={removeFloatingBtn}
          />
        ))}
      </div>
    </div>
  );
}