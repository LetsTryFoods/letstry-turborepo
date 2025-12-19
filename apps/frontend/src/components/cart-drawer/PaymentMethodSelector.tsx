import React from 'react';
import { QrCode, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

interface PaymentMethodSelectorProps {
  selectedMethod: 'upi_qr' | 'card';
  onSelect: (method: 'upi_qr' | 'card') => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelect,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <button
        onClick={() => onSelect('upi_qr')}
        className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
          selectedMethod === 'upi_qr'
            ? 'border-[#0F4A6A] bg-[#0F4A6A]/5'
            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
        }`}
      >
        <QrCode
          className={`w-8 h-8 mb-2 ${
            selectedMethod === 'upi_qr' ? 'text-[#0F4A6A]' : 'text-gray-400'
          }`}
        />
        <span
          className={`font-medium ${
            selectedMethod === 'upi_qr' ? 'text-[#0F4A6A]' : 'text-gray-600'
          }`}
        >
          UPI QR
        </span>
        {selectedMethod === 'upi_qr' && (
          <motion.div
            layoutId="active-payment-method"
            className="absolute inset-0 border-2 border-[#0F4A6A] rounded-xl"
            initial={false}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
      </button>

      <button
        onClick={() => onSelect('card')}
        className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
          selectedMethod === 'card'
            ? 'border-[#0F4A6A] bg-[#0F4A6A]/5'
            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
        }`}
      >
        <CreditCard
          className={`w-8 h-8 mb-2 ${
            selectedMethod === 'card' ? 'text-[#0F4A6A]' : 'text-gray-400'
          }`}
        />
        <span
          className={`font-medium ${
            selectedMethod === 'card' ? 'text-[#0F4A6A]' : 'text-gray-600'
          }`}
        >
          Card
        </span>
        {selectedMethod === 'card' && (
          <motion.div
            layoutId="active-payment-method"
            className="absolute inset-0 border-2 border-[#0F4A6A] rounded-xl"
            initial={false}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
      </button>
    </div>
  );
};
