"use client";

import { SpinWheelCanvas } from "./SpinWheelCanvas";
import { SpinWheelForm } from "./SpinWheelForm";
import { SpinWheelResult } from "./SpinWheelResult";
import { useSpinWheelStore } from "./spinWheel.store";

export function SpinWheelModal() {
  const { phase, setOpen, reset } = useSpinWheelStore();

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => reset(), 300);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative z-10 w-full max-w-[720px] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-white/20 text-white hover:bg-white/30 flex items-center justify-center text-xs font-bold transition-colors"
        >
          X
        </button>

        {/* Left — wheel panel with gradient bg */}
        <div
          className="flex flex-col items-center justify-center p-6 md:p-8 flex-shrink-0"
          style={{
            background: "linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "#FFD700" }}
          >
            🎡 Try Your Luck
          </p>
          <div className="relative">
            <div
              className="absolute -inset-3 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(255,215,0,0.12) 0%, transparent 70%)",
              }}
            />
            <SpinWheelCanvas />
            <div
              className="absolute top-1/2 -right-5 -translate-y-1/2"
              style={{
                width: 0,
                height: 0,
                borderTop: "13px solid transparent",
                borderBottom: "13px solid transparent",
                borderRight: "28px solid #e74c3c",
                filter: "drop-shadow(0 0 4px rgba(231,76,60,0.7))",
              }}
            />
          </div>
          <p className="text-white/40 text-[10px] mt-5 text-center">
            Spin once per week · Results are instant
          </p>
        </div>

        {/* Right — form / result panel */}
        <div className="flex flex-col justify-center p-6 md:p-8 flex-1 bg-white">
          {phase === "result" ? <SpinWheelResult /> : <SpinWheelForm />}
        </div>
      </div>
    </div>
  );
}
