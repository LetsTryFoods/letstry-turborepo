"use client"
import React, { useRef, useState } from "react";
import Image from "next/image";

interface Unit {
  batchCode: string;
  companyName: string;
  address: string;
  fssaiLicense?: string;
}

export default function BatchLookup({ units }: { units: Unit[] }) {
  const [chars, setChars] = useState<string[]>(["", "", ""]);
  const [result, setResult] = useState<Unit | null>(null);
  const inputsRef = [useRef<HTMLInputElement | null>(null), useRef<HTMLInputElement | null>(null), useRef<HTMLInputElement | null>(null)];

  function handleChange(index: number, value: string) {
    const v = value.slice(0, 1);
    const next = [...chars];
    next[index] = v.toUpperCase();
    setChars(next);
    if (v && index < 2) {
      inputsRef[index + 1].current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, index: number) {
    if (e.key === "Backspace" && !chars[index] && index > 0) {
      inputsRef[index - 1].current?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const paste = e.clipboardData.getData("text").replace(/\s+/g, "").slice(0, 3).toUpperCase();
    if (!paste) return;
    const arr = paste.split("");
    const next = ["", "", ""]; 
    for (let i = 0; i < arr.length; i++) next[i] = arr[i];
    setChars(next);
    const last = Math.min(arr.length, 3) - 1;
    inputsRef[last].current?.focus();
  }

  function submit() {
    const code = chars.join("").trim();
    const first = code[0]?.toUpperCase();
    const matched = units.find((u) => u.batchCode.toUpperCase() === first) || units.find((u) => u.batchCode.toUpperCase() === "R") || null;
    setResult(matched);
  }

  return (
    <div className="max-w-3xl mx-auto text-center">
      <div className="mb-6 mt-6">
     
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">Code Verification</h2>
        <p className="text-sm text-gray-600 mb-4">Please enter first three characters of the batch number printed on the pack</p>
        <div className="flex items-center justify-center gap-3 mb-4">
          {[0, 1, 2].map((i) => (
            <input
              key={i}
              ref={(el) => { inputsRef[i].current = el as HTMLInputElement | null; }}
              value={chars[i]}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={i === 0 ? handlePaste : undefined}
              maxLength={1}
              className="w-14 h-14 rounded-md border-2 border-blue-500 text-center text-xl font-semibold focus:outline-none"
              inputMode="text"
              aria-label={`batch-char-${i}`}
            />
          ))}
        </div>
        <div className="mb-6">
          <button
            type="button"
            onClick={submit}
            className="bg-blue-600 text-white rounded-full px-6 py-3 font-semibold hover:bg-blue-700"
          >
            VERIFY AND PROCESS
          </button>
        </div>
      </div>

      {result && (
        <div className="border border-gray-200 rounded-lg p-4 text-left">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{result.companyName}</h3>
          <p className="text-sm text-gray-700 mb-3">{result.address}</p>
          <div className="flex items-center gap-3">
            <Image src="/fssai_logo-removebg-preview.png" alt="FSSAI" width={60} height={32} />
            <p className="text-sm font-medium">License No: <span className="font-normal text-gray-700">{result.fssaiLicense}</span></p>
          </div>
        </div>
      )}
    </div>
  );
}
