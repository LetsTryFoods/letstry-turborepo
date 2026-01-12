import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Lock } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql/client-factory';
import { INITIATE_PAYMENT } from '@/lib/queries/payment';
import { getOrCreateIdempotencyKey, clearIdempotencyKey } from '@/lib/utils/idempotency';

interface ExpressCheckoutProps {
    cartId: string;
    amount: string;
    userDetails: {
        email: string;
        name: string;
        phone: string;
    };
}

export const ExpressCheckout: React.FC<ExpressCheckoutProps> = ({
    cartId,
    amount,
}) => {
    const { mutate: initiatePayment, isPending, error } = useMutation({
        mutationFn: async () => {
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
            if (data.redirectUrl) {
                window.location.href = data.redirectUrl;
            }
        },
        onError: (error: any) => {
            const errorMessage = error.response?.errors?.[0]?.message;
            if (errorMessage?.includes('Cart has changed')) {
                clearIdempotencyKey();
            }
        },
    });

    useEffect(() => {
        return () => {
            clearIdempotencyKey();
        };
    }, [amount]);

    const handlePayment = () => {
        initiatePayment();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                    {(error as any).response?.errors?.[0]?.message || 'Payment failed. Please try again.'}
                </div>
            )}

            <button
                onClick={handlePayment}
                disabled={isPending}
                className="w-full bg-[#0F4A6A] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#09354d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

            <p className="text-xs text-gray-500 text-center">
                You will be redirected to secure payment gateway
            </p>
        </motion.div>
    );
};
