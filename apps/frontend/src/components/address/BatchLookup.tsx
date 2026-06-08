"use client"
import React, { useRef, useState } from "react";
import Image from "next/image";

interface Unit {
  batchCode: string;
  companyName: string;
  address: string;
  fssaiLicense?: string;
  batchCode: string;
  companyName: string;
  address: string;
  fssaiLicense?: string;
}

export default function BatchLookup({ units }: { units: Unit[] }) {
  const [chars, setChars] = useState<string[]>(["", "", ""]);
  const [result, setResult] = useState<Unit | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const inputsRef = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  function handleChange(index: number, value: string) {
    const v = value.slice(0, 1);
    const next = [...chars];
    next[index] = v.toUpperCase();
    setChars(next);
    if (v && index < 2) {
      inputsRef[index + 1].current?.focus();
    }
  }
  function handleChange(index: number, value: string) {
    const v = value.slice(0, 1);
    const next = [...chars];
    next[index] = v.toUpperCase();
    setChars(next);
    if (v && index < 2) {
      inputsRef[index + 1].current?.focus();
    }
  }

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) {
    if (e.key === "Backspace" && !chars[index] && index > 0) {
      inputsRef[index - 1].current?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const paste = e.clipboardData
      .getData("text")
      .replace(/\s+/g, "")
      .slice(0, 3)
      .toUpperCase();
    if (!paste) return;
    const next = ["", "", ""];
    for (let i = 0; i < Math.min(paste.length, 3); i++) next[i] = paste[i];
    setChars(next);
    const last = Math.min(paste.length, 3) - 1;
    inputsRef[last].current?.focus();
  }

  function submit() {
    const first = chars[0]?.toUpperCase();
    const matched =
      units.find((u) => u.batchCode.toUpperCase() === first) ||
      units.find((u) => u.batchCode.toUpperCase() === "R") ||
      null;
    setResult(matched);
    setSubmitted(true);
  }

  function reset() {
    setChars(["", "", ""]);
    setResult(null);
    setSubmitted(false);
    setTimeout(() => inputsRef[0].current?.focus(), 50);
  }

  const isReady = chars.every((c) => c.trim() !== "");

  return (
    <div className="w-full">
      {/* Info banner */}
      <div
        className="rounded-2xl overflow-hidden mb-6 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        style={{ background: "#D1E9F2" }}
      >
        <div
          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: "#0C5273" }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="3" y="3" width="18" height="3" rx="1" fill="white" />
            <rect
              x="3"
              y="9"
              width="18"
              height="2"
              rx="1"
              fill="white"
              opacity="0.75"
            />
            <rect
              x="3"
              y="14"
              width="12"
              height="2"
              rx="1"
              fill="white"
              opacity="0.75"
            />
            <rect
              x="3"
              y="19"
              width="7"
              height="2"
              rx="1"
              fill="white"
              opacity="0.5"
            />
          </svg>
        </div>
        <div>
          <p
            className="text-sm font-semibold mb-0.5"
            style={{ color: "#0C5273" }}
          >
            How to find your Batch Code?
          </p>
          <p className="text-sm text-gray-600">
            Look at the bottom or back of your Let&apos;s Try product pack. The
            batch number is printed near the manufacturing date. Enter the{" "}
            <strong>first three characters</strong> below.
          </p>
        </div>
      </div>

      {/* Verification card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 text-center">
        <div
          className="w-10 h-10 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ background: "#F3EEEA" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="#0C5273"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2
          className="text-xl sm:text-2xl font-bold mb-1"
          style={{ color: "#0C5273" }}
        >
          Code Verification
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Enter the first three characters of the batch number printed on your
          pack
        </p>

        <div className="flex items-center justify-center gap-3 mb-6">
          {[0, 1, 2].map((i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef[i].current = el;
              }}
              value={chars[i]}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={i === 0 ? handlePaste : undefined}
              maxLength={1}
              inputMode="text"
              aria-label={`batch character ${i + 1}`}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 text-center text-2xl font-bold transition-all focus:outline-none"
              style={{
                borderColor: chars[i] ? "#0C5273" : "#D1E9F2",
                color: "#0C5273",
                background: chars[i] ? "#fdfbf7" : "white",
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={!isReady}
          className="w-full sm:w-auto px-8 py-3 rounded-full font-semibold text-sm tracking-wide transition-all duration-200"
          style={{
            background: isReady ? "#0C5273" : "#e5e7eb",
            color: isReady ? "white" : "#9ca3af",
            cursor: isReady ? "pointer" : "not-allowed",
            opacity: isReady ? 1 : 0.7,
          }}
        >
          VERIFY AND PROCESS
        </button>
      </div>

      {/* Result */}
      {submitted && result && (
        <div
          className="mt-5 rounded-2xl border overflow-hidden shadow-sm"
          style={{ borderColor: "#D1E9F2" }}
        >
          <div
            className="px-5 py-3 flex items-center gap-2"
            style={{ background: "#0C5273" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-white text-sm font-semibold">
              Manufacturing Unit Address
            </span>
          </div>

          <div className="bg-white px-5 py-5">
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-1"
              style={{ color: "#0C5273" }}
            >
              Batch Code: {chars[0].toUpperCase()}
            </p>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              {result.companyName}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              {result.address}
            </p>

            <div
              className="pt-4 border-t flex items-center gap-3"
              style={{ borderColor: "#D1E9F2" }}
            >
              <Image
                src="/fssai_logo-removebg-preview.png"
                alt="FSSAI Logo"
                width={64}
                height={32}
                className="h-8 w-auto object-contain"
              />
              <p className="text-sm text-gray-700">
                License No:{" "}
                <span className="font-semibold" style={{ color: "#0C5273" }}>
                  {result.fssaiLicense}
                </span>
              </p>
            </div>
          </div>

          <div
            className="px-5 py-3 flex justify-end"
            style={{ background: "#fdfbf7" }}
          >
            <button
              type="button"
              onClick={reset}
              className="text-sm font-medium underline underline-offset-2"
              style={{ color: "#0C5273" }}
            >
              Check another batch code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
