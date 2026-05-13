"use client";

import { useState, useCallback, useRef } from "react";
import { useChaosEvents } from "@/hooks/useChaosEvents";
import type { ChaosEvent, BgDistortionPayload } from "@/engine/chaosEvents";

export default function BackgroundDistortion() {
  const [isActive, setIsActive] = useState(false);
  const [turbulence, setTurbulence] = useState(0.015);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDistortion = useCallback((event: ChaosEvent) => {
    const { intensity, duration } = event.payload as BgDistortionPayload;

    setIsActive(true);
    setTurbulence(0.01 + intensity * 0.008);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsActive(false);
      setTurbulence(0.015);
    }, duration);
  }, []);

  useChaosEvents("BG_DISTORTION", handleDistortion);

  if (!isActive) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-10"
      style={{ filter: "url(#chaos-distort)" }}
      aria-hidden="true"
    >
      <svg
        className="absolute w-0 h-0"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <filter id="chaos-distort" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="turbulence"
              baseFrequency={turbulence}
              numOctaves={3}
              seed={Math.floor(Math.random() * 100)}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={20}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Subtle scanline overlay during distortion */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
        }}
      />
    </div>
  );
}