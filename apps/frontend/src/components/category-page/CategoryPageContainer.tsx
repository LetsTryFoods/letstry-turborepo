import React from "react";

interface CategoryPageContainerProps {
  children: React.ReactNode;
}

export const CategoryPageContainer: React.FC<CategoryPageContainerProps> = ({
  children,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6 md:py-8 lg:py-10 xl:py-12">
      {children}
    </div>
  );
};
