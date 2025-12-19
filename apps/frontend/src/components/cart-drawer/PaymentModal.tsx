import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { UpiQrPayment } from './UpiQrPayment';
import { CardPayment } from './CardPayment';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartId: string;
  amount: string;
  userDetails: {
    email: string;
    name: string;
    phone: string;
  };
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  cartId,
  amount,
  userDetails,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'upi_qr' | 'card'>('upi_qr');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[#0F4A6A]">Complete Payment</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <PaymentMethodSelector
                selectedMethod={paymentMethod}
                onSelect={setPaymentMethod}
              />

              <div className="mt-6">
                {paymentMethod === 'upi_qr' ? (
                  <UpiQrPayment
                    cartId={cartId}
                    amount={amount}
                    userDetails={userDetails}
                  />
                ) : (
                  <CardPayment
                    cartId={cartId}
                    amount={amount}
                    userDetails={userDetails}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
