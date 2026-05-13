"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useChaosStore } from "@/store/chaosStore";
import { useButtonEscape } from "@/hooks/useButtonEscape";

export default function ChaosButton() {
  const { incrementChaos, pressCount } = useChaosStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const escapeControls = useButtonEscape();

  // Mouse tracking for tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-100, 100], [8, -8]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-100, 100], [-8, 8]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  const handleClick = () => {
    setIsPressed(true);
    incrementChaos();
    setTimeout(() => setIsPressed(false), 300);
  };

  return (
    <div className="flex flex-col items-center gap-8" style={{ perspective: "800px" }}>
      {/* Warning label above */}
      <motion.p
        className="text-xs tracking-[0.4em] uppercase text-white/20 font-mono"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.8 }}
      >
        {pressCount === 0
          ? "[ classified — level 0 clearance ]"
          : `[ warning — level ${pressCount} breach detected ]`}
      </motion.p>

      {/* Escape movement wrapper */}
      <motion.div animate={escapeControls}>
        {/* 3D tilt wrapper */}
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          animate={isPressed ? { scale: 0.94 } : { scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <motion.button
            className="relative group cursor-pointer select-none outline-none"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            aria-label="Do not press this button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Outer glow ring — animated */}
            <motion.div
              className="absolute -inset-6 rounded-full"
              animate={
                isHovered
                  ? {
                      boxShadow: [
                        "0 0 40px 0px rgba(6,182,212,0.0)",
                        "0 0 80px 20px rgba(6,182,212,0.15)",
                        "0 0 40px 0px rgba(6,182,212,0.0)",
                      ],
                    }
                  : { boxShadow: "0 0 0px 0px rgba(6,182,212,0)" }
              }
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Pulsing orbit ring */}
            <motion.div
              className="absolute -inset-3 rounded-full border border-white/5"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400/60" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-0.5 rounded-full bg-violet-400/60" />
            </motion.div>

            {/* Second orbit ring — counter rotate */}
            <motion.div
              className="absolute -inset-8 rounded-full border border-white/[0.03]"
              animate={{ rotate: -360 }}
              transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-0.5 rounded-full bg-white/30" />
            </motion.div>

            {/* Main button face */}
            <div className="relative w-52 h-52 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-full flex items-center justify-center">
              {/* Glass base */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-sm border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" />

              {/* Hover state fill */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-950/40 to-violet-950/40"
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.4 }}
              />

              {/* Inner glow on hover */}
              <motion.div
                className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-500/5 to-violet-500/5 blur-md"
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.4 }}
              />

              {/* Pressed state flash */}
              <motion.div
                className="absolute inset-0 rounded-full bg-white/10"
                animate={{ opacity: isPressed ? 1 : 0 }}
                transition={{ duration: 0.1 }}
              />

              {/* Button text */}
              <div className="relative z-10 flex flex-col items-center gap-1 text-center px-6">
                <motion.span
                  className="block text-[10px] md:text-xs tracking-[0.5em] uppercase font-mono text-white/30 mb-1"
                  animate={{ opacity: isHovered ? 0.6 : 0.3 }}
                  transition={{ duration: 0.3 }}
                >
                  do not
                </motion.span>
                <motion.span
                  className="block text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-none text-white"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                  animate={{
                    textShadow: isHovered
                      ? "0 0 40px rgba(6,182,212,0.4)"
                      : "0 0 0px rgba(0,0,0,0)",
                  }}
                  transition={{ duration: 0.4 }}
                >
                  PRESS
                </motion.span>
              </div>

              {/* Shimmer sweep on hover */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12"
                  initial={{ x: "-150%" }}
                  animate={isHovered ? { x: "150%" } : { x: "-150%" }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                />
              </div>
            </div>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Subtle hint below */}
      <motion.p
        className="text-[10px] tracking-[0.3em] uppercase text-white/10 font-mono"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
      >
        {pressCount === 0
          ? "you have been warned"
          : `×${pressCount} — there is no going back`}
      </motion.p>
    </div>
  );
}

