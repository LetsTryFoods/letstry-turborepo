"use client"

import { useState, useMemo, useEffect } from "react"
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  IndianRupee,
  ShoppingBag,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  BarChart3,
  PieChart,
  Download,
  Search,
  Scale,
  Clock
} from "lucide-react"

// Dynamically import Recharts to avoid SSR issues
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false })
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false })
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false })
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false })

import {
  useReports,
  useShippingInsights,
  formatCurrency,
  formatCompactNumber
} from "@/lib/reports/useReports"
import { useTrackingAnalytics } from "@/lib/reports/useTrackingAnalytics"
import { getCdnUrl } from "@/lib/utils/image-utils"

import * as XLSX from 'xlsx'

const ChartTooltip = ({ active, payload, label, isCurrency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-lg shadow-sm">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-bold text-primary">
          {isCurrency ? formatCurrency(payload[0].value) : `${payload[0].value} Orders`}
        </p>
      </div>
    )
  }
  return null
}

export default function ReportsPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year' | 'all'>('month')
  const [productSortBy, setProductSortBy] = useState<'quantity' | 'revenue'>('quantity')

  const { data, loading } = useReports(period)
  const { summary, dailySales, topProducts, topCustomers, categorySales } = data

  const { data: trackingData } = useTrackingAnalytics()
  const { data: shippingData, loading: shippingLoading } = useShippingInsights()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const sortedProducts = useMemo(() => {
    return [...topProducts].sort((a, b) => {
      if (productSortBy === 'quantity') return b.soldQuantity - a.soldQuantity
      return b.revenue - a.revenue
    })
  }, [topProducts, productSortBy])

  const handleExport = () => {
    // Prepare data for Excel
    const exportData = sortedProducts.map((product, index) => ({
      'Rank': index + 1,
      'Product ID': product._id,
      'Product Name': product.name,
      'Image Link': getCdnUrl(product.image),
      'Quantity Sold': product.soldQuantity,
      'Total Revenue': product.revenue,
    }))

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Product Sales')

    // Generate filename based on period
    const fileName = `Product_Sales_Report_${period}_sorted_by_${productSortBy}_${new Date().toISOString().split('T')[0]}.xlsx`

    // Download file
    XLSX.writeFile(wb, fileName)
  }

  if (loading || shippingLoading || !isMounted) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const GrowthIndicator = ({ value, label }: { value: number; label: string }) => {
    const isPositive = value >= 0
    return (
      <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? (
          <ArrowUpRight className="h-3 w-3" />
        ) : (
          <ArrowDownRight className="h-3 w-3" />
        )}
        <span>{Math.abs(value)}% {label}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 mx-6 auto mb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Track your store performance and insights
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last 90 Days</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport} disabled={topProducts.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</div>
            <GrowthIndicator value={summary.revenueGrowth} label="vs last period" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalOrders}</div>
            <GrowthIndicator value={summary.ordersGrowth} label="vs last period" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCompactNumber(summary.totalCustomers)}</div>
            <GrowthIndicator value={summary.customersGrowth} label="vs last period" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.avgOrderValue)}</div>
            <p className="text-xs text-muted-foreground">Per order</p>
          </CardContent>
        </Card>
      </div>

      {/* Shipping Analytics (All Time) */}
      <h2 className="text-xl font-bold tracking-tight mt-8 mb-4">Shipping Insights (All Time)</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Shipment Weight</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shippingData?.avgWeight ? `${shippingData.avgWeight.toFixed(2)} kg` : 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Across all packed orders</p>
          </CardContent>
        </Card>
        {/* 
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Used Box</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shippingData?.mostUsedBox || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Most frequent packing box</p>
          </CardContent>
        </Card> */}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shippingData?.avgDeliveryDays ? `${shippingData.avgDeliveryDays} days avg` : 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              {shippingData?.maxDeliveryDays ? `Max ${shippingData.maxDeliveryDays} days` : 'From packed to delivered'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 mt-8">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue Trend
            </CardTitle>
            <CardDescription>Daily revenue performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailySales}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#888' }}
                    tickFormatter={(value) => value.split('-').slice(1).join('/')}
                    minTickGap={30}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#888' }}
                    tickFormatter={(value) => formatCompactNumber(value)}
                  />
                  <Tooltip content={<ChartTooltip isCurrency={true} />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Orders Trend
            </CardTitle>
            <CardDescription>Daily order volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#888' }}
                    tickFormatter={(value) => value.split('-').slice(1).join('/')}
                    minTickGap={30}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#888' }}
                  />
                  <Tooltip content={<ChartTooltip isCurrency={false} />} />
                  <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products & Categories Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Top Selling Products
              </CardTitle>
              <CardDescription>Best performers for this period</CardDescription>
            </div>
            <Select
              value={productSortBy}
              onValueChange={(v) => setProductSortBy(v as 'quantity' | 'revenue')}
            >
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quantity">Sort by Units</SelectItem>
                <SelectItem value="revenue">Sort by Revenue</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 pr-2">
              {sortedProducts.slice(0, 20).map((product, index) => (
                <div key={product._id} className="flex items-center gap-4">
                  <span className="text-lg font-bold text-muted-foreground w-6">
                    #{index + 1}
                  </span>
                  <img
                    src={getCdnUrl(product.image)}
                    alt={product.name}
                    className="h-10 w-10 rounded-md object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-product.png'
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.soldQuantity} sold
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(product.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Sales by Category
            </CardTitle>
            <CardDescription>Revenue distribution across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categorySales.map((category, index) => {
                const colors = [
                  'bg-primary',
                  'bg-blue-500',
                  'bg-green-500',
                  'bg-orange-500',
                  'bg-purple-500'
                ]
                return (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category.category}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(category.revenue)} ({category.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[index % colors.length]} rounded-full transition-all`}
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top Customers
          </CardTitle>
          <CardDescription>Customers with highest lifetime value</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {topCustomers.map((customer, index) => (
              <div
                key={customer._id}
                className="p-4 border rounded-lg text-center hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-primary">
                    {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <p className="font-medium truncate">{customer.name}</p>
                <p className="text-xs text-muted-foreground truncate mb-2">
                  {customer.email}
                </p>
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(customer.totalSpent)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {customer.totalOrders} orders
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Tracking Analytics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Track Searches</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trackingData?.getTrackingAnalytics?.totalSearches || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Searches</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trackingData?.getTrackingAnalytics?.successfulSearches || 0}</div>
            <p className="text-xs text-muted-foreground">
              {trackingData?.getTrackingAnalytics ? `${trackingData.getTrackingAnalytics.successRate.toFixed(1)}% success rate` : '0% success rate'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Search by Order ID</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trackingData?.getTrackingAnalytics?.searchTypeBreakdown.find(s => s._id === 'orderId')?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">Total searches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Search by Phone</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trackingData?.getTrackingAnalytics?.searchTypeBreakdown.find(s => s._id === 'phone')?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">Total searches</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tracking Searches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Recent Tracking Searches
          </CardTitle>
          <CardDescription>Latest order tracking search activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trackingData?.getTrackingAnalytics?.recentSearches.slice(0, 10).map((search) => (
              <div key={search.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${search.foundResult ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <p className="font-medium">
                      {search.searchType === 'phone' ? 'Phone' : search.searchType === 'orderId' ? 'Order ID' : 'AWB'}:
                      <span className="text-muted-foreground">{search.searchQuery}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(search.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${search.foundResult ? 'text-green-600' : 'text-red-600'}`}>
                    {search.foundResult ? 'Found' : 'Not Found'}
                  </p>
                  <p className="text-xs text-muted-foreground">{search.ipAddress}</p>
                </div>
              </div>
            ))}
            {(!trackingData?.getTrackingAnalytics?.recentSearches || trackingData.getTrackingAnalytics.recentSearches.length === 0) && (
              <p className="text-center text-muted-foreground py-8">No tracking searches yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
