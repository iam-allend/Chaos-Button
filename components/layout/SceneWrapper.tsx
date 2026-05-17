"use client";

import { motion } from "framer-motion";
import AmbientGrid from "@/components/background/AmbientGrid";
import ParticleField from "@/components/background/ParticleField";
import GlitchFlash from "@/components/chaos/GlitchFlash";
import WarningOverlay from "@/components/chaos/WarningOverlay";
import FloatingMessages from "@/components/chaos/FloatingMessages";
import BackgroundDistortion from "@/components/chaos/BackgroundDistortion";
import OsNotification from "@/components/chaos/OsNotification";
import VoiceSubtitle from "@/components/chaos/VoiceSubtitle";
import BrowserCorruption from "@/components/chaos/BrowserCorruption";
import CursorDistortion from "@/components/chaos/CursorDistortion";
import HorrorAtmosphere from "@/components/chaos/HorrorAtmosphere";
import ChaosProgressBar from "@/components/chaos/ChaosProgressBar";
import PhysicsLayer from "@/components/physics/PhysicsLayer";
import { useScreenShake } from "@/hooks/useScreenShake";

interface SceneWrapperProps {
  readonly children: React.ReactNode;
}

export default function SceneWrapper({ children }: SceneWrapperProps) {
  const shakeControls = useScreenShake();

  return (
    <>
      {/* ── Global overlays (outside shake) ── */}
      <GlitchFlash />
      <WarningOverlay />
      <FloatingMessages />
      <OsNotification />
      <VoiceSubtitle />
      <BrowserCorruption />
      <CursorDistortion />
      <HorrorAtmosphere />
      <ChaosProgressBar />
      <PhysicsLayer />

      {/* ── Shakeable scene ── */}
      <motion.div
        className="relative min-h-screen w-full overflow-hidden bg-[#020408] flex flex-col items-center justify-center"
        animate={shakeControls}
        style={{ opacity: 1 }}
      >
        {/* Intro fade */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        {/* Deep background */}
        <div className="absolute inset-0 bg-gradient-radial from-[#0a0f1e] via-[#020408] to-black" />

        {/* Ambient glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-900/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-cyan-900/10 blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-950/20 blur-[140px] pointer-events-none" />

        {/* Phase 2 background effects */}
        <BackgroundDistortion />
        <ParticleField />
        <AmbientGrid />

        {/* Page content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
          {children}
        </div>
      </motion.div>
    </>
  );
}