export default function ChaosButton() {
  const { incrementChaos, pressCount } = useChaosStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Mouse tracking for tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-100, 100], [8, -8]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-100, 100], [-8, 8]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  const handleClick = () => {
    setIsPressed(true);
    incrementChaos();
    setTimeout(() => setIsPressed(false), 300);
  };

  return (
    <div className="flex flex-col items-center gap-8" style={{ perspective: "800px" }}>
      {/* Warning label above */}
      <motion.p
        className="text-xs tracking-[0.4em] uppercase text-white/20 font-mono"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.8 }}
      >
        {pressCount === 0 ? "[ classified — level 0 clearance ]" : `[ warning — level ${pressCount} breach detected ]`}
      </motion.p>

      {/* Button container with 3D tilt */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        animate={isPressed ? { scale: 0.94 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <motion.button
          className="relative group cursor-pointer select-none outline-none"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          aria-label="Do not press this button"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Outer glow ring — animated */}
          <motion.div
            className="absolute -inset-6 rounded-full"
            animate={
              isHovered
                ? {
                    boxShadow: [
                      "0 0 40px 0px rgba(6,182,212,0.0)",
                      "0 0 80px 20px rgba(6,182,212,0.15)",
                      "0 0 40px 0px rgba(6,182,212,0.0)",
                    ],
                  }
                : { boxShadow: "0 0 0px 0px rgba(6,182,212,0)" }
            }
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Pulsing orbit ring */}
          <motion.div
            className="absolute -inset-3 rounded-full border border-white/5"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400/60" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-0.5 rounded-full bg-violet-400/60" />
          </motion.div>

          {/* Second orbit ring — counter rotate */}
          <motion.div
            className="absolute -inset-8 rounded-full border border-white/[0.03]"
            animate={{ rotate: -360 }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-0.5 rounded-full bg-white/30" />
          </motion.div>

          {/* Main button face */}
          <div className="relative w-52 h-52 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-full flex items-center justify-center">
            {/* Glass base */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-sm border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" />

            {/* Hover state fill */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-950/40 to-violet-950/40"
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.4 }}
            />

            {/* Inner glow on hover */}
            <motion.div
              className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-500/5 to-violet-500/5 blur-md"
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.4 }}
            />

            {/* Pressed state flash */}
            <motion.div
              className="absolute inset-0 rounded-full bg-white/10"
              animate={{ opacity: isPressed ? 1 : 0 }}
              transition={{ duration: 0.1 }}
            />

            {/* Button text */}
            <div className="relative z-10 flex flex-col items-center gap-1 text-center px-6">
              <motion.span
                className="block text-[10px] md:text-xs tracking-[0.5em] uppercase font-mono text-white/30 mb-1"
                animate={{ opacity: isHovered ? 0.6 : 0.3 }}
                transition={{ duration: 0.3 }}
              >
                do not
              </motion.span>
              <motion.span
                className="block text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-none text-white"
                style={{
                  fontFamily: "'Syne', sans-serif",
                  textShadow: isHovered
                    ? "0 0 40px rgba(6,182,212,0.4)"
                    : "0 0 0px transparent",
                }}
                animate={{
                  textShadow: isHovered
                    ? "0 0 40px rgba(6,182,212,0.4)"
                    : "0 0 0px rgba(0,0,0,0)",
                }}
                transition={{ duration: 0.4 }}
              >
                PRESS
              </motion.span>
            </div>

            {/* Shimmer sweep on hover */}
            <motion.div
              className="absolute inset-0 rounded-full overflow-hidden"
              initial={false}
            >
              <motion.div
                className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12"
                initial={{ x: "-150%" }}
                animate={isHovered ? { x: "150%" } : { x: "-150%" }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
        </motion.button>
      </motion.div>

      {/* Subtle hint below */}
      <motion.p
        className="text-[10px] tracking-[0.3em] uppercase text-white/10 font-mono"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
      >
        {pressCount === 0 ? "you have been warned" : `×${pressCount} — there is no going back`}
      </motion.p>
    </div>
  );
}