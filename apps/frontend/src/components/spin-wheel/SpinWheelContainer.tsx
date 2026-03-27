"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { SpinWheelPortal } from "./SpinWheelPortal";
import { useSpinWheelStore } from "./spinWheel.store";
import { SPIN_COOKIE_KEY, SPIN_COOLDOWN_DAYS } from "./spinWheel.config";

export function SpinWheelContainer() {
  const { isOpen, setOpen } = useSpinWheelStore();
  const [eligible, setEligible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const last = Cookies.get(SPIN_COOKIE_KEY);
    if (!last) {
      const timer = setTimeout(() => {
        setEligible(true);
        setOpen(true);
        Cookies.set(SPIN_COOKIE_KEY, String(Date.now()), { expires: SPIN_COOLDOWN_DAYS });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [setOpen]);

  if (!mounted) return null;

  return (
    <>
      {eligible && !isOpen && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-6 z-[9998] flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-xl transition-transform hover:scale-110 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #1a6b5a, #0e4d3c)",
            border: "2px solid rgba(255,215,0,0.6)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4), 0 0 12px rgba(255,215,0,0.3)",
          }}
          aria-label="Open Spin & Win"
        >
          <span className="text-xl">🎡</span>
          <span className="text-[8px] font-bold text-[#FFD700] leading-none mt-0.5">WIN</span>
        </button>
      )}
      <SpinWheelPortal />
    </>
  );
}
