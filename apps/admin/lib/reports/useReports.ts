"use client"

import { useQuery } from "@apollo/client"
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

export interface ReportsData {
  summary: ReportSummary
  dailySales: DailySales[]
  topProducts: TopProduct[]
  topCustomers: TopCustomer[]
  categorySales: CategorySales[]
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
}

// Hook to get reports data
export const useReports = (period: 'week' | 'month' | 'quarter' | 'year' = 'month') => {
  const { data, loading, error, refetch } = useQuery(GET_ORDER_REPORTS, {
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
