"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useCheckPhone } from '@/lib/address/use-check-phone';
import { FormInput } from './FormInput';
import { PhoneInput } from './PhoneInput';
import { AddressTypeSelector } from './AddressTypeSelector';

interface AddressDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (details: AddressFormData) => void;
  onPhoneValidationFailed: (phone: string, formData: AddressFormData) => void;
  initialData?: Partial<AddressFormData>;
  isAuthenticated: boolean;
}

export interface AddressFormData {
  addressType: 'Home' | 'Office' | 'Flat' | 'Other';
  recipientPhone: string;
  recipientName: string;
  buildingName: string;
  floor?: string;
  streetArea?: string;
  landmark?: string;
  postalCode?: string;
  isOrderingForSomeoneElse?: boolean;
  placerPhone?: string;
  placerEmail?: string;
}

export const AddressDetailsModal: React.FC<AddressDetailsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onPhoneValidationFailed,
  initialData,
  isAuthenticated,
}) => {
  const [shouldCheckPhone, setShouldCheckPhone] = useState(false);
  const hasShownAlertRef = useRef(false);
  const lastCheckedPhoneRef = useRef('');

  React.useEffect(() => {
    console.log('AddressDetailsModal - isAuthenticated:', isAuthenticated);
  }, [isAuthenticated]);

  const { register, handleSubmit, watch, setValue, getValues } = useForm<AddressFormData>({
    defaultValues: {
      addressType: initialData?.addressType || 'Home',
      recipientPhone: initialData?.recipientPhone || '',
      recipientName: initialData?.recipientName || '',
      buildingName: initialData?.buildingName || '',
      floor: initialData?.floor || '',
      streetArea: initialData?.streetArea || '',
      landmark: initialData?.landmark || '',
      postalCode: initialData?.postalCode || '',
    },
  });

  const addressType = watch('addressType');
  const recipientPhone = watch('recipientPhone');

  const { data: phoneCheckData } = useCheckPhone(
    `+91${recipientPhone}`,
    shouldCheckPhone && recipientPhone.length >= 10
  );

  React.useEffect(() => {
    if ((phoneCheckData as any)?.checkPhoneExists?.requiresLogin) {
      if (!hasShownAlertRef.current || lastCheckedPhoneRef.current !== recipientPhone) {
        const currentFormData = getValues();
        toast.error('This number is already registered. Please login first to continue.', {
          duration: 4000,
          position: 'top-center',
        });
        onPhoneValidationFailed(`+91${recipientPhone}`, currentFormData);
        hasShownAlertRef.current = true;
        lastCheckedPhoneRef.current = recipientPhone;
      }
      setShouldCheckPhone(false);
    }
  }, [phoneCheckData, recipientPhone, getValues]);

  React.useEffect(() => {
    if (recipientPhone !== lastCheckedPhoneRef.current) {
      hasShownAlertRef.current = false;
    }
  }, [recipientPhone]);

  const handlePhoneBlur = () => {
    if (recipientPhone.length >= 10) {
      setShouldCheckPhone(true);
    }
  };

  const onSubmit = async (data: AddressFormData) => {
    console.log('Form submitted with data:', data);
    await onSave(data);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40"
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
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add Address Details</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Complete address would assist better us in serving you
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                <AddressTypeSelector
                  value={addressType}
                  onChange={(value) => setValue('addressType', value)}
                />

                <p className="text-sm text-gray-500">
                  Enter your details to experience seamless delivery
                </p>

                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                    Recipient Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="w-20 px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium">
                      +91
                    </div>
                    <input
                      type="tel"
                      {...register('recipientPhone', { required: true })}
                      onBlur={handlePhoneBlur}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4A6A] focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <FormInput
                  label="Recipient Name"
                  name="recipientName"
                  register={register}
                  required
                  placeholder="Enter recipient name"
                  validation={{ required: true }}
                />

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isOrderingForSomeoneElse"
                    {...register('isOrderingForSomeoneElse')}
                    className="w-4 h-4 text-[#0F4A6A] bg-gray-100 border-gray-300 rounded focus:ring-[#0F4A6A] focus:ring-2"
                  />
                  <label htmlFor="isOrderingForSomeoneElse" className="text-sm text-gray-700">
                    Ordering for someone else?
                  </label>
                </div>

                {watch('isOrderingForSomeoneElse') && !isAuthenticated && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Please provide your contact details (the person placing the order):</p>

                    <div>
                      <label className="block text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                        Your Phone Number
                      </label>
                      <div className="flex gap-2">
                        <div className="w-20 px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium">
                          +91
                        </div>
                        <input
                          type="tel"
                          {...register('placerPhone')}
                          className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4A6A] focus:border-transparent"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>

                    <FormInput
                      label="Your Email (optional)"
                      name="placerEmail"
                      register={register}
                      placeholder="Enter your email"
                    />
                  </div>
                )}

                {watch('isOrderingForSomeoneElse') && isAuthenticated && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      Your contact details will be automatically used for this order.
                    </p>
                  </div>
                )}

                <FormInput
                  label="Building Name"
                  name="buildingName"
                  register={register}
                  required
                  placeholder="Enter building name"
                  validation={{ required: true }}
                />

                <FormInput
                  label="Floor (optional)"
                  name="floor"
                  register={register}
                  placeholder="Enter floor number"
                />

                <FormInput
                  label="Street/Area (optional)"
                  name="streetArea"
                  register={register}
                  placeholder="Enter street or area"
                />

                <FormInput
                  label="Landmark (optional)"
                  name="landmark"
                  register={register}
                  placeholder="Enter nearby landmark"
                />

                <FormInput
                  label="Postal Code"
                  name="postalCode"
                  register={register}
                  required
                  placeholder="Enter postal code"
                  validation={{ required: true }}
                />
              </div>

              <button
                type="submit"
                className="w-full mt-6 bg-[#0F4A6A] text-white font-bold py-4 rounded-lg hover:bg-[#09354F] transition-colors"
              >
                Save Address
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
