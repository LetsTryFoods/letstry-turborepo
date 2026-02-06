import React from 'react';
import { ChevronDown } from 'lucide-react';

interface WeightSelectorProps {
  weights: string[];
  selectedWeight: string;
  onWeightChange: (weight: string) => void;
}

export const WeightSelector: React.FC<WeightSelectorProps> = ({
  weights,
  selectedWeight,
  onWeightChange,
}) => {
  const formatWeight = (w: string) => {
    // If it ends with 'g' but not 'mg' or 'kg', change to ' gm'
    if (w.toLowerCase().endsWith('g') && !w.toLowerCase().endsWith('mg') && !w.toLowerCase().endsWith('kg')) {
      return w.slice(0, -1).trim() + ' gm';
    }
    return w;
  };

  return (
    <div className="w-full flex flex-col items-start gap-1 mt-2 sm:mt-3">
      <label className="text-xl font-bold text-black">Weight</label>
      <div className="relative w-full">
        {weights.length > 1 ? (
          <>
            <select
              value={selectedWeight}
              onChange={(e) => onWeightChange(e.target.value)}
              className="w-full appearance-none bg-[#fdfbf7] border border-[#f5e6d3] rounded-lg text-sm sm:text-base md:text-lg font-bold text-black py-2.5 px-4 pr-10 cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-hover"
            >
              {weights.map((weight) => (
                <option key={weight} value={weight}>
                  {formatWeight(weight)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black pointer-events-none" strokeWidth={2.5} />
          </>
        ) : (
          <div className="w-full bg-[#fdfbf7] border border-[#f5e6d3] rounded-lg text-sm sm:text-base md:text-lg font-bold text-black py-2.5 px-4">
            {formatWeight(weights[0] || selectedWeight)}
          </div>
        )}
      </div>
    </div>
  );
};
