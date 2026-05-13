"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChaosEvents } from "@/hooks/useChaosEvents";
import type { ChaosEvent, GlitchFlashPayload } from "@/engine/chaosEvents";

interface GlitchInstance {
  id: string;
  color: string;
}

export default function GlitchFlash() {
  const [flashes, setFlashes] = useState<GlitchInstance[]>([]);

  const handleGlitch = useCallback((event: ChaosEvent) => {
    const { color, duration } = event.payload as GlitchFlashPayload;
    const id = event.id;

    setFlashes((prev) => [...prev, { id, color }]);
    setTimeout(() => {
      setFlashes((prev) => prev.filter((f) => f.id !== id));
    }, duration);
  }, []);

  useChaosEvents("GLITCH_FLASH", handleGlitch);

  return (
    <div className="pointer-events-none fixed inset-0 z-50" aria-hidden="true">
      <AnimatePresence>
        {flashes.map((flash) => (
          <motion.div
            key={flash.id}
            className="absolute inset-0"
            style={{ backgroundColor: flash.color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "linear" }}
          />
        ))}
      </AnimatePresence>

      {/* Chromatic aberration lines on any flash */}
      <AnimatePresence>
        {flashes.length > 0 && (
          <motion.div
            key="aberration"
            className="absolute inset-0 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.05 }}
          >
            {/* Red channel shift */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(transparent 49.8%, rgba(239,68,68,0.08) 50%, transparent 50.2%)",
                backgroundSize: "100% 4px",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}