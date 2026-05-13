"use client";

import { motion } from "framer-motion";

export default function AmbientGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Perspective grid floor */}
      <div className="grid-perspective" aria-hidden="true" />

      {/* Radial vignette overlay */}
      <div className="absolute inset-0 bg-radial-vignette" />

      {/* Horizontal scan line */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"
        initial={{ top: "-2%" }}
        animate={{ top: "102%" }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 2,
        }}
      />

      {/* Corner accent lines — top left */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l border-t border-white/10" />
      {/* Corner accent lines — top right */}
      <div className="absolute top-8 right-8 w-16 h-16 border-r border-t border-white/10" />
      {/* Corner accent lines — bottom left */}
      <div className="absolute bottom-8 left-8 w-16 h-16 border-l border-b border-white/10" />
      {/* Corner accent lines — bottom right */}
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r border-b border-white/10" />

      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 noise-overlay opacity-[0.035]" />
    </div>
  );
}