import React from "react";
import {
  X,
  ClipboardList,
  Tag,
  FileText,
  Truck,
  ShoppingBag,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PriceDetailsProps {
  isOpen: boolean;
  onClose: () => void;
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
  isOpen,
  onClose,
  priceBreakdown,
}) => {
  const savings = priceBreakdown.discountAmount;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
          className="absolute inset-0 z-[110] bg-white flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
            <div className="flex-1" />
            <h2 className="text-lg font-bold text-black">Price Details</h2>
            <div className="flex-1 flex justify-end">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close price details"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            <div className="flex items-center justify-between text-base">
              <div className="flex items-center gap-3 text-gray-600">
                <ClipboardList size={20} />
                <span>Items total</span>
              </div>
              <span className="font-bold text-gray-900">
                ₹{priceBreakdown.subtotal.toFixed(2)}
              </span>
            </div>

            {priceBreakdown.discountAmount > 0 && (
              <div className="flex items-center justify-between text-base">
                <div className="flex items-center gap-3 text-gray-600">
                  <Tag size={20} />
                  <span>Coupon Discount</span>
                </div>
                <span className="font-bold text-[#006DBC]">
                  -₹{priceBreakdown.discountAmount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-base">
              <div className="flex items-center gap-3 text-gray-600">
                <FileText size={20} />
                <span>Subtotal</span>
              </div>
              <span className="font-bold text-gray-900">
                ₹
                {(
                  priceBreakdown.subtotal - priceBreakdown.discountAmount
                ).toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-base">
              <div className="flex items-center gap-3 text-gray-600">
                <Truck size={20} />
                <span>Delivery Charge</span>
              </div>
              <span className="font-bold text-gray-900">
                {priceBreakdown.shippingCost === 0
                  ? "FREE"
                  : `₹${priceBreakdown.shippingCost.toFixed(2)}`}
              </span>
            </div>

            <div className="flex items-center justify-between text-base text-gray-600">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} />
                <span>Handling Charge</span>
              </div>
              <span className="font-bold text-gray-900">
                ₹{priceBreakdown.handlingCharge.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <span>Taxes & Charges</span>
              <Info size={16} className="text-blue-400 fill-current bg-white" />
            </div>

            {/* Grand Total Section - After Taxes & Charges */}
            <div className="pt-6 border-t border-dotted border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl font-bold text-gray-900">
                  Grand Total
                </span>
                <span className="text-xl font-bold text-gray-900">
                  ₹{priceBreakdown.grandTotal.toFixed(2)}
                </span>
              </div>
              {savings > 0 && (
                <div className="space-y-1">
                  <div className="inline-block bg-[#4A90E2] text-white text-xs font-bold px-2 py-1 rounded">
                    You Saves ₹{savings.toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-500">
                    Including taxes & charges
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
