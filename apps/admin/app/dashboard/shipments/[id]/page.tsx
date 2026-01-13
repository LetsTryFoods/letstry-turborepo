"use client"

import { use, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { useShipmentById, useCancelShipment } from "@/lib/shipments/queries"
import { ShipmentStatusBadge } from "../components/ShipmentStatusBadge"
import { TrackingTimeline } from "../components/TrackingTimeline"
import { CancelShipmentDialog } from "../components/CancelShipmentDialog"
import {
  formatDate,
  formatWeight,
  formatCurrency,
  getServiceTypeLabel,
  copyToClipboard,
} from "@/lib/shipments/utils"
import {
  RefreshCw,
  Copy,
  Download,
  XCircle,
  Package,
  MapPin,
  FileText,
  Truck,
  ArrowLeft,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

interface ShipmentDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ShipmentDetailPage({ params }: ShipmentDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { shipment, loading, error, refetch } = useShipmentById(id)
  const { cancelShipment: performCancel } = useCancelShipment()
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      toast.success(`${label} copied to clipboard`)
    }
  }

  const handleConfirmCancel = async () => {
    if (!shipment) return

    try {
      await performCancel({ awbNumber: shipment.dtdcAwbNumber })
      toast.success("Shipment cancelled successfully")
      refetch()
      router.push("/dashboard/shipments")
    } catch (error) {
      toast.error("Failed to cancel shipment")
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-6 w-96" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (error || !shipment) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">
              {error ? `Error loading shipment: ${(error as Error)?.message}` : "Shipment not found"}
            </p>
            <Button onClick={() => router.back()} variant="outline" className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Shipment Details</h1>
          <p className="text-muted-foreground">
            Track and manage shipment information
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight font-mono">
              {shipment.dtdcAwbNumber}
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopy(shipment.dtdcAwbNumber, "AWB Number")}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <ShipmentStatusBadge statusCode={shipment.currentStatusCode} />
          </div>
          <p className="text-muted-foreground mt-1">
            Shipment tracking and details
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {shipment.labelUrl && (
            <Button asChild variant="outline" size="sm">
              <a href={shipment.labelUrl} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Label
              </a>
            </Button>
          )}
          {!shipment.isCancelled && !shipment.isDelivered && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsCancelDialogOpen(true)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Shipment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Order ID</div>
                <div className="font-medium">
                  {shipment.orderId ? (
                    <Link
                      href={`/dashboard/orders/${shipment.orderId}`}
                      className="text-primary hover:underline"
                    >
                      {shipment.orderId}
                    </Link>
                  ) : (
                    "-"
                  )}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Customer Code</div>
                <div className="font-medium">{shipment.customerCode}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Service Type</div>
                <div className="font-medium">{getServiceTypeLabel(shipment.serviceType)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Load Type</div>
                <div className="font-medium">{shipment.loadType}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Booked On</div>
                <div className="font-medium">{formatDate(shipment.bookedOn)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Expected Delivery</div>
                <div className="font-medium">{formatDate(shipment.expectedDeliveryDate)}</div>
              </div>
              {shipment.revisedExpectedDeliveryDate && (
                <div className="col-span-2">
                  <div className="text-muted-foreground">Revised Delivery Date</div>
                  <div className="font-medium">{formatDate(shipment.revisedExpectedDeliveryDate)}</div>
                </div>
              )}
              <div>
                <div className="text-muted-foreground">Weight</div>
                <div className="font-medium">{formatWeight(shipment.weight)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Declared Value</div>
                <div className="font-medium">{formatCurrency(shipment.declaredValue)}</div>
              </div>
              {shipment.currentLocation && (
                <div className="col-span-2">
                  <div className="text-muted-foreground">Current Location</div>
                  <div className="font-medium flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {shipment.currentLocation}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Origin Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {shipment.originDetails ? (
              <>
                <div className="font-medium text-base">{shipment.originDetails.name}</div>
                <div>{shipment.originDetails.phone}</div>
                {shipment.originDetails.alternatePhone && (
                  <div className="text-muted-foreground">{shipment.originDetails.alternatePhone}</div>
                )}
                <div className="text-muted-foreground pt-2">
                  {shipment.originDetails.addressLine1}
                  {shipment.originDetails.addressLine2 && `, ${shipment.originDetails.addressLine2}`}
                </div>
                <div className="text-muted-foreground">
                  {shipment.originDetails.city}, {shipment.originDetails.state} - {shipment.originDetails.pincode}
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">{shipment.originCity}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Destination Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {shipment.destinationDetails ? (
              <>
                <div className="font-medium text-base">{shipment.destinationDetails.name}</div>
                <div>{shipment.destinationDetails.phone}</div>
                {shipment.destinationDetails.alternatePhone && (
                  <div className="text-muted-foreground">{shipment.destinationDetails.alternatePhone}</div>
                )}
                <div className="text-muted-foreground pt-2">
                  {shipment.destinationDetails.addressLine1}
                  {shipment.destinationDetails.addressLine2 && `, ${shipment.destinationDetails.addressLine2}`}
                </div>
                <div className="text-muted-foreground">
                  {shipment.destinationDetails.city}, {shipment.destinationDetails.state} - {shipment.destinationDetails.pincode}
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">{shipment.destinationCity || "-"}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Package Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {shipment.dimensions && (
              <div>
                <div className="text-muted-foreground">Dimensions</div>
                <div className="font-medium">
                  {shipment.dimensions.length} × {shipment.dimensions.width} × {shipment.dimensions.height} {shipment.dimensions.unit}
                </div>
              </div>
            )}
            <div>
              <div className="text-muted-foreground">Number of Pieces</div>
              <div className="font-medium">{shipment.numPieces}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Declared Value</div>
              <div className="font-medium">{formatCurrency(shipment.declaredValue)}</div>
            </div>
          </CardContent>
        </Card>

        {(shipment.invoiceNumber || shipment.ewayBill) && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice & Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {shipment.invoiceNumber && (
                <div>
                  <div className="text-muted-foreground">Invoice Number</div>
                  <div className="font-medium">{shipment.invoiceNumber}</div>
                </div>
              )}
              {shipment.invoiceDate && (
                <div>
                  <div className="text-muted-foreground">Invoice Date</div>
                  <div className="font-medium">{formatDate(shipment.invoiceDate)}</div>
                </div>
              )}
              {shipment.ewayBill && (
                <div>
                  <div className="text-muted-foreground">E-way Bill</div>
                  <div className="font-medium">{shipment.ewayBill}</div>
                </div>
              )}
              {shipment.commodityId && (
                <div>
                  <div className="text-muted-foreground">Commodity ID</div>
                  <div className="font-medium">{shipment.commodityId}</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Tracking History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TrackingTimeline trackingHistory={[]} />
        </CardContent>
      </Card>

      <CancelShipmentDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={handleConfirmCancel}
        awbNumber={shipment.dtdcAwbNumber}
      />
    </div>
  )
}
