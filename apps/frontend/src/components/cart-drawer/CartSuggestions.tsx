import React from 'react';
import { SuggestionCard } from './SuggestionCard';

interface Suggestion {
  id: string;
  image: string;
  title: string;
  price: number;
}

interface CartSuggestionsProps {
  suggestions: Suggestion[];
  onAdd: (id: string) => void;
}

export const CartSuggestions: React.FC<CartSuggestionsProps> = ({ suggestions, onAdd }) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">More Suggestions</h3>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
        {suggestions.map((item) => (
          <SuggestionCard
            key={item.id}
            {...item}
            onAdd={onAdd}
          />
        ))}
      </div>
    </div>
  );
};
