import React from 'react';
import { MapPin, CreditCard } from 'lucide-react';

interface CartFooterProps {
  totalPrice: number;
  onCheckout: () => void;
  onPayNow?: () => void;
  selectedAddress?: {
    _id: string;
    addressType: string;
    formattedAddress: string;
    recipientName?: string;
    buildingName?: string;
  } | null;
}

export const CartFooter: React.FC<CartFooterProps> = ({
  totalPrice,
  onCheckout,
  onPayNow,
  selectedAddress,
}) => {
  return (
    <div className="border-t border-gray-100 bg-white p-4 sticky bottom-0 z-10">
      {selectedAddress ? (
        <div className="space-y-3">
          <button
            onClick={onCheckout}
            className="w-full flex items-start gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left border border-gray-200"
          >
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#003B65]" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-gray-900">{selectedAddress.addressType}</span>
                <span className="text-xs text-[#003B65] font-medium">Change</span>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                {selectedAddress.buildingName || selectedAddress.formattedAddress}
              </p>
            </div>
          </button>
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Total Amount</span>
              <span className="text-2xl font-bold text-[#003B65]">₹ {totalPrice}</span>
            </div>

            <button
              onClick={onPayNow}
              className="bg-[#003B65] text-white font-bold py-4 px-8 rounded-lg hover:bg-[#002B4A] transition-colors flex items-center gap-2 shadow-lg"
            >
              <CreditCard className="w-5 h-5" />
              Pay Now
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-[#003B65]">₹ {totalPrice}</span>
          </div>

          <button
            onClick={onCheckout}
            className="bg-[#003B65] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#002B4A] transition-colors min-w-[180px]"
          >
            Select Address
          </button>
        </div>
      )}
    </div>
  );
};
