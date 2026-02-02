import React from 'react';

interface Variant {
  _id: string;
  packageSize?: string;
  weight?: number;
  weightUnit?: string;
  availabilityStatus?: string;
  stockQuantity?: number;
}

interface SizeSelectorProps {
  variants: Variant[];
  selectedVariantId?: string;
  onSelect: (id: string) => void;
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({ variants, selectedVariantId, onSelect }) => {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="mb-3 flex flex-row items-center gap-2 sm:mb-3 md:mb-4 lg:mb-5">
      <p className="text-lg font-medium text-gray-900">
        Weight:
      </p>
      <div className="pl-4 flex flex-wrap gap-3">
        {variants.map((variant) => {
          const isSelected = variant._id === selectedVariantId;
          const label = variant.packageSize || `${variant.weight}${variant.weightUnit}`;
          const isOutOfStock = variant.availabilityStatus !== 'in_stock' || (variant.stockQuantity !== undefined && variant.stockQuantity <= 0);

          return (
            <button
              key={variant._id}
              onClick={() => !isOutOfStock && onSelect(variant._id)}
              disabled={isOutOfStock}
              className={`
                px-4 py-1 rounded-lg border-2 text-sm font-medium transition-all
                ${isSelected
                  ? 'border-[#0f3455] bg-[#0f3455] text-white'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }
                ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
              `}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
