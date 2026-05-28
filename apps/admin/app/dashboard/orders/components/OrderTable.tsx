"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Package, Truck, CheckCircle, XCircle, RefreshCcw, Clock, Loader2, FileDown, Zap, Download, FileImage, Smartphone, Globe } from "lucide-react"
import { isAppOrder } from "@/app/dashboard/customers/utils/customerUtils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Order, OrderStatus, PaymentStatus, useAdminPunchShipment } from "@/lib/orders/queries"
import { useShipmentLabel } from "@/lib/shipments/queries"
import { usePickupLocations } from "@/lib/shipments/pickup-location-queries"
import { printShippingLabel } from "@/lib/utils/label-printer"
import { format } from "date-fns"
import { toast } from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

interface OrderTableProps {
  orders: Order[]
  onViewDetails: (order: Order) => void
  onUpdateStatus: (orderId: string, status: OrderStatus) => void
}

const API_BASE_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL?.replace('/graphql', '') || 'http://localhost:5000'

export function OrderTable({ orders, onViewDetails, onUpdateStatus }: OrderTableProps) {
  const { punchShipment, loading: punching } = useAdminPunchShipment()
  const { downloadLabel, loading: downloadingLabel } = useShipmentLabel()
  const { pickupLocations, loading: locationsLoading } = usePickupLocations()
  const [downloadingAll, setDownloadingAll] = useState<string | null>(null)

  const handlePunchShipment = async (order: Order, serviceType: string, provider?: string, pickupLocationName?: string) => {
    try {
      const result = await punchShipment({ orderId: order._id, serviceType, provider, pickupLocationName })
      if (result) {
        toast.success(`Successfully punched to ${provider || 'DTDC'}!`)
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to punch to ${provider || 'DTDC'}`)
    }
  }

  const handleDownloadAll = async (order: Order) => {
    if (!order.shipment?.dtdcAwbNumber) {
      toast.error('Label not available. Please create shipment first.')
      return
    }

    setDownloadingAll(order._id)
    try {
      const success = await downloadLabel(order.shipment.dtdcAwbNumber)
      if (!success) {
        toast.error('Failed to download label')
        return
      }

      const link = document.createElement('a')
      link.href = `${API_BASE_URL}/orders/${order._id}/invoice`
      link.download = `invoice-${order.orderId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('Downloaded: label & invoice')
    } catch (error) {
      toast.error('Error downloading documents')
    } finally {
      setDownloadingAll(null)
    }
  }

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge variant="outline" className="border-blue-500 text-blue-600"><CheckCircle className="h-3 w-3 mr-1" /> Confirmed</Badge>
      case 'PACKED':
        return <Badge variant="outline" className="border-orange-500 text-orange-600"><Package className="h-3 w-3 mr-1" /> Packed</Badge>
      case 'SHIPPED':
        return <Badge variant="outline" className="border-purple-500 text-purple-600"><Truck className="h-3 w-3 mr-1" /> Shipped</Badge>
      case 'IN_TRANSIT':
        return <Badge variant="outline" className="border-indigo-500 text-indigo-600"><Loader2 className="h-3 w-3 mr-1" /> In Transit</Badge>
      case 'DELIVERED':
        return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Delivered</Badge>
      case 'SHIPMENT_FAILED':
        return <Badge variant="outline" className="border-red-500 text-red-600"><XCircle className="h-3 w-3 mr-1" /> Shipment Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status?: PaymentStatus) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>
    switch (status) {
      case 'SUCCESS':
        return <Badge className="bg-green-600">Paid</Badge>
      case 'PENDING':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Pending</Badge>
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>
      case 'REFUNDED':
        return <Badge variant="secondary">Refunded</Badge>
      case 'PARTIALLY_REFUNDED':
        return <Badge variant="secondary">Partial Refund</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const canUpdateTo = (currentStatus: OrderStatus, newStatus: OrderStatus): boolean => {
    const statusFlow: Record<OrderStatus, OrderStatus[]> = {
      'CONFIRMED': ['PACKED'],
      'PACKED': ['SHIPPED'],
      'SHIPPED': ['IN_TRANSIT'],
      'IN_TRANSIT': ['DELIVERED'],
      'DELIVERED': [],
      'SHIPMENT_FAILED': [],
    }
    return statusFlow[currentStatus]?.includes(newStatus) || false
  }

  const isDelhiNCR = (address?: any) => {
    if (!address) return false
    const pincode = (address.pincode || address.postalCode || '').toString().trim()
    
    // Delhi NCR Pincode Prefixes:
    // 11: Delhi
    // 121, 122: Faridabad, Gurgaon
    // 201: Noida, Ghaziabad
    const ncrPrefixes = ['11', '121', '122', '201']
    return ncrPrefixes.some(prefix => pincode.startsWith(prefix))
  }

  const getRecommendation = (order: Order) => {
    return isDelhiNCR(order.shippingAddress) ? 'SHIPROCKET' : 'DTDC'
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No orders found</p>
        <p className="text-sm text-muted-foreground">Orders will appear here once customers place them</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-[11px] font-bold uppercase tracking-wider py-2 px-2.5 h-auto">Order #</TableHead>
            <TableHead className="text-[11px] font-bold uppercase tracking-wider py-2 px-2.5 h-auto">Customer</TableHead>
            <TableHead className="text-[11px] font-bold uppercase tracking-wider py-2 px-2.5 h-auto">Source</TableHead>
            <TableHead className="text-[11px] font-bold uppercase tracking-wider py-2 px-2.5 h-auto">Items</TableHead>
            <TableHead className="text-[11px] font-bold uppercase tracking-wider py-2 px-2.5 h-auto text-right">Total</TableHead>
            <TableHead className="text-[11px] font-bold uppercase tracking-wider py-2 px-2.5 h-auto">Payment</TableHead>
            <TableHead className="text-[11px] font-bold uppercase tracking-wider py-2 px-2.5 h-auto">Status</TableHead>
            <TableHead className="text-[11px] font-bold uppercase tracking-wider py-2 px-2.5 h-auto">Date</TableHead>
            <TableHead className="text-[11px] font-bold uppercase tracking-wider py-2 px-2.5 h-auto text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order._id} className="hover:bg-muted/40 h-auto">
              <TableCell className="py-2 px-2.5 h-auto">
                <span 
                  className="font-mono text-[11px] font-bold text-foreground hover:text-indigo-600 hover:underline cursor-pointer active:text-indigo-800 transition-colors select-all" 
                  onClick={() => {
                    navigator.clipboard.writeText(order.orderId);
                    toast.success("Order ID copied!");
                  }}
                  title="Click to copy Order ID"
                >
                  {order.orderId}
                </span>
              </TableCell>
              <TableCell className="py-2 px-2.5 h-auto">
                {order.customer ? (
                  <div className="text-[11px] leading-tight">
                    <p className="font-semibold text-foreground">{order.customer.name}</p>
                    <p className="text-[10px] text-muted-foreground">{order.customer.phone}</p>
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground">No customer info</p>
                )}
              </TableCell>
              <TableCell className="py-2 px-2.5 h-auto">
                {(() => {
                  const isApp = order.userInfo?.deviceInfo ? isAppOrder(order.userInfo.deviceInfo) : false;
                  return isApp ? (
                    <Badge variant="outline" className="border-indigo-500 text-indigo-600 bg-indigo-50/50 text-[10px] px-1.5 py-0 h-5 font-semibold shrink-0">
                      <Smartphone className="h-3 w-3 mr-0.5" /> App
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-teal-500 text-teal-600 bg-teal-50/50 text-[10px] px-1.5 py-0 h-5 font-semibold shrink-0">
                      <Globe className="h-3 w-3 mr-0.5" /> Web
                    </Badge>
                  );
                })()}
              </TableCell>
              <TableCell className="py-2 px-2.5 h-auto">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help text-[11px] leading-tight">
                        <p className="font-semibold text-foreground">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                          {order.items[0]?.name}
                          {order.items.length > 1 && ` +${order.items.length - 1}`}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <p key={idx} className="text-xs">
                            {item.quantity}x {item.name} {item.variant && `(${item.variant})`}
                          </p>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell className="py-2 px-2.5 h-auto text-right">
                <p className="font-bold text-[11px]">₹{parseFloat(order.totalAmount || '0').toLocaleString()}</p>
                {parseFloat(order.discount || '0') > 0 && (
                  <p className="text-[10px] text-green-600 font-medium">-₹{parseFloat(order.discount).toLocaleString()}</p>
                )}
              </TableCell>
              <TableCell className="py-2 px-2.5 h-auto">
                {order.payment ? (
                  <div className="space-y-0.5 text-[11px] leading-tight">
                    <span className="inline-block scale-90 origin-left">
                      {getPaymentStatusBadge(order.payment.status)}
                    </span>
                    <p className="text-[10px] text-muted-foreground font-semibold">{order.payment.method || 'N/A'}</p>
                  </div>
                ) : (
                  <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">No payment</Badge>
                )}
              </TableCell>
              <TableCell className="py-2 px-2.5 h-auto">
                <span className="inline-block scale-90 origin-left">
                  {getOrderStatusBadge(order.orderStatus)}
                </span>
              </TableCell>
              <TableCell className="py-2 px-2.5 h-auto">
                <p className="text-[11px] font-semibold text-foreground">{format(new Date(order.createdAt), 'dd MMM yyyy')}</p>
                <p className="text-[10px] text-muted-foreground">{format(new Date(order.createdAt), 'hh:mm a')}</p>
              </TableCell>
              <TableCell className="py-2 px-2.5 h-auto text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => onViewDetails(order)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View Details</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {order.orderStatus !== 'DELIVERED' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          disabled={punching}
                        >
                          <Zap className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel className="flex items-center gap-2">
                          Punch to DTDC
                          {getRecommendation(order) === 'DTDC' && (
                            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none px-1.5 py-0 text-[10px]">RECOMMENDED</Badge>
                          )}
                        </DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handlePunchShipment(order, 'B2C SMART EXPRESS')}>
                          B2C Smart Express
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePunchShipment(order, 'B2C PRIORITY')}>
                          B2C Priority
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="flex items-center gap-2">
                          Punch to Shiprocket
                          {getRecommendation(order) === 'SHIPROCKET' && (
                            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none px-1.5 py-0 text-[10px]">RECOMMENDED</Badge>
                          )}
                        </DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handlePunchShipment(order, 'Express', 'SHIPROCKET')}>
                          Shiprocket Express (Auto)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {order.orderStatus !== 'DELIVERED' && (
                        <>
                          <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {canUpdateTo(order.orderStatus, 'PACKED') && (
                            <DropdownMenuItem onClick={() => onUpdateStatus(order.orderId, 'PACKED')}>
                              <Package className="h-4 w-4 mr-2 text-orange-600" />
                              Mark as Packed
                            </DropdownMenuItem>
                          )}
                          {canUpdateTo(order.orderStatus, 'SHIPPED') && (
                            <DropdownMenuItem onClick={() => onUpdateStatus(order.orderId, 'SHIPPED')}>
                              <Truck className="h-4 w-4 mr-2 text-purple-600" />
                              Mark as Shipped
                            </DropdownMenuItem>
                          )}
                          {canUpdateTo(order.orderStatus, 'IN_TRANSIT') && (
                            <DropdownMenuItem onClick={() => onUpdateStatus(order.orderId, 'IN_TRANSIT')}>
                              <Loader2 className="h-4 w-4 mr-2 text-indigo-600" />
                              Mark as In Transit
                            </DropdownMenuItem>
                          )}
                          {canUpdateTo(order.orderStatus, 'DELIVERED') && (
                            <DropdownMenuItem onClick={() => onUpdateStatus(order.orderId, 'DELIVERED')}>
                              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                              Mark as Delivered
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                        </>
                      )}
                      
                      <DropdownMenuLabel>Documents</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDownloadAll(order)}
                        disabled={downloadingAll === order._id || downloadingLabel}
                      >
                        <Download className="h-4 w-4 mr-2 text-green-600" />
                        Download Label & Invoice
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open(`${API_BASE_URL}/orders/${order._id}/invoice`, '_blank')}>
                        <FileDown className="h-4 w-4 mr-2 text-blue-600" />
                        Download Invoice
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => printShippingLabel(order)}>
                        <FileImage className="h-4 w-4 mr-2 text-indigo-600" />
                        Download Custom Label
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
