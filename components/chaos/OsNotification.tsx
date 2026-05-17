"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChaosEvents } from "@/hooks/useChaosEvents";
import type { ChaosEvent, OsNotificationPayload, OsType } from "@/engine/chaosEvents";

interface NotifInstance extends OsNotificationPayload {}

// ─── macOS style ──────────────────────────────────────────────────
function MacNotif({ notif, onDone }: { notif: NotifInstance; onDone: () => void }) {
  return (
    <motion.div
      className="w-80 rounded-xl overflow-hidden"
      style={{
        background: "rgba(30,30,30,0.85)",
        backdropFilter: "blur(20px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      }}
      initial={{ x: 340, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 340, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onClick={onDone}
    >
      <div className="flex items-start gap-3 p-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.08)" }}>
          {notif.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider truncate">
              {notif.title}
            </span>
            <span className="text-[9px] text-white/30 font-mono ml-2 flex-shrink-0">now</span>
          </div>
          <p className="text-xs text-white/80 leading-snug">{notif.body}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Windows style ────────────────────────────────────────────────
function WinNotif({ notif, onDone }: { notif: NotifInstance; onDone: () => void }) {
  return (
    <motion.div
      className="w-80"
      style={{
        background: "rgba(32,32,32,0.96)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.8)",
      }}
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: "spring", stiffness: 350, damping: 32 }}
      onClick={onDone}
    >
      <div className="flex items-center gap-2 px-3 py-1.5"
        style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="text-[9px] text-white/40 font-mono uppercase tracking-widest">
          Windows Security
        </span>
        <div className="ml-auto text-white/20 text-xs cursor-pointer hover:text-white/60" onClick={onDone}>✕</div>
      </div>
      <div className="flex items-start gap-3 p-3">
        <div className="text-2xl flex-shrink-0">{notif.icon}</div>
        <div>
          <p className="text-xs font-semibold text-white/90 mb-0.5">{notif.title}</p>
          <p className="text-[11px] text-white/60 leading-snug">{notif.body}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Linux / terminal style ───────────────────────────────────────
function LinuxNotif({ notif, onDone }: { notif: NotifInstance; onDone: () => void }) {
  return (
    <motion.div
      className="w-80 font-mono"
      style={{
        background: "rgba(10,10,10,0.97)",
        border: "1px solid rgba(239,68,68,0.4)",
        boxShadow: "0 0 20px rgba(239,68,68,0.1)",
      }}
      initial={{ x: 340, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 340, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={onDone}
    >
      <div className="flex items-center gap-2 px-3 py-1"
        style={{ borderBottom: "1px solid rgba(239,68,68,0.2)" }}>
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[9px] text-red-400/70 tracking-widest uppercase">
          kernel panic
        </span>
      </div>
      <div className="p-3 space-y-1">
        <p className="text-[10px] text-red-400">{notif.icon} {notif.title}</p>
        <p className="text-[10px] text-white/50">{notif.body}</p>
        <p className="text-[9px] text-white/20">pid: {Math.floor(Math.random() * 9999)}</p>
      </div>
    </motion.div>
  );
}

const OS_COMPONENT: Record<OsType, typeof MacNotif> = {
  macos: MacNotif,
  windows: WinNotif,
  linux: LinuxNotif,
};

const OS_POSITION: Record<OsType, string> = {
  macos: "top-4 right-4",
  windows: "bottom-4 right-4",
  linux: "top-4 right-4",
};

export default function OsNotification() {
  const [notifications, setNotifications] = useState<NotifInstance[]>([]);

  const handleNotif = useCallback((event: ChaosEvent) => {
    const notif = event.payload as OsNotificationPayload;
    setNotifications((prev) => {
      const trimmed = prev.length >= 3 ? prev.slice(1) : prev;
      return [...trimmed, notif];
    });
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    }, notif.duration);
  }, []);

  useChaosEvents("OS_NOTIFICATION", handleNotif);

  // Group by OS position
  const byPosition = notifications.reduce<Record<string, NotifInstance[]>>((acc, n) => {
    const pos = OS_POSITION[n.osType];
    if (!acc[pos]) acc[pos] = [];
    acc[pos].push(n);
    return acc;
  }, {});

  return (
    <>
      {Object.entries(byPosition).map(([pos, notifs]) => (
        <div key={pos} className={`pointer-events-auto fixed ${pos} z-50 flex flex-col gap-2`}>
          <AnimatePresence>
            {notifs.map((notif) => {
              const Comp = OS_COMPONENT[notif.osType];
              return (
                <Comp
                  key={notif.id}
                  notif={notif}
                  onDone={() =>
                    setNotifications((prev) => prev.filter((n) => n.id !== notif.id))
                  }
                />
              );
            })}
          </AnimatePresence>
        </div>
      ))}
    </>
  );
}