"use client";

import { motion } from "framer-motion";
import { useChaosStore } from "@/store/chaosStore";
import { getScoreLabel } from "@/engine/chaosThresholds";

function getBarColor(score: number): string {
  if (score < 20) return "#06b6d4";   // cyan
  if (score < 40) return "#8b5cf6";   // violet
  if (score < 60) return "#f59e0b";   // amber
  if (score < 80) return "#ef4444";   // red
  return "#ffffff";                   // white — max panic
}

function getGlowColor(score: number): string {
  if (score < 20) return "rgba(6,182,212,0.4)";
  if (score < 40) return "rgba(139,92,246,0.4)";
  if (score < 60) return "rgba(245,158,11,0.4)";
  if (score < 80) return "rgba(239,68,68,0.4)";
  return "rgba(255,255,255,0.5)";
}

export default function ChaosProgressBar() {
  const { chaosScore, pressCount } = useChaosStore();
  const label = getScoreLabel(chaosScore);
  const barColor = getBarColor(chaosScore);
  const glowColor = getGlowColor(chaosScore);

  if (chaosScore === 0) return null;

  return (
    <motion.div
      className="fixed left-6 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Score number */}
      <motion.span
        className="text-[10px] font-mono font-bold tabular-nums"
        style={{ color: barColor }}
        key={chaosScore}
        initial={{ scale: 1.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {chaosScore}
      </motion.span>

      {/* Vertical bar track */}
      <div
        className="relative w-1 rounded-full overflow-hidden"
        style={{
          height: 160,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Fill */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 rounded-full"
          style={{
            background: barColor,
            boxShadow: `0 0 8px ${glowColor}`,
          }}
          animate={{ height: `${chaosScore}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />

        {/* Scan flicker on high chaos */}
        {chaosScore >= 60 && (
          <motion.div
            className="absolute left-0 right-0 h-px"
            style={{ background: barColor, opacity: 0.7 }}
            animate={{ bottom: ["0%", "100%", "0%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>

      {/* Label */}
      <div className="flex flex-col items-center gap-1">
        {[...label].map((char, i) => (
          <motion.span
            key={i}
            className="text-[7px] font-mono tracking-widest uppercase leading-none"
            style={{ color: barColor, opacity: 0.7 }}
            animate={
              chaosScore >= 80
                ? { opacity: [0.7, 0.2, 0.7] }
                : { opacity: 0.7 }
            }
            transition={{
              duration: 0.3 + i * 0.05,
              repeat: Infinity,
              delay: i * 0.04,
            }}
          >
            {char}
          </motion.span>
        ))}
      </div>

      {/* Press count micro */}
      <span className="text-[7px] font-mono text-white/15 mt-1">
        ×{pressCount}
      </span>
    </motion.div>
  );
}