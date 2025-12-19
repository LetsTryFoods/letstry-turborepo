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
    <div className="w-full mt-3">
      <label className="block text-md text-gray-500 mb-1 text-left">Weight :</label>
      <div className="relative">
        <select
          value={selectedWeight}
          onChange={(e) => onWeightChange(e.target.value)}
          className="w-full appearance-none bg-transparent border-none text-xl font-semibold text-gray-900 focus:ring-0 cursor-pointer py-1 pr-6 pl-0"
        >
          {weights.map((weight) => (
            <option key={weight} value={weight}>
              {weight}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
      </div>
    </div>
  );
};
