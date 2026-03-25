import { useQuery } from '@apollo/client/react';
import { GET_TRACKING_ANALYTICS } from '@/lib/graphql/tracking';

export interface TrackingAnalytics {
  totalSearches: number;
  successfulSearches: number;
  successRate: number;
  searchTypeBreakdown: Array<{
    _id: string;
    count: number;
  }>;
  recentSearches: Array<{
    id: string;
    searchQuery: string;
    searchType: string;
    foundResult: boolean;
    createdAt: string;
    userAgent: string;
    ipAddress: string;
  }>;
}

export function useTrackingAnalytics(
  startDate?: string,
  endDate?: string,
  limit: number = 100
) {
  return useQuery<{ getTrackingAnalytics: TrackingAnalytics }>(GET_TRACKING_ANALYTICS, {
    variables: { startDate, endDate, limit },
    fetchPolicy: 'cache-and-network',
  });
}