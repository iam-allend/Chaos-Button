"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCursorDistortion } from "@/hooks/useCursorDistortion";

export default function CursorDistortion() {
  const { x, y, distortLevel } = useCursorDistortion();
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Trail effect — only when distortLevel >= 2
  useEffect(() => {
    if (distortLevel < 2) { setTrail([]); return; }
    const id = Date.now();
    setTrail((prev) => [...prev.slice(-6), { x, y, id }]);
    const t = setTimeout(() => {
      setTrail((prev) => prev.filter((p) => p.id !== id));
    }, 300);
    return () => clearTimeout(t);
  }, [x, y, distortLevel]);

  if (!mounted || distortLevel === 0) return null;

  const size = distortLevel === 1 ? 12 : distortLevel === 2 ? 16 : 22;
  const offset = -size / 2;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999]"
      aria-hidden="true"
    >
      {/* Cursor trails */}
      <AnimatePresence>
        {trail.map((point, i) => (
          <motion.div
            key={point.id}
            className="absolute rounded-full"
            style={{
              left: point.x + offset,
              top: point.y + offset,
              width: size * (0.3 + i * 0.1),
              height: size * (0.3 + i * 0.1),
              background:
                i % 2 === 0
                  ? "rgba(6,182,212,0.25)"
                  : "rgba(139,92,246,0.25)",
              filter: `blur(${2 + i}px)`,
            }}
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{ opacity: 0, scale: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </AnimatePresence>

      {/* Main cursor */}
      <motion.div
        className="absolute"
        style={{ left: x + offset, top: y + offset }}
        animate={
          distortLevel >= 3
            ? {
                x: [0, Math.random() * 6 - 3, 0],
                y: [0, Math.random() * 6 - 3, 0],
              }
            : {}
        }
        transition={{ duration: 0.1, repeat: Infinity }}
      >
        {/* Outer ring */}
        <motion.div
          className="rounded-full border"
          style={{
            width: size,
            height: size,
            borderColor:
              distortLevel >= 3
                ? "rgba(239,68,68,0.8)"
                : distortLevel === 2
                ? "rgba(139,92,246,0.7)"
                : "rgba(6,182,212,0.6)",
          }}
          animate={
            distortLevel >= 2
              ? { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }
              : { scale: 1 }
          }
          transition={{ duration: 0.8, repeat: Infinity }}
        />
        {/* Inner dot */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 3,
            height: 3,
            background:
              distortLevel >= 3 ? "#ef4444" : distortLevel === 2 ? "#8b5cf6" : "#06b6d4",
            boxShadow: `0 0 6px ${
              distortLevel >= 3 ? "#ef4444" : distortLevel === 2 ? "#8b5cf6" : "#06b6d4"
            }`,
          }}
        />
        {/* Chromatic split on level 3 */}
        {distortLevel >= 3 && (
          <>
            <div
              className="absolute top-1/2 left-1/2 rounded-full"
              style={{
                width: 3, height: 3,
                transform: "translate(calc(-50% - 3px), -50%)",
                background: "rgba(239,68,68,0.5)",
              }}
            />
            <div
              className="absolute top-1/2 left-1/2 rounded-full"
              style={{
                width: 3, height: 3,
                transform: "translate(calc(-50% + 3px), -50%)",
                background: "rgba(6,182,212,0.5)",
              }}
            />
          </>
        )}
      </motion.div>
    </div>
  );
}