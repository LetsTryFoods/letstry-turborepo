import { useQuery } from '@apollo/client/react'
import { GET_DASHBOARD_STATS } from '@/lib/graphql/dashboard'

export interface DashboardStats {
  totalProducts: number
  archivedProducts: number
  inStockProducts: number
  outOfStockProducts: number
  totalCategories: number
  activeBanners: number
  totalAdmins: number
}

interface DashboardStatsQueryResult {
  dashboardStats: DashboardStats
}

export const useDashboardStats = () => {
  const { data, loading, error, refetch } = useQuery<DashboardStatsQueryResult>(GET_DASHBOARD_STATS)

  return {
    stats: data?.dashboardStats,
    loading,
    error,
    refetch
  }
}