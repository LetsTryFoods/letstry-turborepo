"use client"

import { useQuery } from "@apollo/client/react"
import { GET_ORDER_REPORTS } from "@/lib/graphql/reports"
import { useMemo } from "react"

export interface DailySales {
  date: string
  orders: number
  revenue: number
}

export interface TopProduct {
  _id: string
  name: string
  image: string
  soldQuantity: number
  revenue: number
}

export interface TopCustomer {
  _id: string
  name: string
  email: string
  totalOrders: number
  totalSpent: number
}

export interface CategorySales {
  category: string
  revenue: number
  percentage: number
}

export interface ReportSummary {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  avgOrderValue: number
  revenueGrowth: number
  ordersGrowth: number
  customersGrowth: number
}

export interface PlatformOrderStats {
  website: number
  app: number
}

export interface ReportsData {
  summary: ReportSummary
  dailySales: DailySales[]
  topProducts: TopProduct[]
  topCustomers: TopCustomer[]
  categorySales: CategorySales[]
  platformStats?: PlatformOrderStats
}

const emptyData: ReportsData = {
  summary: {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    avgOrderValue: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    customersGrowth: 0,
  },
  dailySales: [],
  topProducts: [],
  topCustomers: [],
  categorySales: [],
  platformStats: {
    website: 0,
    app: 0,
  },
}

// Hook to get reports data
export const useReports = (period: 'week' | 'month' | 'quarter' | 'year' | 'all' = 'month') => {
  const { data, loading, error, refetch } = useQuery<{ getOrderReports: ReportsData }>(GET_ORDER_REPORTS, {
    variables: { period },
    notifyOnNetworkStatusChange: true,
  })

  const reportsData = useMemo(() => {
    if (!data?.getOrderReports) return emptyData
    return data.getOrderReports as ReportsData
  }, [data])

  return {
    data: reportsData,
    loading,
    error,
    refetch,
  }
}

// Helper to format currency
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

// Helper to format compact numbers
export const formatCompactNumber = (num: number) => {
  if (num >= 100000) {
    return `${(num / 100000).toFixed(1)}L`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

export interface ShippingInsightsData {
  avgWeight: number
  mostUsedBox: string | null
  maxDeliveryDays: number
  avgDeliveryDays: number
}

// Hook to get shipping insights data
export const useShippingInsights = () => {
  const { GET_SHIPPING_INSIGHTS } = require('@/lib/graphql/reports')
  const { data, loading, error, refetch } = useQuery<{ getShippingInsights: ShippingInsightsData }>(GET_SHIPPING_INSIGHTS, {
    notifyOnNetworkStatusChange: true,
  })

  const insightsData = useMemo(() => {
    if (!data?.getShippingInsights) {
      return {
        avgWeight: 0,
        mostUsedBox: null,
        maxDeliveryDays: 0,
        avgDeliveryDays: 0,
      }
    }
    return data.getShippingInsights as ShippingInsightsData
  }, [data])

  return {
    data: insightsData,
    loading,
    error,
    refetch,
  }
}
