import React from 'react';

interface ProductPageContainerProps {
  children: React.ReactNode;
  variant?: 'default' | 'special';
}

export const ProductPageContainer: React.FC<ProductPageContainerProps> = ({ children, variant = 'default' }) => {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${variant === 'special' ? 'bg-gray-50' : ''}`}>
      {children}
    </div>
  );
};
