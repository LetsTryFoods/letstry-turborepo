import React from "react";

interface ProductPageContainerProps {
  children: React.ReactNode;
  variant?: "default" | "special";
}

export const ProductPageContainer: React.FC<ProductPageContainerProps> = ({
  children,
  variant = "default",
}) => {
  return (
    <div
      className={`max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-10 xl:py-12 ${variant === "special" ? "bg-gray-50" : ""}`}
    >
      {children}
    </div>
  );
};
