"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChaosEvents } from "@/hooks/useChaosEvents";
import { getLevelConfig } from "@/engine/chaosThresholds";
import { useChaosStore } from "@/store/chaosStore";
import type { ChaosEvent, FloatingMessagePayload } from "@/engine/chaosEvents";

interface FloatingItem {
  id: string;
  message: string;
  x: number;   // vw %
  y: number;   // vh %
  color: string;
  driftX: number;
  driftY: number;
}

export default function FloatingMessages() {
  const [messages, setMessages] = useState<FloatingItem[]>([]);
  const chaosLevel = useChaosStore((s) => s.chaosLevel);

  const handleFloat = useCallback(
    (event: ChaosEvent) => {
      const cfg = getLevelConfig(chaosLevel);
      const { id, message, x, y, color } =
        event.payload as FloatingMessagePayload;

      setMessages((prev) => {
        if (prev.length >= cfg.maxFloatingMessages) {
          // Remove oldest
          return [
            ...prev.slice(1),
            {
              id,
              message,
              x,
              y,
              color,
              driftX: (Math.random() - 0.5) * 40,
              driftY: -20 - Math.random() * 30,
            },
          ];
        }
        return [
          ...prev,
          {
            id,
            message,
            x,
            y,
            color,
            driftX: (Math.random() - 0.5) * 40,
            driftY: -20 - Math.random() * 30,
          },
        ];
      });

      const lifetime = 2000 + Math.random() * 1500;
      setTimeout(() => {
        setMessages((prev) => prev.filter((m) => m.id !== id));
      }, lifetime);
    },
    [chaosLevel]
  );

  useChaosEvents("FLOATING_MESSAGE", handleFloat);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
      aria-hidden="true"
    >
      <AnimatePresence>
        {messages.map((msg) => (
          <motion.span
            key={msg.id}
            className="absolute text-[11px] font-mono tracking-widest uppercase whitespace-nowrap"
            style={{
              left: `${msg.x}%`,
              top: `${msg.y}%`,
              color: msg.color,
            }}
            initial={{ opacity: 0, y: 0, x: 0, scale: 0.8 }}
            animate={{
              opacity: [0, 0.9, 0.7, 0],
              y: msg.driftY,
              x: msg.driftX,
              scale: [0.8, 1, 1, 0.9],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.2, ease: "easeOut" }}
          >
            {msg.message}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}