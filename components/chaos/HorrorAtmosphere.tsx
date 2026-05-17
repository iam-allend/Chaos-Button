"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChaosEvents } from "@/hooks/useChaosEvents";
import { useChaosStore } from "@/store/chaosStore";
import { getChaosConfig } from "@/engine/chaosThresholds";
import type { ChaosEvent, HorrorPulsePayload } from "@/engine/chaosEvents";

export default function HorrorAtmosphere() {
  const [isPulsing, setIsPulsing] = useState(false);
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const chaosScore = useChaosStore((s) => s.chaosScore);
  const cfg = getChaosConfig(chaosScore);
  const horror = cfg.horrorAtmosphere;

  const handlePulse = useCallback((event: ChaosEvent) => {
    const { intensity } = event.payload as HorrorPulsePayload;
    setPulseIntensity(intensity);
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 800);
  }, []);

  useChaosEvents("HORROR_PULSE", handlePulse);

  if (horror <= 0.05) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-20" aria-hidden="true">
      {/* Persistent dark vignette — scales with horror level */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 70% at 50% 50%, transparent 30%, rgba(0,0,0,${(horror * 0.7).toFixed(2)}) 100%)`,
        }}
      />

      {/* Red tint — only at high horror */}
      {horror > 0.4 && (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(139,0,0,${(horror * 0.12).toFixed(2)}) 100%)`,
          }}
        />
      )}

      {/* Chromatic aberration border — high chaos */}
      {horror > 0.6 && (
        <>
          <div className="absolute inset-0"
            style={{
              background: "linear-gradient(to right, rgba(239,68,68,0.03), transparent 8%, transparent 92%, rgba(6,182,212,0.03))",
            }}
          />
          <div className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, rgba(239,68,68,0.02), transparent 8%, transparent 92%, rgba(139,92,246,0.02))",
            }}
          />
        </>
      )}

      {/* Pulse flash on HORROR_PULSE event */}
      <AnimatePresence>
        {isPulsing && (
          <motion.div
            key="horror-pulse"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, pulseIntensity * 0.4, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              background: `radial-gradient(ellipse 80% 80% at 50% 50%, rgba(139,0,0,0.15), transparent)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Flickering edge lines — max horror */}
      {horror > 0.8 && (
        <motion.div
          className="absolute inset-0 border"
          style={{ borderColor: "rgba(239,68,68,0.08)" }}
          animate={{ opacity: [0.3, 0.8, 0.1, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      )}
    </div>
  );
}