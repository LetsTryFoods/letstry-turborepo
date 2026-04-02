"use client";

import { useState } from "react";
import { useSpinWheelStore } from "./spinWheel.store";
import { useSpinWheel } from "./useSpinWheel";

export function SpinWheelForm() {
  const { email, setEmail, setOpen, reset } = useSpinWheelStore();
  const { spin } = useSpinWheel();
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    spin();
  };

  const handleNoThanks = () => {
    setOpen(false);
    setTimeout(() => reset(), 300);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
          Spin & Win!
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Try your luck and spin the wheel for a chance to win exciting rewards.
          What will you win today?
        </p>
      </div>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email..."
        className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#0C5273] focus:ring-1 focus:ring-[#0C5273]"
      />
      {error && <p className="text-red-500 text-xs -mt-2">{error}</p>}

      <button
        type="submit"
        className="w-full py-3 rounded-lg bg-[#0C5273] text-white font-bold text-sm hover:bg-[#093d56] transition-colors"
      >
        Spin Now
      </button>

      <button
        type="button"
        onClick={handleNoThanks}
        className="text-center text-gray-400 text-xs underline underline-offset-2 hover:text-gray-600 transition-colors"
      >
        No thank you
      </button>
    </form>
  );
}
