import React from "react";
import { ChevronDown } from "lucide-react";

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
    if (
      w.toLowerCase().endsWith("g") &&
      !w.toLowerCase().endsWith("mg") &&
      !w.toLowerCase().endsWith("kg")
    ) {
      return w.slice(0, -1).trim() + " gm";
    }
    return w;
  };

  return (
    <div className="w-full flex flex-col items-center gap-1 mt-2 sm:mt-3">
      <label className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Weight
      </label>
      <div className="relative w-full">
        {weights.length > 1 ? (
          <>
            <select
              value={selectedWeight}
              onChange={(e) => onWeightChange(e.target.value)}
              className="w-full appearance-none bg-[#fdfbf7] border border-[#e5d6c3] rounded-md text-xs sm:text-sm font-medium text-gray-800 py-1.5 px-3 pr-8 cursor-pointer focus:outline-none focus:border-brand-hover text-center text-center-last"
            >
              {weights.map((weight) => (
                <option key={weight} value={weight}>
                  {formatWeight(weight)}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
              strokeWidth={2}
            />
          </>
        ) : (
          <div className="w-full bg-[#fdfbf7] border border-[#e5d6c3] rounded-md text-xs sm:text-sm font-medium text-gray-800 py-1.5 px-3 flex items-center justify-center">
            {formatWeight(weights[0] || selectedWeight)}
          </div>
        )}
      </div>
    </div>
  );
};
