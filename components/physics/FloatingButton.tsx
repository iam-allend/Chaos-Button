"use client";

import { useRef, useEffect, useState } from "react";
import { physicsEngine, createFloatingButtonBody } from "@/engine/physicsEngine";
import type Matter from "matter-js";

interface FloatingButtonProps {
  id: string;
  x: number;    // vw %
  y: number;    // vh %
  label: string;
  color: string;
  onExpire: (id: string) => void;
}

const RADIUS = 32;

export default function FloatingButton({
  id, x, y, label, color, onExpire,
}: FloatingButtonProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const bodyIdRef = useRef<number>(-1);
  const expiredRef = useRef(false);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    const px = (x / 100) * window.innerWidth;
    const py = (y / 100) * window.innerHeight;
    const MatterLib = require("matter-js") as typeof Matter;

    const body = createFloatingButtonBody(px, py, RADIUS);
    bodyIdRef.current = physicsEngine.addBody(body, "floatingButton", `fbtn_${id}`);

    // Toss upward with random horizontal
    MatterLib.Body.setVelocity(body, {
      x: (Math.random() - 0.5) * 10,
      y: -(4 + Math.random() * 6),
    });
    MatterLib.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.3);

    // Expire after 15 seconds
    const expireTimer = setTimeout(() => {
      if (!expiredRef.current) {
        expiredRef.current = true;
        physicsEngine.removeBody(bodyIdRef.current);
        onExpire(id);
      }
    }, 15000);

    return () => {
      clearTimeout(expireTimer);
      if (!expiredRef.current && bodyIdRef.current !== -1) {
        physicsEngine.removeBody(bodyIdRef.current);
      }
    };
  }, []); // eslint-disable-line

  // DOM sync
  useEffect(() => {
    let raf: number;
    const sync = () => {
      const el = elRef.current;
      if (!el || expiredRef.current) return;
      const body = physicsEngine.getBody(bodyIdRef.current);
      if (!body) return;

      if (body.position.y > window.innerHeight + 200) {
        if (!expiredRef.current) {
          expiredRef.current = true;
          physicsEngine.removeBody(bodyIdRef.current);
          onExpire(id);
          return;
        }
      }

      el.style.transform = `translate(${body.position.x - RADIUS}px, ${body.position.y - RADIUS}px) rotate(${body.angle}rad)`;
      raf = requestAnimationFrame(sync);
    };
    raf = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(raf);
  }, []); // eslint-disable-line

  const handleClick = () => {
    setIsClicked(true);
    // Blast upward on click
    const MatterLib = require("matter-js") as typeof Matter;
    const body = physicsEngine.getBody(bodyIdRef.current);
    if (body) {
      MatterLib.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 15,
        y: -(8 + Math.random() * 8),
      });
      MatterLib.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.5);
    }
    setTimeout(() => setIsClicked(false), 150);
  };

  return (
    <div
      ref={elRef}
      onClick={handleClick}
      className="absolute top-0 left-0 will-change-transform flex items-center justify-center rounded-full cursor-pointer select-none active:scale-95 transition-transform duration-75"
      style={{
        width: RADIUS * 2,
        height: RADIUS * 2,
        background: color,
        border: "1px solid rgba(255,255,255,0.2)",
        boxShadow: `0 4px 20px ${color.replace("0.85", "0.4")}`,
        backdropFilter: "blur(8px)",
        transformOrigin: "center center",
        zIndex: 34,
        transform: isClicked ? "scale(0.9)" : "scale(1)",
      }}
      aria-label={label}
    >
      <span className="text-[8px] font-mono font-bold text-white/90 text-center leading-tight px-1">
        {label}
      </span>
    </div>
  );
}