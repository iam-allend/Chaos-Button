"use client";

import { useRef, useEffect, useState } from "react";
import { physicsEngine, createPanelBody } from "@/engine/physicsEngine";
import {
  PANEL_CONTENTS,
  type PanelVariant,
} from "@/engine/chaosEvents";
import type Matter from "matter-js";

interface BouncingPanelProps {
  id: string;
  x: number;          // vw %
  y: number;          // vh %
  variant: PanelVariant;
  onClose: (id: string) => void;
}

const PANEL_W = 260;
const PANEL_H = 140;

const PANEL_COLORS: Record<PanelVariant, string> = {
  error_dialog: "rgba(239,68,68,0.12)",
  terminal: "rgba(0,255,0,0.06)",
  task_manager: "rgba(6,182,212,0.08)",
  not_found: "rgba(245,158,11,0.08)",
  fake_console: "rgba(139,92,246,0.08)",
};

const PANEL_BORDER: Record<PanelVariant, string> = {
  error_dialog: "rgba(239,68,68,0.3)",
  terminal: "rgba(0,255,0,0.25)",
  task_manager: "rgba(6,182,212,0.25)",
  not_found: "rgba(245,158,11,0.25)",
  fake_console: "rgba(139,92,246,0.25)",
};

export default function BouncingPanel({
  id, x, y, variant, onClose,
}: BouncingPanelProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const bodyIdRef = useRef<number>(-1);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const bodyRef = useRef<ReturnType<typeof physicsEngine.getBody>>(null);
  const [isClosed, setIsClosed] = useState(false);

  const content = PANEL_CONTENTS[variant];

  useEffect(() => {
    const px = (x / 100) * window.innerWidth;
    const py = (y / 100) * window.innerHeight;
    const MatterLib = require("matter-js") as typeof Matter;

    const body = createPanelBody(px, py, PANEL_W, PANEL_H);
    bodyIdRef.current = physicsEngine.addBody(body, "panel", `panel_${id}`);
    bodyRef.current = body;

    // Give a random initial spin + toss
    MatterLib.Body.setVelocity(body, {
      x: (Math.random() - 0.5) * 6,
      y: -(2 + Math.random() * 4),
    });
    MatterLib.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.15);

    return () => {
      if (bodyIdRef.current !== -1) physicsEngine.removeBody(bodyIdRef.current);
    };
  }, []); // eslint-disable-line

  // DOM sync RAF
  useEffect(() => {
    let raf: number;
    const sync = () => {
      const el = elRef.current;
      if (!el || isClosed) return;
      const body = physicsEngine.getBody(bodyIdRef.current);
      if (!body) return;

      if (!isDraggingRef.current) {
        el.style.transform = `translate(${body.position.x - PANEL_W / 2}px, ${body.position.y - PANEL_H / 2}px) rotate(${body.angle}rad)`;
      }
      raf = requestAnimationFrame(sync);
    };
    raf = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(raf);
  }, [isClosed]);

  // Manual drag (bypasses Matter.js mouse constraint for DOM elements)
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = elRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    isDraggingRef.current = true;

    // Make body static while dragging
    const MatterLib = require("matter-js") as typeof Matter;
    const body = physicsEngine.getBody(bodyIdRef.current);
    if (body) MatterLib.Body.setStatic(body, true);

    const onMove = (ev: MouseEvent) => {
      const body = physicsEngine.getBody(bodyIdRef.current);
      if (!body || !el) return;
      const nx = ev.clientX - dragOffsetRef.current.x + PANEL_W / 2;
      const ny = ev.clientY - dragOffsetRef.current.y + PANEL_H / 2;
      const MatterLib = require("matter-js") as typeof Matter;
      MatterLib.Body.setPosition(body, { x: nx, y: ny });
      el.style.transform = `translate(${nx - PANEL_W / 2}px, ${ny - PANEL_H / 2}px) rotate(0rad)`;
    };

    const onUp = (ev: MouseEvent) => {
      isDraggingRef.current = false;
      const body = physicsEngine.getBody(bodyIdRef.current);
      if (body) {
        const MatterLib = require("matter-js") as typeof Matter;
        MatterLib.Body.setStatic(body, false);
        // Throw velocity from drag release
        MatterLib.Body.setVelocity(body, {
          x: (ev.movementX || 0) * 0.5,
          y: (ev.movementY || 0) * 0.5,
        });
      }
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const handleClose = () => {
    setIsClosed(true);
    physicsEngine.removeBody(bodyIdRef.current);
    onClose(id);
  };

  if (isClosed) return null;

  return (
    <div
      ref={elRef}
      className="absolute top-0 left-0 will-change-transform select-none"
      style={{
        width: PANEL_W,
        height: PANEL_H,
        transformOrigin: "center center",
        background: PANEL_COLORS[variant],
        border: `1px solid ${PANEL_BORDER[variant]}`,
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        zIndex: 35,
        cursor: "grab",
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-3 py-1.5"
        style={{
          borderBottom: `1px solid ${PANEL_BORDER[variant]}`,
          background: "rgba(0,0,0,0.3)",
        }}
      >
        <div className="flex gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full bg-red-500/80 cursor-pointer hover:bg-red-400"
            onClick={handleClose}
          />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
        </div>
        <span className="text-[9px] font-mono text-white/40 tracking-wider">
          {content.title}
        </span>
        <div className="w-8" />
      </div>

      {/* Body */}
      <div className="p-3 space-y-1 overflow-hidden" style={{ height: PANEL_H - 32 }}>
        {content.body.map((line, i) => (
          <p
            key={i}
            className="text-[10px] font-mono text-white/60 leading-relaxed truncate"
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}