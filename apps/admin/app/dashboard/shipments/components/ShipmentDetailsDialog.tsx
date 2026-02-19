import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useShipmentWithTracking } from '@/lib/shipments/queries'
import { Shipment } from '@/lib/shipments/types'
import {
  formatDate,
  formatWeight,
  formatCurrency,
  getServiceTypeLabel,
  copyToClipboard,
} from '@/lib/shipments/utils'
import { ShipmentStatusBadge } from './ShipmentStatusBadge'
import { TrackingTimeline } from './TrackingTimeline'
import { Copy, MapPin, Package, FileText, ExternalLink, Download } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface ShipmentDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  awbNumber: string
}

export function ShipmentDetailsDialog({ isOpen, onClose, awbNumber }: ShipmentDetailsDialogProps) {
  const { shipment, trackingHistory, loading } = useShipmentWithTracking(awbNumber)

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      toast.success(`${label} copied to clipboard`)
    }
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <Skeleton className="h-6 w-48" />
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!shipment) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                Shipment Details
                <ShipmentStatusBadge statusCode={shipment.currentStatusCode} />
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-muted-foreground">AWB:</span>
                <span className="text-sm font-mono">{shipment.dtdcAwbNumber}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleCopy(shipment.dtdcAwbNumber, 'AWB Number')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <Link href={`/dashboard/shipments/${shipment.id}`}>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Full Details
              </Button>
            </Link>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle className="text-sm">Shipment Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Order ID</div>
                  <div className="font-medium">{shipment.orderId || '-'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Service Type</div>
                  <div className="font-medium">{getServiceTypeLabel(shipment.serviceType)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Booked On</div>
                  <div className="font-medium">{formatDate(shipment.bookedOn)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Expected Delivery</div>
                  <div className="font-medium">{formatDate(shipment.expectedDeliveryDate)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Weight</div>
                  <div className="font-medium">{formatWeight(shipment.weight)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">COD Amount</div>
                  <div className="font-medium">{formatCurrency(shipment.codAmount)}</div>
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
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                {shipment.labelUrl && (
                  <Button className="w-full" asChild>
                    <a href={shipment.labelUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Print Label
                    </a>
                  </Button>
                )}
                {shipment.trackingLink && (
                  <Button variant="outline" className="w-full justify-start" onClick={() => handleCopy(shipment.trackingLink!, 'Tracking Link')}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Tracking Link
                  </Button>
                )}
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/dashboard/shipments/${shipment.id}`}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Full Details
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Origin</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                {shipment.originDetails ? (
                  <>
                    <div className="font-medium">{shipment.originDetails.name}</div>
                    <div>{shipment.originDetails.phone}</div>
                    <div className="text-muted-foreground">
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
                <CardTitle className="text-sm">Destination</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                {shipment.destinationDetails ? (
                  <>
                    <div className="font-medium">{shipment.destinationDetails.name}</div>
                    <div>{shipment.destinationDetails.phone}</div>
                    <div className="text-muted-foreground">
                      {shipment.destinationDetails.addressLine1}
                      {shipment.destinationDetails.addressLine2 && `, ${shipment.destinationDetails.addressLine2}`}
                    </div>
                    <div className="text-muted-foreground">
                      {shipment.destinationDetails.city}, {shipment.destinationDetails.state} - {shipment.destinationDetails.pincode}
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground">{shipment.destinationCity || '-'}</div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="h-4 w-4" />
                Package Details
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
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
              {shipment.invoiceNumber && (
                <div>
                  <div className="text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Invoice Number
                  </div>
                  <div className="font-medium">{shipment.invoiceNumber}</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Tracking History</CardTitle>
            </CardHeader>
            <CardContent>
              <TrackingTimeline trackingHistory={trackingHistory} />
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
