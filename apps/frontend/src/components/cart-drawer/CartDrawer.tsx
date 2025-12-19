import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartHeader } from './CartHeader';
import { CartItem } from './CartItem';
import { CartCoupon } from './CartCoupon';
import { CartSuggestions } from './CartSuggestions';
import { CartFooter } from './CartFooter';
import { PriceDetails } from './PriceDetails';
import { CouponsModal } from './CouponsModal';
import { AddressModal } from './AddressModal';
import { AddressDetailsModal, AddressFormData } from './AddressDetailsModal';
import { PaymentModal } from './PaymentModal';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: Array<{
    id: string;
    image: string;
    title: string;
    size: string;
    price: number;
    quantity: number;
  }>;
  suggestions: Array<{
    id: string;
    image: string;
    title: string;
    price: number;
  }>;
  totalPrice: number;
  priceBreakdown: {
    subtotal: number;
    discountAmount: number;
    shippingCost: number;
    estimatedTax: number;
    handlingCharge: number;
    grandTotal: number;
  };
  showPriceDetails: boolean;
  onTogglePriceDetails: () => void;
  showCoupons: boolean;
  onToggleCoupons: () => void;
  showAddressModal: boolean;
  onToggleAddressModal: () => void;
  showAddressDetailsModal: boolean;
  onToggleAddressDetailsModal: () => void;
  addresses: Array<{
    _id: string;
    addressType: string;
    formattedAddress: string;
  }>;
  onSelectAddress: (addressId: string) => void;
  onSelectPlace: (placeId: string, description: string) => void;
  onSaveAddressDetails: (details: AddressFormData) => void;
  onPhoneValidationFailed: (phone: string, formData: AddressFormData) => void;
  coupons: any[];
  appliedCouponCode: string | null;
  onApplyCoupon: (code: string) => Promise<void>;
  onRemoveCoupon: () => Promise<void>;
  couponsLoading: boolean;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onRemoveItem: (id: string) => void;
  onAddSuggestion: (id: string) => void;
  selectedAddress?: any;
  onPayNow?: () => void;
  showPaymentModal: boolean;
  onTogglePaymentModal: () => void;
  cartId: string;
  amount: string;
  userDetails: {
    email: string;
    name: string;
    phone: string;
  };
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  suggestions,
  totalPrice,
  priceBreakdown,
  showPriceDetails,
  onTogglePriceDetails,
  showCoupons,
  onToggleCoupons,
  showAddressModal,
  onToggleAddressModal,
  showAddressDetailsModal,
  onToggleAddressDetailsModal,
  addresses,
  onSelectAddress,
  onSelectPlace,
  onSaveAddressDetails,
  onPhoneValidationFailed,
  coupons,
  appliedCouponCode,
  onApplyCoupon,
  onRemoveCoupon,
  couponsLoading,
  onUpdateQuantity,
  onRemoveItem,
  onAddSuggestion,
  selectedAddress,
  onPayNow,
  showPaymentModal,
  onTogglePaymentModal,
  cartId,
  amount,
  userDetails,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 top-[44px] z-[55] flex justify-end isolate">
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/20"
            onClick={onClose}
          />

          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col"
          >
            <CartHeader itemCount={items.length} onClose={onClose} />

            <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
              <div className="mb-6">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    {...item}
                    onUpdateQuantity={onUpdateQuantity}
                    onRemove={onRemoveItem}
                  />
                ))}
              </div>

              <CartCoupon onClick={onToggleCoupons} />

              <CartSuggestions 
                suggestions={suggestions} 
                onAdd={onAddSuggestion} 
              />
            </div>

            <PriceDetails
              isExpanded={showPriceDetails}
              onToggle={onTogglePriceDetails}
              priceBreakdown={priceBreakdown}
            />

            <CartFooter 
              totalPrice={totalPrice} 
              onCheckout={onToggleAddressModal}
              selectedAddress={selectedAddress}
              onPayNow={onPayNow}
            />

            <CouponsModal
              isOpen={showCoupons}
              onClose={onToggleCoupons}
              coupons={coupons}
              appliedCouponCode={appliedCouponCode}
              onApplyCoupon={onApplyCoupon}
              onRemoveCoupon={onRemoveCoupon}
              isLoading={couponsLoading}
            />

            <AddressModal
              isOpen={showAddressModal}
              onClose={onToggleAddressModal}
              addresses={addresses}
              onSelectAddress={onSelectAddress}
              onSelectPlace={onSelectPlace}
            />

            <AddressDetailsModal
              isOpen={showAddressDetailsModal}
              onClose={onToggleAddressDetailsModal}
              onSave={onSaveAddressDetails}
              onPhoneValidationFailed={onPhoneValidationFailed}
            />

            <PaymentModal
              isOpen={showPaymentModal}
              onClose={onTogglePaymentModal}
              cartId={cartId}
              amount={amount}
              userDetails={userDetails}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
