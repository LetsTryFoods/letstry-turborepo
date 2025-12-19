"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  useAbandonedCarts, 
  dummyAbandonedCarts, 
  getAbandonedCartStats, 
  AbandonedCart 
} from "@/lib/abandoned-carts/useAbandonedCarts"
import { CartTable } from "./components/CartTable"
import { CartDetailsDialog } from "./components/CartDetailsDialog"
import { WhatsAppDialog } from "./components/WhatsAppDialog"
import { SMSDialog } from "./components/SMSDialog"
import { 
  Search, 
  RefreshCw, 
  ShoppingCart, 
  Users, 
  IndianRupee,
  Clock,
  TrendingUp,
  MessageCircle
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function AbandonedCartsPage() {
  const [activityFilter, setActivityFilter] = useState<string>("ALL")
  const { data, loading, error, refetch } = useAbandonedCarts()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCart, setSelectedCart] = useState<AbandonedCart | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false)
  const [isSMSOpen, setIsSMSOpen] = useState(false)

  const carts: AbandonedCart[] = (data as any)?.abandonedCarts || []
  const stats = getAbandonedCartStats(dummyAbandonedCarts)

  // Filter carts based on activity
  const filterByActivity = (cart: AbandonedCart) => {
    if (activityFilter === "ALL") return true
    
    const now = new Date()
    const activityDate = new Date(cart.lastActivity)
    const hoursDiff = (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60)

    switch (activityFilter) {
      case "TODAY":
        return hoursDiff < 24
      case "3DAYS":
        return hoursDiff < 72
      case "WEEK":
        return hoursDiff < 168
      case "OLDER":
        return hoursDiff >= 168
      default:
        return true
    }
  }

  // Filter carts based on search and activity
  const filteredCarts = carts
    .filter(filterByActivity)
    .filter(cart =>
      cart.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cart.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cart.customer.phone.includes(searchTerm) ||
      cart.items.some(item => item.product.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )

  const handleViewDetails = (cart: AbandonedCart) => {
    setSelectedCart(cart)
    setIsDetailsOpen(true)
  }

  const handleSendWhatsApp = (cart: AbandonedCart) => {
    setSelectedCart(cart)
    setIsWhatsAppOpen(true)
  }

  const handleSendSMS = (cart: AbandonedCart) => {
    setSelectedCart(cart)
    setIsSMSOpen(true)
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading abandoned carts: {(error as Error)?.message || 'Unknown error'}</p>
            <Button onClick={() => refetch()} variant="outline" className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Abandoned Carts</h1>
          <p className="text-muted-foreground">
            Track customers who added items but didn&apos;t complete purchase
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Abandoned</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{stats.totalItems} items total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₹{stats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Avg: ₹{stats.averageCartValue.toLocaleString()}/cart</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.last24Hours}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.last7Days}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">Recover Lost Sales</h3>
                <p className="text-sm text-green-700">Send WhatsApp reminders to customers with abandoned carts</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-100">
                <Users className="h-4 w-4 mr-2" />
                {filteredCarts.length} Customers
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name, email, phone or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={activityFilter} onValueChange={setActivityFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by activity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Carts</SelectItem>
                <SelectItem value="TODAY">Active Today</SelectItem>
                <SelectItem value="3DAYS">Last 3 Days</SelectItem>
                <SelectItem value="WEEK">This Week</SelectItem>
                <SelectItem value="OLDER">Older</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Carts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Abandoned Carts ({filteredCarts.length})</span>
            {searchTerm && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSearchTerm("")}
              >
                Clear search
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CartTable
            carts={filteredCarts}
            onViewDetails={handleViewDetails}
            onSendWhatsApp={handleSendWhatsApp}
            onSendSMS={handleSendSMS}
          />
        </CardContent>
      </Card>

      {/* Cart Details Dialog */}
      <CartDetailsDialog
        cart={selectedCart}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onSendWhatsApp={handleSendWhatsApp}
        onSendSMS={handleSendSMS}
      />

      {/* WhatsApp Dialog */}
      <WhatsAppDialog
        cart={selectedCart}
        open={isWhatsAppOpen}
        onOpenChange={setIsWhatsAppOpen}
      />

      {/* SMS Dialog */}
      <SMSDialog
        cart={selectedCart}
        open={isSMSOpen}
        onOpenChange={setIsSMSOpen}
      />
    </div>
  )
}