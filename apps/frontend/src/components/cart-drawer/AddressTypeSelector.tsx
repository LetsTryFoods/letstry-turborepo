import React from 'react';
import { Home, Building2, Building } from 'lucide-react';

type AddressType = 'Home' | 'Office' | 'Flat' | 'Other';

interface AddressTypeSelectorProps {
  value: AddressType;
  onChange: (value: AddressType) => void;
}

const ADDRESS_TYPES = [
  { value: 'Home' as const, label: 'Home', icon: Home },
  { value: 'Office' as const, label: 'Office', icon: Building2 },
  { value: 'Flat' as const, label: 'Flat', icon: Building },
  { value: 'Other' as const, label: 'Other', icon: null },
];

export const AddressTypeSelector: React.FC<AddressTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        Select address type <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-4 gap-2">
        {ADDRESS_TYPES.map(({ value: typeValue, label, icon: Icon }) => (
          <button
            key={typeValue}
            type="button"
            onClick={() => onChange(typeValue)}
            className={`p-3 border-2 rounded-lg transition-all flex flex-col items-center gap-1 ${
              value === typeValue
                ? 'border-[#0F4A6A] bg-[#0F4A6A]/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {Icon && <Icon className="w-5 h-5" />}
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
