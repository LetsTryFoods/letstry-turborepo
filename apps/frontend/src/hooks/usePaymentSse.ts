import { useEffect, useRef, useState } from 'react';

interface PaymentStatusEvent {
  paymentOrderId: string;
  status: string;
  message?: string;
  type?: string;
}

interface UsePaymentSseOptions {
  paymentOrderId: string | null;
  onStatusChange: (event: PaymentStatusEvent) => void;
  onError?: (error: Error) => void;
}

export const usePaymentSse = ({
  paymentOrderId,
  onStatusChange,
  onError,
}: UsePaymentSseOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!paymentOrderId) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const sseUrl = `${apiUrl}/payment/status/${paymentOrderId}/stream`;

    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: PaymentStatusEvent = JSON.parse(event.data);
        onStatusChange(data);
      } catch (error) {
        console.error('[SSE] Failed to parse message:', error);
        onError?.(new Error('Failed to parse SSE message'));
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      onError?.(new Error('SSE connection error'));
      eventSource.close();
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [paymentOrderId, onStatusChange, onError]);

  const closeConnection = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      setIsConnected(false);
    }
  };

  return { isConnected, closeConnection };
};
