"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChaosEvents } from "@/hooks/useChaosEvents";
import type { ChaosEvent, WarningMessagePayload } from "@/engine/chaosEvents";

interface WarningInstance {
  id: string;
  message: string;
  position: "top" | "bottom" | "center";
}

const POSITION_CLASSES = {
  top: "top-16 left-1/2 -translate-x-1/2",
  bottom: "bottom-16 left-1/2 -translate-x-1/2",
  center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
};

const POSITION_VARIANTS = {
  top: {
    initial: { opacity: 0, y: -12, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -8, scale: 0.97 },
  },
  bottom: {
    initial: { opacity: 0, y: 12, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 8, scale: 0.97 },
  },
  center: {
    initial: { opacity: 0, scale: 0.94 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
  },
};

export default function WarningOverlay() {
  const [warnings, setWarnings] = useState<WarningInstance[]>([]);

  const handleWarning = useCallback((event: ChaosEvent) => {
    const { message, position, duration } = event.payload as WarningMessagePayload;
    const id = event.id;

    setWarnings((prev) => {
      // Max 2 concurrent warnings
      const trimmed = prev.length >= 2 ? prev.slice(1) : prev;
      return [...trimmed, { id, message, position }];
    });

    setTimeout(() => {
      setWarnings((prev) => prev.filter((w) => w.id !== id));
    }, duration);
  }, []);

  useChaosEvents("WARNING_MESSAGE", handleWarning);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40"
      aria-hidden="true"
    >
      <AnimatePresence>
        {warnings.map((warning) => {
          const v = POSITION_VARIANTS[warning.position];
          return (
            <motion.div
              key={warning.id}
              className={`absolute ${POSITION_CLASSES[warning.position]} w-max max-w-[90vw]`}
              initial={v.initial}
              animate={v.animate}
              exit={v.exit}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Warning card */}
              <div className="relative px-5 py-3 border border-red-500/20 bg-black/60 backdrop-blur-md">
                {/* Corner ticks */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-500/50" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-red-500/50" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-red-500/50" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-red-500/50" />

                <div className="flex items-center gap-3">
                  {/* Blinking indicator */}
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                  <span
                    className="text-[10px] tracking-[0.3em] uppercase text-red-400/80 font-mono whitespace-nowrap"
                  >
                    {warning.message}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}