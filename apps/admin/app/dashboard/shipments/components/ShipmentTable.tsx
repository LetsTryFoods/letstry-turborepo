import { useState } from 'react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Shipment } from '@/lib/shipments/types'
import {
  formatDate,
  formatWeight,
  formatCurrency,
  getRouteDisplay,
  copyToClipboard,
} from '@/lib/shipments/utils'
import { ShipmentStatusBadge } from './ShipmentStatusBadge'
import { MoreHorizontal, Eye, Copy, XCircle, Download, MapPin } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useShipmentLabel } from '@/lib/shipments/queries'

interface ShipmentTableProps {
  shipments: Shipment[]
  onViewDetails: (shipment: Shipment) => void
  onCancelShipment: (shipment: Shipment) => void
}

export function ShipmentTable({ shipments, onViewDetails, onCancelShipment }: ShipmentTableProps) {
  const { downloadLabel } = useShipmentLabel()

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      toast.success(`${label} copied to clipboard`)
    }
  }

  if (shipments.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No shipments found</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>AWB Number</TableHead>
            <TableHead>Order ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Booked On</TableHead>
            <TableHead>Expected Delivery</TableHead>
            <TableHead>Weight</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shipments.map((shipment) => (
            <TableRow key={shipment.id}>
              <TableCell className="font-mono text-sm">
                <div className="flex items-center gap-2">
                  {shipment.dtdcAwbNumber}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCopy(shipment.dtdcAwbNumber, 'AWB Number')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                {shipment.orderId ? (
                  <Link
                    href={`/dashboard/orders/${shipment.orderId}`}
                    className="text-primary hover:underline"
                  >
                    {shipment.orderId}
                  </Link>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                <ShipmentStatusBadge statusCode={shipment.currentStatusCode} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  {getRouteDisplay(shipment.originCity, shipment.destinationCity)}
                </div>
              </TableCell>
              <TableCell className="text-sm">{formatDate(shipment.bookedOn)}</TableCell>
              <TableCell className="text-sm">
                {formatDate(shipment.expectedDeliveryDate)}
              </TableCell>
              <TableCell className="text-sm">{formatWeight(shipment.weight)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails(shipment)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/shipments/${shipment.id}`}>
                        <MapPin className="mr-2 h-4 w-4" />
                        Track Shipment
                      </Link>
                    </DropdownMenuItem>
                    {shipment.trackingLink && (
                      <DropdownMenuItem onClick={() => handleCopy(shipment.trackingLink!, 'Tracking Link')}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Tracking Link
                      </DropdownMenuItem>
                    )}
                    {!shipment.isCancelled && !shipment.isDelivered && (
                      <DropdownMenuItem onClick={() => downloadLabel(shipment.dtdcAwbNumber)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Label
                      </DropdownMenuItem>
                    )}
                    {!shipment.isCancelled && !shipment.isDelivered && (
                      <DropdownMenuItem
                        onClick={() => onCancelShipment(shipment)}
                        className="text-destructive"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel Shipment
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
