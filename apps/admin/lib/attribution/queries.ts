import { useQuery } from "@apollo/client/react";
import { GET_ATTRIBUTION_ANALYTICS } from "../graphql/orders";

export interface AttributionSourceStat {
  sourceLabel: string;
  orderCount: number;
  totalRevenue: string;
}

export interface AttributionAnalytics {
  sources: AttributionSourceStat[];
  totalAttributedOrders: number;
  totalOrders: number;
}

export function useAttributionAnalytics(days = 30) {
  const { data, loading, error } = useQuery<{
    getAttributionAnalytics: AttributionAnalytics;
  }>(GET_ATTRIBUTION_ANALYTICS, {
    variables: { days },
    fetchPolicy: "cache-and-network",
  });

  return {
    data: data?.getAttributionAnalytics || null,
    loading,
    error,
  };
}
