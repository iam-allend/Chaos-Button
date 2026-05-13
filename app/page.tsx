"use client";

import { motion } from "framer-motion";
import SceneWrapper from "@/components/layout/SceneWrapper";
import ChaosButton from "@/components/ui/ChaosButton";
import { useChaosStore } from "@/store/chaosStore";

export default function HomePage() {
  const { chaosLevel, pressCount } = useChaosStore();

  return (
    <SceneWrapper>
      {/* Top header */}
      <motion.header
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-6 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <span className="text-[10px] tracking-[0.5em] uppercase text-white/20 font-mono">
          experiment://001
        </span>
        <span className="text-[10px] tracking-[0.5em] uppercase text-white/20 font-mono">
          classified
        </span>
      </motion.header>

      {/* Center content */}
      <div className="flex flex-col items-center justify-center gap-16 px-4">
        {/* Eyebrow heading */}
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-px bg-white/10" />
            <span className="text-[9px] tracking-[0.6em] uppercase text-white/25 font-mono">
              interactive experience
            </span>
            <div className="w-8 h-px bg-white/10" />
          </div>

          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-center leading-none"
            style={{
              fontFamily: "'Syne', sans-serif",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.5) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            CHAOS
            <br />
            <span
              style={{
                background:
                  "linear-gradient(135deg, rgba(6,182,212,0.8) 0%, rgba(139,92,246,0.8) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              BUTTON
            </span>
          </h1>
        </motion.div>

        {/* The Button */}
        <ChaosButton />
      </div>

      {/* Bottom footer — live chaos data */}
      <motion.footer
        className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-8 py-6 z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        <span className="text-[9px] tracking-[0.4em] uppercase text-white/10 font-mono">
          chaos_level :: {chaosLevel} / 5
        </span>
        <span className="text-[9px] tracking-[0.4em] uppercase text-white/10 font-mono">
          press_count :: {pressCount}
        </span>
      </motion.footer>
    </SceneWrapper>
  );
}