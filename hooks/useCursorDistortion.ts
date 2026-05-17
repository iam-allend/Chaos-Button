"use client";

import { useEffect, useState, useRef } from "react";
import { useChaosEvents } from "./useChaosEvents";
import type { ChaosEvent, CursorDistortPayload } from "@/engine/chaosEvents";

export interface CursorState {
  x: number;
  y: number;
  distortLevel: number; // 0–3
}

export function useCursorDistortion() {
  const [cursor, setCursor] = useState<CursorState>({ x: 0, y: 0, distortLevel: 0 });
  const posRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      setCursor((prev) => ({ ...prev, x: e.clientX, y: e.clientY }));
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useChaosEvents("CURSOR_DISTORT", (event: ChaosEvent) => {
    const { level } = event.payload as CursorDistortPayload;
    setCursor((prev) => ({ ...prev, distortLevel: level }));
  });

  return cursor;
}