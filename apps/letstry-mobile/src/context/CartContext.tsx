import React, { createContext, useContext, useState, useCallback } from 'react';

interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (productId: string, variantId: string) => void;
  removeItem: (productId: string, variantId: string) => void;
  getItemQuantity: (variantId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((productId: string, variantId: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === variantId);
      if (existing) {
        return prev.map((i) =>
          i.variantId === variantId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { productId, variantId, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: string, variantId: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === variantId);
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.variantId === variantId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prev.filter((i) => i.variantId !== variantId);
    });
  }, []);

  const getItemQuantity = useCallback(
    (variantId: string) => {
      return items.find((i) => i.variantId === variantId)?.quantity || 0;
    },
    [items]
  );

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, getItemQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
