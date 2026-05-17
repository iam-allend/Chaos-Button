"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChaosEvents } from "@/hooks/useChaosEvents";
import type { ChaosEvent, SystemVoicePayload } from "@/engine/chaosEvents";

interface SubtitleLine {
  id: string;
  text: string;
}

function speakText(text: string, pitch: number, rate: number): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.pitch = pitch;
    utt.rate = rate;
    utt.volume = 0.7;

    // Prefer a robotic/neutral voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) =>
        v.name.toLowerCase().includes("daniel") ||
        v.name.toLowerCase().includes("google uk") ||
        v.name.toLowerCase().includes("karen") ||
        v.name.toLowerCase().includes("alex")
    );
    if (preferred) utt.voice = preferred;
    window.speechSynthesis.speak(utt);
  } catch {
    // Speech synthesis may be blocked — fail silently
  }
}

export default function VoiceSubtitle() {
  const [lines, setLines] = useState<SubtitleLine[]>([]);

  const handleVoice = useCallback((event: ChaosEvent) => {
    const { text, pitch, rate } = event.payload as SystemVoicePayload;
    const id = event.id;

    // Speak it
    speakText(text, pitch, rate);

    // Show subtitle
    setLines((prev) => {
      const trimmed = prev.length >= 2 ? prev.slice(1) : prev;
      return [...trimmed, { id, text }];
    });

    const duration = (text.length / (rate * 4)) * 1000 + 1200;
    setTimeout(() => {
      setLines((prev) => prev.filter((l) => l.id !== id));
    }, duration);
  }, []);

  useChaosEvents("SYSTEM_VOICE", handleVoice);

  return (
    <div
      className="pointer-events-none fixed bottom-20 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2"
      aria-live="polite"
    >
      <AnimatePresence>
        {lines.map((line) => (
          <motion.div
            key={line.id}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative px-4 py-2 max-w-sm text-center">
              {/* Subtle backdrop */}
              <div
                className="absolute inset-0"
                style={{
                  background: "rgba(0,0,0,0.5)",
                  backdropFilter: "blur(8px)",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              />
              {/* Speaker label */}
              <div className="relative flex items-center justify-center gap-2 mb-1">
                <motion.div
                  className="w-1 h-1 rounded-full bg-cyan-400"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
                <span className="text-[8px] tracking-[0.4em] uppercase text-cyan-400/50 font-mono">
                  system voice
                </span>
                <motion.div
                  className="w-1 h-1 rounded-full bg-cyan-400"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              </div>
              {/* Subtitle text */}
              <p className="relative text-sm text-white/80 font-mono leading-snug">
                {line.text}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}