import { ShipmentStatusCode, ShipmentSummary } from './types'
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  RotateCcw,
  XCircle,
  AlertCircle,
  PackageCheck,
  Home,
} from 'lucide-react'

export const formatStatusCode = (code?: string): string => {
  if (!code) return 'Unknown'

  const statusMap: Record<string, string> = {
    BKD: 'Booked',
    PUP: 'Picked Up',
    ITM: 'In Transit',
    OFD: 'Out for Delivery',
    DLV: 'Delivered',
    NONDLV: 'Not Delivered',
    RTO: 'Return to Origin',
    CAN: 'Cancelled',
    HLD: 'On Hold',
  }

  return statusMap[code] || code
}

export const getStatusColor = (code?: string): string => {
  if (!code) return 'default'

  const colorMap: Record<string, string> = {
    BKD: 'blue',
    PUP: 'cyan',
    ITM: 'indigo',
    OFD: 'purple',
    DLV: 'green',
    NONDLV: 'red',
    RTO: 'orange',
    CAN: 'gray',
    HLD: 'yellow',
  }

  return colorMap[code] || 'default'
}

export const getStatusIcon = (code?: string) => {
  if (!code) return AlertCircle

  const iconMap: Record<string, any> = {
    BKD: Package,
    PUP: PackageCheck,
    ITM: Truck,
    OFD: Home,
    DLV: CheckCircle,
    NONDLV: XCircle,
    RTO: RotateCcw,
    CAN: XCircle,
    HLD: Clock,
  }

  return iconMap[code] || AlertCircle
}

export const formatAwbNumber = (awb: string): string => {
  return awb
}

export const formatWeight = (weight: number): string => {
  return `${weight} kg`
}

export const getServiceTypeLabel = (type: string): string => {
  const labelMap: Record<string, string> = {
    STANDARD: 'Standard',
    LITE: 'Lite',
    'B2C PRIORITY': 'Priority',
    'B2C SMART': 'Smart',
    'B2C SMART EXPRESS': 'Smart Express',
    EXPRESS: 'Express',
  }

  return labelMap[type] || type
}

export const formatCurrency = (amount?: number): string => {
  if (!amount) return '₹0'
  return `₹${amount.toLocaleString('en-IN')}`
}

export const formatDate = (date?: Date | string): string => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const formatDateTime = (date?: Date | string): string => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const getShipmentStats = (shipments: any[]): ShipmentSummary => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const stats: ShipmentSummary = {
    totalShipments: shipments.length,
    inTransit: 0,
    deliveredToday: 0,
    pending: 0,
    rtoCount: 0,
    cancelled: 0,
  }

  shipments.forEach((shipment) => {
    if (shipment.isCancelled) {
      stats.cancelled++
    } else if (shipment.isRto) {
      stats.rtoCount++
    } else if (shipment.isDelivered) {
      const deliveredDate = new Date(shipment.deliveredAt)
      deliveredDate.setHours(0, 0, 0, 0)
      if (deliveredDate.getTime() === today.getTime()) {
        stats.deliveredToday++
      }
    } else if (
      shipment.currentStatusCode === ShipmentStatusCode.ITM ||
      shipment.currentStatusCode === ShipmentStatusCode.OFD
    ) {
      stats.inTransit++
    } else if (
      shipment.currentStatusCode === ShipmentStatusCode.BKD ||
      shipment.currentStatusCode === ShipmentStatusCode.PUP
    ) {
      stats.pending++
    }
  })

  return stats
}

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    return false
  }
}

export const getRouteDisplay = (originCity?: string, destinationCity?: string): string => {
  if (!originCity && !destinationCity) return '-'
  if (!destinationCity) return originCity || '-'
  if (!originCity) return destinationCity
  return `${originCity} → ${destinationCity}`
}
