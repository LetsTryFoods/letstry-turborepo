import React from 'react';

interface AddToCartButtonProps {
  onClick: () => void;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-sm sm:text-md cursor-pointer mt-2 mb-2 sm:mt-4 py-2 px-2 sm:px-6 border-2 border-[#0C5273] text-[#0C5273] text-sm font-medium rounded transition-colors duration-200"
    >
      Add to cart
    </button>
  );
};
