import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_MONTHLY_LOGISTICS_ANALYTICS } from '../lib/logistics/queries';
import { toast } from 'sonner';
import { useEffect } from 'react';

export function useLogisticsPage() {
  const currentDate = new Date();
  const [month, setMonth] = useState<number>(currentDate.getMonth() + 1);
  const [year, setYear] = useState<number>(currentDate.getFullYear());

  const { data, loading, error, refetch } = useQuery(GET_MONTHLY_LOGISTICS_ANALYTICS, {
    variables: { month, year },
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to load logistics analytics');
    }
  }, [error]);

  const analytics = (data as any)?.getMonthlyLogisticsAnalytics;

  return {
    state: {
      month,
      year,
      analytics,
      loading,
      error,
    },
    actions: {
      setMonth,
      setYear,
      refetch,
    },
  };
}
