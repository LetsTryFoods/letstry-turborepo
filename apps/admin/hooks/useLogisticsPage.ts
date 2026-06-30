import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_MONTHLY_LOGISTICS_ANALYTICS, GET_MONTHLY_DISCOUNT_ANALYTICS } from '../lib/logistics/queries';
import { toast } from 'sonner';
import { useEffect } from 'react';

export function useLogisticsPage() {
  const currentDate = new Date();
  const [month, setMonth] = useState<number>(currentDate.getMonth() + 1);
  const [year, setYear] = useState<number>(currentDate.getFullYear());

  const { data: logData, loading: logLoading, error: logError, refetch: refetchLog } = useQuery(GET_MONTHLY_LOGISTICS_ANALYTICS, {
    variables: { month, year },
    fetchPolicy: 'network-only',
  });

  const { data: discData, loading: discLoading, error: discError, refetch: refetchDisc } = useQuery(GET_MONTHLY_DISCOUNT_ANALYTICS, {
    variables: { month, year },
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (logError) {
      toast.error(logError.message || 'Failed to load logistics analytics');
    }
    if (discError) {
      toast.error(discError.message || 'Failed to load discount analytics');
    }
  }, [logError, discError]);

  const analytics = (logData as any)?.getMonthlyLogisticsAnalytics;
  const discountAnalytics = (discData as any)?.getMonthlyDiscountAnalytics;

  return {
    state: {
      month,
      year,
      analytics,
      discountAnalytics,
      loading: logLoading || discLoading,
      error: logError || discError,
    },
    actions: {
      setMonth,
      setYear,
      refetch: () => {
        refetchLog();
        refetchDisc();
      },
    },
  };
}
