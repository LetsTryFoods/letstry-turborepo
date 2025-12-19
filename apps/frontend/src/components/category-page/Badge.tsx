import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  label: string;
  variant?: 'trending' | 'bestseller' | 'default';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', className }) => {
  const variantStyles = {
    trending: 'bg-[#b91c68] text-white', // Pinkish color from screenshot
    bestseller: 'bg-[#3f4166] text-white', // Dark blue/grey from screenshot
    default: 'bg-gray-200 text-gray-800',
  };

  return (
    <div
      className={cn(
        'absolute top-0 left-0 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-br-lg z-10',
        variantStyles[variant],
        className
      )}
    >
      {label}
    </div>
  );
};
