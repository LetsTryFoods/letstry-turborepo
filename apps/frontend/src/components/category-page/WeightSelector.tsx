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
    <div className="w-full mt-2 sm:mt-3 md:mt-4">
      <label className="block text-xs sm:text-sm md:text-md text-gray-500 mb-1 sm:mb-1.5 text-left">Weight :</label>
      
      
        <div className="flex flex-wrap gap-1.5">
          {weights.map((weight) => (
            <button
              key={weight}
              onClick={() => onWeightChange(weight)}
              className={`px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm md:text-md font-semibold rounded border transition-colors ${
                selectedWeight === weight
                  ? 'bg-[#3f4166] text-white border-[#3f4166]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#3f4166]'
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
