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
  return (
    <div className="w-full flex flex-row items-center gap-2 mt-2 sm:mt-3 md:mt-4">
      <label className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">Weight:</label>
      <div className="flex pl-2 flex-wrap gap-1.5">
        {weights.map((weight) => (
          <button
            key={weight}
            onClick={() => onWeightChange(weight)}
            className={`px-2 py-2 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-md border transition-all duration-200 ${selectedWeight === weight
              ? 'bg-[#0C5273] text-white border-[#0C5273]'
              : 'bg-white text-gray-700 border-gray-300 hover:border-[#0C5273] hover:text-[#0C5273]'
              }`}
          >
            {weight}
          </button>
        ))}
      </div>


      {/* <div className="hidden sm:block relative">
        <select
          value={selectedWeight}
          onChange={(e) => onWeightChange(e.target.value)}
          className="w-full appearance-none bg-white border border-gray-300 rounded text-base md:text-lg lg:text-xl font-semibold text-gray-900 focus:ring-2 focus:ring-[#3f4166] focus:border-[#3f4166] cursor-pointer py-1 px-2 pr-8"
        >
          {weights.map((weight) => (
            <option key={weight} value={weight} className="py-1 px-2">
              {weight}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
      </div> */}
    </div>
  );
};
