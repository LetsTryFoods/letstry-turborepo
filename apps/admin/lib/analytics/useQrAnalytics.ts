import { useQuery } from "@apollo/client/react";
import { GET_QR_ANALYTICS } from "@/lib/graphql/analytics";

export interface OSSplit {
  android: number;
  ios: number;
  windows: number;
  macOS: number;
  other: number;
}

export interface QRScanItem {
  fingerprint: string;
  device: string;
  os: string;
  userAgent: string;
  ipAddress: string;
  location: string;
  timesScanned: number;
  dateTime: string[];
}

export interface QRAnalyticsSummary {
  totalScans: number;
  uniqueScans: number;
  totalOSSplit: OSSplit;
  uniqueOSSplit: OSSplit;
  recentScans: QRScanItem[];
}

interface QrAnalyticsQueryResult {
  qrAnalytics: QRAnalyticsSummary;
}

export const useQrAnalytics = () => {
  const { data, loading, error, refetch } = useQuery<QrAnalyticsQueryResult>(
    GET_QR_ANALYTICS,
    {
      fetchPolicy: "cache-and-network",
    },
  );

  return {
    analytics: data?.qrAnalytics,
    loading,
    error,
    refetch,
  };
};
