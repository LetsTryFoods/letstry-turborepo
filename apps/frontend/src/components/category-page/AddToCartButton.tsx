import React from 'react';

interface AddToCartButtonProps {
  onClick: () => void;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full h-10 flex items-center justify-center text-sm sm:text-md cursor-pointer mt-2 mb-2 sm:mt-4 border sm:border-2 border-[#0C5273] text-[#0C5273] font-medium rounded-lg transition-colors duration-200"
    >
      Add to cart
    </button>
  );
};
