import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Loader2, Lock } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql/client-factory';
import { INITIATE_PAYMENT } from '@/lib/queries/payment';
import { FormInput } from './FormInput';
import { getOrCreateIdempotencyKey, clearIdempotencyKey } from '@/lib/utils/idempotency';

interface CardPaymentProps {
  cartId: string;
  amount: string;
  userDetails: {
    email: string;
    name: string;
    phone: string;
  };
}

interface CardFormData {
  cardNumber: string;
  nameOnCard: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export const CardPayment: React.FC<CardPaymentProps> = ({
  cartId,
  amount,
  userDetails,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<CardFormData>();

  const { mutate: initiatePayment, isPending } = useMutation({
    mutationFn: async (data: CardFormData) => {
      const idempotencyKey = getOrCreateIdempotencyKey();
      const response = await graphqlClient.request(INITIATE_PAYMENT, {
        input: {
          cartId,
          idempotencyKey,
        },
      });
      return response.initiatePayment;
    },
    onSuccess: (data) => {
      clearIdempotencyKey();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.errors?.[0]?.message || 'Payment failed. Please try again.';
      
      if (errorMessage.includes('Cart has changed')) {
        clearIdempotencyKey();
      }
      
      console.error('Payment failed:', error);
      setError('root', {
        message: errorMessage,
      });
    },
  });

  useEffect(() => {
    return () => {
      clearIdempotencyKey();
    };
  }, [amount]);

  const onSubmit = (data: CardFormData) => {
    initiatePayment(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          label="Card Number"
          name="cardNumber"
          register={register}
          required
          placeholder="0000 0000 0000 0000"
          validation={{
            required: 'Card number is required',
            pattern: {
              value: /^[0-9\s]{16,19}$/,
              message: 'Invalid card number',
            },
          }}
        />
        {errors.cardNumber && (
          <p className="text-xs text-red-500 mt-1">{errors.cardNumber.message}</p>
        )}

        <FormInput
          label="Name on Card"
          name="nameOnCard"
          register={register}
          required
          placeholder="JOHN DOE"
          validation={{ required: 'Name on card is required' }}
        />
        {errors.nameOnCard && (
          <p className="text-xs text-red-500 mt-1">{errors.nameOnCard.message}</p>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div>
            <FormInput
              label="Month"
              name="expiryMonth"
              register={register}
              required
              placeholder="MM"
              validation={{
                required: 'Required',
                pattern: { value: /^(0[1-9]|1[0-2])$/, message: 'Invalid' },
              }}
            />
            {errors.expiryMonth && (
              <p className="text-xs text-red-500 mt-1">{errors.expiryMonth.message}</p>
            )}
          </div>
          <div>
            <FormInput
              label="Year"
              name="expiryYear"
              register={register}
              required
              placeholder="YYYY"
              validation={{
                required: 'Required',
                pattern: { value: /^[2-9][0-9]{3}$/, message: 'Invalid' },
              }}
            />
            {errors.expiryYear && (
              <p className="text-xs text-red-500 mt-1">{errors.expiryYear.message}</p>
            )}
          </div>
          <div>
            <FormInput
              label="CVV"
              name="cvv"
              register={register}
              required
              type="password"
              placeholder="123"
              validation={{
                required: 'Required',
                pattern: { value: /^[0-9]{3,4}$/, message: 'Invalid' },
              }}
            />
            {errors.cvv && (
              <p className="text-xs text-red-500 mt-1">{errors.cvv.message}</p>
            )}
          </div>
        </div>

        {errors.root && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
            {errors.root.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-6 bg-[#0F4A6A] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#09354d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              Pay ₹{amount}
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};
