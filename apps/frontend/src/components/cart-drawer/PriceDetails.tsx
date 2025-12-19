import React from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PriceDetailsProps {
  isExpanded: boolean;
  onToggle: () => void;
  priceBreakdown: {
    subtotal: number;
    discountAmount: number;
    shippingCost: number;
    estimatedTax: number;
    handlingCharge: number;
    grandTotal: number;
  };
}

export const PriceDetails: React.FC<PriceDetailsProps> = ({
  isExpanded,
  onToggle,
  priceBreakdown,
}) => {
  const savings = priceBreakdown.discountAmount;

  return (
    <div className="border-t border-gray-100 bg-white">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-medium text-[#0F4A6A] underline decoration-[#0F4A6A] underline-offset-2">
          View price details
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-[#0F4A6A]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#0F4A6A]" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
              <div className="flex items-center justify-between text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">📦</span>
                  <span>Items total</span>
                </div>
                <span className="font-medium">₹{priceBreakdown.subtotal.toFixed(2)}</span>
              </div>

              {priceBreakdown.discountAmount > 0 && (
                <div className="flex items-center justify-between text-sm text-green-600">
                  <div className="flex items-center gap-2">
                    <span>🎟️</span>
                    <span>Coupon Discount</span>
                  </div>
                  <span className="font-medium">-₹{priceBreakdown.discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">📊</span>
                  <span>Subtotal</span>
                </div>
                <span className="font-medium">₹{(priceBreakdown.subtotal - priceBreakdown.discountAmount).toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">🚚</span>
                  <span>Delivery Charge</span>
                </div>
                <span className="font-medium">
                  {priceBreakdown.shippingCost === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    `₹${priceBreakdown.shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">📋</span>
                  <span>Handling Charge</span>
                </div>
                <span className="font-medium">₹{priceBreakdown.handlingCharge.toFixed(2)}</span>
              </div>

              {priceBreakdown.estimatedTax > 0 && (
                <div className="flex items-center justify-between text-sm text-gray-700 pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-gray-400" />
                    <span>Taxes & Charges</span>
                  </div>
                  <span className="font-medium">₹{priceBreakdown.estimatedTax.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-2">
                <div className="flex items-center justify-between text-base font-bold text-gray-900">
                  <span>Grand Total</span>
                  <span className="text-[#0F4A6A]">₹{priceBreakdown.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {savings > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 mt-2">
                  <p className="text-xs font-medium text-blue-900">
                    You Saves ₹{savings.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-blue-700 mt-0.5">Including taxes & charges</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
