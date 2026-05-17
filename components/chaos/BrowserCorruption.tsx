"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChaosEvents } from "@/hooks/useChaosEvents";
import type { ChaosEvent, BrowserCorruptPayload } from "@/engine/chaosEvents";

interface CorruptState {
  addressBar: string | null;
  tabText: string | null;
  level: number;
}

const ORIGINAL_TITLE = "CHAOS BUTTON";

export default function BrowserCorruption() {
  const [state, setState] = useState<CorruptState>({
    addressBar: null,
    tabText: null,
    level: 0,
  });
  const [showBar, setShowBar] = useState(false);

  // Corrupt the actual document title
  useEffect(() => {
    if (state.tabText) {
      document.title = state.tabText;
    } else {
      document.title = ORIGINAL_TITLE;
    }
  }, [state.tabText]);

  const handleCorrupt = useCallback((event: ChaosEvent) => {
    const { level, element, value } = event.payload as BrowserCorruptPayload;

    setState((prev) => ({
      ...prev,
      level,
      addressBar: element === "addressbar" ? value : prev.addressBar,
      tabText: element === "tab" || element === "title" ? value : prev.tabText,
    }));

    if (element === "addressbar") {
      setShowBar(true);
      setTimeout(() => {
        setShowBar(false);
        setState((prev) => ({ ...prev, addressBar: null }));
      }, 3500);
    }
    if (element === "tab" || element === "title") {
      setTimeout(() => {
        setState((prev) => ({ ...prev, tabText: null }));
      }, 4000);
    }
  }, []);

  useChaosEvents("BROWSER_CORRUPT", handleCorrupt);

  return (
    <>
      {/* Fake address bar overlay */}
      <AnimatePresence>
        {showBar && state.addressBar && (
          <motion.div
            className="pointer-events-none fixed top-0 left-0 right-0 z-[60]"
            initial={{ y: -48 }}
            animate={{ y: 0 }}
            exit={{ y: -48 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
          >
            <div
              className="mx-auto max-w-2xl mt-2 rounded-md overflow-hidden"
              style={{
                background: "rgba(20,20,20,0.97)",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.8)",
              }}
            >
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-3 py-2"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {/* Traffic lights */}
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                {/* Address bar */}
                <div className="flex-1 flex items-center gap-2 px-3 py-1 rounded"
                  style={{ background: "rgba(255,255,255,0.06)" }}>
                  <motion.span
                    className="text-red-400/70 text-[9px]"
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  >⚠</motion.span>
                  <span className="text-[11px] font-mono text-white/50 truncate">
                    {state.addressBar}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level 3: fullscreen fake "browser not responding" overlay */}
      <AnimatePresence>
        {state.level >= 3 && state.tabText === "ERROR — Page Unresponsive" && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-[55]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.4)" }} />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 p-5 rounded"
              style={{
                background: "rgba(25,25,25,0.98)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 16px 64px rgba(0,0,0,0.9)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🛑</span>
                <span className="text-sm font-semibold text-white/90">Page Unresponsive</span>
              </div>
              <p className="text-xs text-white/50 mb-4">
                Chaos Button is not responding. You can wait for it to respond, or kill it.
              </p>
              <div className="flex gap-2 justify-end">
                <div className="px-3 py-1.5 text-xs text-white/40 border border-white/10 rounded cursor-not-allowed">
                  Wait
                </div>
                <div className="px-3 py-1.5 text-xs text-white/80 bg-blue-600/80 rounded">
                  Kill pages
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}