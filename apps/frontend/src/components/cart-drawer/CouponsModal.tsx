import React, { useState, useEffect } from 'react';
import { X, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface Coupon {
  _id: string;
  code: string;
  description: string;
  name: string;
  discountType: string;
  discountValue: number;
  minCartValue?: number;
  endDate: string;
}

interface CouponsModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupons: Coupon[];
  appliedCouponCode: string | null;
  onApplyCoupon: (code: string) => Promise<void>;
  onRemoveCoupon: () => Promise<void>;
  isLoading: boolean;
}

export const CouponsModal: React.FC<CouponsModalProps> = ({
  isOpen,
  onClose,
  coupons,
  appliedCouponCode,
  onApplyCoupon,
  onRemoveCoupon,
  isLoading,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [applying, setApplying] = useState<string | null>(null);


  const handleApplyManual = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setApplying(couponCode);
    try {
      await onApplyCoupon(couponCode.toUpperCase());
      setCouponCode('');
      toast.success('Coupon applied successfully!');
    } catch (error: any) {
      const errorMessage = error?.response?.errors?.[0]?.message || error.message || 'Failed to apply coupon';
      toast.error(errorMessage);
    } finally {
      setApplying(null);
    }
  };

  const handleApplyCoupon = async (code: string) => {
    setApplying(code);
    try {
      await onApplyCoupon(code);
      toast.success('Coupon applied successfully!');
    } catch (error: any) {
      const errorMessage = error?.response?.errors?.[0]?.message || error.message || 'Failed to apply coupon';
      toast.error(errorMessage);
    } finally {
      setApplying(null);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await onRemoveCoupon();
      toast.success('Coupon removed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove coupon');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDiscount = (type: string, value: number) => {
    if (type === 'PERCENTAGE') {
      return `${value}% OFF`;
    }
    return `₹${value} OFF`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">Coupon & Offers</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter Coupon Code"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4A6A] focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleApplyManual()}
                  />
                  <button
                    onClick={handleApplyManual}
                    disabled={applying === couponCode || !couponCode.trim()}
                    className="px-6 py-3 bg-[#0F4A6A] text-white font-semibold rounded-lg hover:bg-[#09354F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {applying === couponCode ? 'APPLYING...' : 'APPLY'}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">More offers</h3>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F4A6A]"></div>
                </div>
              ) : coupons.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Tag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No coupons available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {coupons.map((coupon) => {
                    const isApplied = appliedCouponCode === coupon.code;
                    return (
                      <div
                        key={coupon._id}
                        className={`border rounded-lg p-4 transition-all ${
                          isApplied
                            ? 'bg-green-50 border-green-500'
                            : 'bg-orange-50 border-orange-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 mb-1">
                              {coupon.description}
                            </p>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="inline-block px-3 py-1 border-2 border-dashed border-[#0F4A6A] rounded">
                                <span className="font-mono font-bold text-[#0F4A6A]">
                                  {coupon.code}
                                </span>
                              </div>
                              <span className="text-sm font-semibold text-green-600">
                                {formatDiscount(coupon.discountType, coupon.discountValue)}
                              </span>
                            </div>
                            {coupon.minCartValue && coupon.minCartValue > 0 && (
                              <p className="text-sm text-gray-600 mt-1">
                                Min order value: ₹{coupon.minCartValue}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Valid till: {formatDate(coupon.endDate)}
                            </p>
                          </div>

                          {isApplied ? (
                            <button
                              onClick={handleRemoveCoupon}
                              className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <span>APPLIED</span>
                              <X className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApplyCoupon(coupon.code)}
                              disabled={applying === coupon.code || !!appliedCouponCode}
                              className="px-6 py-2 bg-[#0F4A6A] text-white font-semibold rounded-lg hover:bg-[#09354F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {applying === coupon.code ? 'APPLYING...' : 'APPLY'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
