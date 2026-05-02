'use client';

/**
 * PIN code → estimated delivery date widget.
 *
 * UI-only Sprint 4 implementation. The check button exists primarily to
 * raise on-page time and reduce bounce (an engagement signal Google uses
 * for ranking) and to give shoppers a reason to commit before checkout.
 *
 * When the existing serviceability API surface is available we'll wire
 * this to it; until then it returns a deterministic 3-5 day window for
 * any 6-digit Indian PIN code (and rejects non-Indian formats).
 */

import { useState } from 'react';

export function PincodeDeliveryEstimator({ deliveryLeadTime }: { deliveryLeadTime?: string | null }) {
  const [pin, setPin] = useState('');
  const [estimate, setEstimate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEstimate(null);
    if (!/^\d{6}$/.test(pin)) {
      setError('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    const today = new Date();
    const minDays = parseLeadTime(deliveryLeadTime, 'min');
    const maxDays = parseLeadTime(deliveryLeadTime, 'max');
    const min = new Date(today);
    min.setDate(today.getDate() + minDays);
    const max = new Date(today);
    max.setDate(today.getDate() + maxDays);
    const fmt = (d: Date) => d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    setEstimate(`Estimated delivery: ${fmt(min)} – ${fmt(max)}`);
  };

  return (
    <div className="rounded-lg border border-gray-200 p-3 my-3 bg-gray-50">
      <form onSubmit={handleCheck} className="flex gap-2 items-center">
        <label htmlFor="pincode" className="sr-only">
          Delivery PIN code
        </label>
        <input
          id="pincode"
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="Enter delivery PIN code"
          className="flex-1 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0C5273] text-sm"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-[#0C5273] text-white text-sm font-medium hover:bg-[#0C5273]/90"
        >
          Check
        </button>
      </form>
      {estimate && (
        <p className="text-sm text-emerald-700 mt-2">{estimate}</p>
      )}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}

function parseLeadTime(raw: string | null | undefined, mode: 'min' | 'max'): number {
  if (!raw) return mode === 'min' ? 3 : 5;
  const m = raw.match(/(\d+)\s*-\s*(\d+)/);
  if (m) return mode === 'min' ? Number(m[1]) : Number(m[2]);
  const single = Number(raw.replace(/\D/g, ''));
  if (Number.isFinite(single) && single > 0) {
    return mode === 'min' ? single : Math.max(single + 2, single);
  }
  return mode === 'min' ? 3 : 5;
}
