"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useAllShipments,
  useCancelShipment,
} from "@/lib/shipments/queries"
import { Shipment, ShipmentStatusCode } from "@/lib/shipments/types"
import { getShipmentStats } from "@/lib/shipments/utils"
import { ShipmentTable } from "./components/ShipmentTable"
import { ShipmentFilters } from "./components/ShipmentFilters"
import { ShipmentDetailsDialog } from "./components/ShipmentDetailsDialog"
import { CancelShipmentDialog } from "./components/CancelShipmentDialog"
import {
  RefreshCw,
  Package,
  Truck,
  CheckCircle,
  Clock,
  RotateCcw,
  XCircle,
} from "lucide-react"
import { toast } from "react-hot-toast"

export default function ShipmentsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [cancelShipment, setCancelShipment] = useState<Shipment | null>(null)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)

  const { shipments, loading, error, refetch } = useAllShipments({
    statusCode: statusFilter !== "ALL" ? statusFilter : undefined,
    bookedFrom: dateRange.from,
    bookedTo: dateRange.to,
  })

  const { cancelShipment: performCancel } = useCancelShipment()

  const stats = getShipmentStats(shipments)

  const filteredShipments = shipments.filter((shipment) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      shipment.dtdcAwbNumber.toLowerCase().includes(term) ||
      shipment.orderId?.toLowerCase().includes(term) ||
      shipment.customerCode.toLowerCase().includes(term)
    )
  })

  const handleViewDetails = (shipment: Shipment) => {
    setSelectedShipment(shipment)
    setIsDetailsOpen(true)
  }

  const handleCancelShipment = (shipment: Shipment) => {
    setCancelShipment(shipment)
    setIsCancelDialogOpen(true)
  }

  const handleConfirmCancel = async () => {
    if (!cancelShipment) return

    try {
      await performCancel({ awbNumber: cancelShipment.dtdcAwbNumber })
      toast.success("Shipment cancelled successfully")
      refetch()
    } catch (error) {
      toast.error("Failed to cancel shipment")
    }
  }

  const handleClearFilters = () => {
    setStatusFilter("ALL")
    setSearchTerm("")
    setDateRange({})
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
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
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
            <p className="text-destructive">
              Error loading shipments: {(error as Error)?.message || "Unknown error"}
            </p>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shipments</h1>
          <p className="text-muted-foreground">
            Track and manage all shipments
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalShipments}</div>
            <p className="text-xs text-muted-foreground">All shipments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inTransit}</div>
            <p className="text-xs text-muted-foreground">On the way</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.deliveredToday}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RTO</CardTitle>
            <RotateCcw className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.rtoCount}</div>
            <p className="text-xs text-muted-foreground">Returning</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <XCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.cancelled}</div>
            <p className="text-xs text-muted-foreground">Terminated</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <ShipmentFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onClearFilters={handleClearFilters}
          />
        </CardContent>
      </Card>

      <ShipmentTable
        shipments={filteredShipments}
        onViewDetails={handleViewDetails}
        onCancelShipment={handleCancelShipment}
      />

      {selectedShipment && (
        <ShipmentDetailsDialog
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          awbNumber={selectedShipment.dtdcAwbNumber}
        />
      )}

      {cancelShipment && (
        <CancelShipmentDialog
          isOpen={isCancelDialogOpen}
          onClose={() => setIsCancelDialogOpen(false)}
          onConfirm={handleConfirmCancel}
          awbNumber={cancelShipment.dtdcAwbNumber}
        />
      )}
    </div>
  )
}
