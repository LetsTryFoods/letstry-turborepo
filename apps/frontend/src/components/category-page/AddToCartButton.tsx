import React from "react";

interface AddToCartButtonProps {
  onClick: () => void;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="w-full h-8 sm:h-10 flex items-center justify-center text-[13px] sm:text-sm cursor-pointer mt-1 mb-1 sm:mt-4 border sm:border-2 border-[#0C5273] text-[#0C5273] font-semibold rounded-md transition-colors duration-200 uppercase tracking-wide hover:bg-[#0C5273] hover:text-white"
    >
      Add to cart
    </button>
  );
};
