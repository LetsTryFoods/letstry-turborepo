"use client"

import { useState, useMemo } from "react"
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
  Download
} from "lucide-react"
import { 
  useReports,
  formatCurrency,
  formatCompactNumber
} from "@/lib/reports/useReports"

export default function ReportsPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  
  const { data } = useReports(period)
  const { summary, dailySales, topProducts, topCustomers, categorySales } = data

  // Calculate max values for chart scaling
  const maxRevenue = Math.max(...dailySales.map(d => d.revenue))
  const maxOrders = Math.max(...dailySales.map(d => d.orders))

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
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
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

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue Trend
            </CardTitle>
            <CardDescription>Daily revenue for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-end gap-1">
              {dailySales.slice(-14).map((day, index) => {
                const height = (day.revenue / maxRevenue) * 100
                return (
                  <div
                    key={index}
                    className="flex-1 bg-primary/80 hover:bg-primary rounded-t transition-all cursor-pointer group relative"
                    style={{ height: `${Math.max(height, 5)}%` }}
                    title={`${day.date}: ${formatCurrency(day.revenue)}`}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                      {formatCurrency(day.revenue)}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{dailySales.slice(-14)[0]?.date.slice(5)}</span>
              <span>{dailySales.slice(-1)[0]?.date.slice(5)}</span>
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
            <CardDescription>Daily orders for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-end gap-1">
              {dailySales.slice(-14).map((day, index) => {
                const height = (day.orders / maxOrders) * 100
                return (
                  <div
                    key={index}
                    className="flex-1 bg-blue-500/80 hover:bg-blue-500 rounded-t transition-all cursor-pointer group relative"
                    style={{ height: `${Math.max(height, 5)}%` }}
                    title={`${day.date}: ${day.orders} orders`}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                      {day.orders} orders
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{dailySales.slice(-14)[0]?.date.slice(5)}</span>
              <span>{dailySales.slice(-1)[0]?.date.slice(5)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products & Categories Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Top Selling Products
            </CardTitle>
            <CardDescription>Best performers by quantity sold</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.slice(0, 5).map((product, index) => (
                <div key={product._id} className="flex items-center gap-4">
                  <span className="text-lg font-bold text-muted-foreground w-6">
                    #{index + 1}
                  </span>
                  <img
                    src={product.image}
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
                        {formatCurrency(category.revenue)} ({category.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[index]} rounded-full transition-all`}
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
    </div>
  )
}
