import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Loader2, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql/client-factory';
import { INITIATE_UPI_QR_PAYMENT } from '@/lib/queries/payment';
import { usePaymentSse } from '@/hooks/usePaymentSse';

interface UpiQrPaymentProps {
  cartId: string;
  amount: string;
  userDetails: {
    email: string;
    name: string;
    phone: string;
  };
}

export const UpiQrPayment: React.FC<UpiQrPaymentProps> = ({
  cartId,
  amount,
  userDetails,
}) => {
  const [qrData, setQrData] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | null>(null);

  const { mutate: initiatePayment, isPending, error } = useMutation({
    mutationFn: async () => {
      const response = await graphqlClient.request(INITIATE_UPI_QR_PAYMENT, {
        input: {
          cartId,
          buyerEmail: userDetails.email,
          buyerName: userDetails.name,
          buyerPhone: userDetails.phone,
        },
      });
      return response.initiateUpiQrPayment;
    },
    onSuccess: (data) => {
      setQrData(data.qrCodeData || data.qrCodeUrl);
      setPaymentOrderId(data.paymentOrderId);
      if (data.expiresAt) {
        setExpiresAt(data.expiresAt);
      }
    },
  });

  const handlePaymentStatusChange = useCallback((event: any) => {
    console.log('[Payment] Status change event:', event);
    
    if (event.type === 'connected') {
      console.log('[Payment] SSE connection confirmed');
      return;
    }
    
    if (event.status === 'SUCCESS') {
      console.log('[Payment] Setting status to success');
      setPaymentStatus('success');
    } else if (event.status === 'FAILED') {
      console.log('[Payment] Setting status to failed');
      setPaymentStatus('failed');
    } else {
      console.log('[Payment] Unknown status:', event.status);
    }
  }, []);

  const { isConnected } = usePaymentSse({
    paymentOrderId,
    onStatusChange: handlePaymentStatusChange,
  });

  useEffect(() => {
    initiatePayment();
  }, []);

  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      
      setTimeLeft(diff);

      if (diff === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isPending && !qrData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-10 h-10 text-[#0F4A6A] animate-spin mb-4" />
        <p className="text-gray-500">Generating UPI QR Code...</p>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-gray-600 max-w-xs mx-auto">
          Your payment has been confirmed. Redirecting...
        </p>
      </motion.div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Failed</h3>
        <p className="text-gray-600 mb-6 max-w-xs mx-auto">
          Your payment could not be processed. Please try again.
        </p>
        <button
          onClick={() => {
            setPaymentStatus(null);
            setQrData(null);
            initiatePayment();
          }}
          className="px-6 py-2 bg-[#0F4A6A] text-white rounded-lg hover:bg-[#09354d] transition-colors"
        >
          Retry Payment
        </button>
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <RefreshCw className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to generate QR</h3>
        <p className="text-gray-500 mb-6 max-w-xs mx-auto">
          {(error as any).response?.errors?.[0]?.message || 'Something went wrong. Please try again.'}
        </p>
        <button
          onClick={() => initiatePayment()}
          className="px-6 py-2 bg-[#0F4A6A] text-white rounded-lg hover:bg-[#09354d] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center"
    >
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        {qrData && (
          // Check if it's a Base64 string (not a UPI URL)
          !qrData.startsWith('upi://') && !qrData.startsWith('http') ? (
            <img 
              src={qrData.startsWith('data:image') ? qrData : `data:image/png;base64,${qrData}`}
              alt="UPI QR Code" 
              className="w-[200px] h-[200px] object-contain"
            />
          ) : (
            <QRCodeSVG
              value={qrData}
              size={200}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "/logo.png",
                x: undefined,
                y: undefined,
                height: 24,
                width: 24,
                excavate: true,
              }}
            />
          )
        )}
      </div>

      <div className="text-center mb-8">
        <p className="text-sm text-gray-500 mb-1">Scan with any UPI app</p>
        <div className="flex items-center justify-center gap-2 text-[#0F4A6A] font-medium">
          <span className="text-2xl font-bold">₹{amount}</span>
        </div>
        {timeLeft > 0 && (
          <p className="text-xs text-orange-600 mt-2 font-medium">
            Expires in {formatTime(timeLeft)}
          </p>
        )}
        {isConnected && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-xs text-gray-600">Waiting for payment...</p>
          </div>
        )}
      </div>

      <div className="w-full max-w-xs space-y-3">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
            <span className="text-xs font-bold text-gray-600">1</span>
          </div>
          <p className="text-sm text-gray-600">Open any UPI app (GPay, PhonePe, Paytm)</p>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
            <span className="text-xs font-bold text-gray-600">2</span>
          </div>
          <p className="text-sm text-gray-600">Scan the QR code above</p>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
            <span className="text-xs font-bold text-gray-600">3</span>
          </div>
          <p className="text-sm text-gray-600">Complete payment on your phone</p>
        </div>
      </div>
    </motion.div>
  );
};
