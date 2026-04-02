"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSpinWheelStore } from "./spinWheel.store";

export function SpinWheelResult() {
  const { result, setOpen, reset } = useSpinWheelStore();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!result || result.coupon === null) return;

    const canvas = document.createElement("canvas");
    Object.assign(canvas.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: "99999",
    });
    document.body.appendChild(canvas);

    import("canvas-confetti").then(({ default: confetti }) => {
      const fire = confetti.create(canvas, { resize: true, useWorker: true });

      fire({ particleCount: 80, angle: 60, spread: 70, startVelocity: 50, origin: { x: 0, y: 0.6 }, colors: ["#FFD700", "#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7"] });
      fire({ particleCount: 80, angle: 120, spread: 70, startVelocity: 50, origin: { x: 1, y: 0.6 }, colors: ["#FFD700", "#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7"] });

      setTimeout(() => {
        fire({ particleCount: 60, spread: 100, startVelocity: 30, origin: { x: 0.5, y: 0.4 }, colors: ["#FFD700", "#ffffff", "#ff6b6b"] });
      }, 300);

      setTimeout(() => {
        canvas.remove();
      }, 3500);
    });

    return () => {
      canvas.remove();
    };
  }, [result]);

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => reset(), 300);
  };

  const handleCopy = () => {
    if (!result?.coupon) return;
    navigator.clipboard.writeText(result.coupon).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!result) return null;

  const hasWon = result.coupon !== null;

  if (!hasWon) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <h2 className="text-2xl font-extrabold text-gray-900">Better Luck Next Time!</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Oh no! You didn&apos;t win any prize this time, but don&apos;t give up! Spin the wheel again after this week for another chance to win amazing rewards. Good luck next time!
        </p>
        <Link
          href="/products"
          onClick={handleClose}
          className="w-full py-3 rounded-lg border-2 border-[#0C5273] text-[#0C5273] font-bold text-sm text-center hover:bg-[#0C5273] hover:text-white transition-colors"
        >
          Explore products!
        </Link>
        <button
          onClick={handleClose}
          className="text-center text-gray-400 text-xs underline underline-offset-2 hover:text-gray-600 transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-center">
        <svg viewBox="0 0 280 72" className="w-[230px]" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,14 16,14 20,60 0,54" fill="#c0392b" />
          <polygon points="280,14 264,14 260,60 280,54" fill="#c0392b" />
          <path d="M16,14 Q140,2 264,14 L260,60 Q140,74 20,60 Z" fill="#e74c3c" />
          <path d="M16,14 Q140,2 264,14 L262,22 Q140,11 18,22 Z" fill="rgba(255,255,255,0.15)" />
          <text x="140" y="44" textAnchor="middle" fill="#ffffff" fontFamily="Georgia, serif" fontStyle="italic" fontSize="21" fontWeight="bold">Congratulations!</text>
        </svg>
      </div>

      <div>
        <h2 className="text-[22px] font-extrabold text-gray-900 leading-tight">
          You Won {result.label}!
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed mt-1">
          Use this coupon code at checkout to get{" "}
          <span className="font-bold text-gray-800">{result.label}</span>{" "}
          on your next purchase!
        </p>
      </div>

      <div
        className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-center cursor-pointer select-all hover:border-[#0C5273] transition-colors"
        onClick={handleCopy}
        title="Click to copy"
      >
        <p className="text-[17px] font-mono font-extrabold text-gray-900 tracking-[0.2em]">
          {result.coupon}
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">
          {copied ? "✓ Copied!" : "Click to copy"}
        </p>
      </div>

      <button
        onClick={handleCopy}
        className="w-full py-3 rounded-lg bg-[#0C5273] text-white font-bold text-sm hover:bg-[#093d56] transition-colors"
      >
        {copied ? "✓ Copied to clipboard!" : "Claim Now"}
      </button>

      <p className="text-center text-gray-400 text-xs">Hurry! Offer valid for the next 54 hours only.</p>

      <button
        onClick={handleClose}
        className="text-center text-gray-400 text-xs underline underline-offset-2 hover:text-gray-600 transition-colors"
      >
        Close
      </button>
    </div>
  );
}
