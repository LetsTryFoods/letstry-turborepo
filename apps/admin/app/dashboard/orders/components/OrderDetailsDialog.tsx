"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Order,
  OrderStatus,
  PaymentStatus
} from "@/lib/orders/queries"
import { format } from "date-fns"
import {
  Package,
  User,
  MapPin,
  CreditCard,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCcw,
  Loader2,
  Phone,
  Mail,
  IndianRupee
} from "lucide-react"

interface OrderDetailsDialogProps {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderDetailsDialog({ order, open, onOpenChange }: OrderDetailsDialogProps) {
  if (!order) return null

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
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'UPI':
        return 'UPI Payment'
      case 'CARD':
        return 'Credit/Debit Card'
      case 'NETBANKING':
        return 'Net Banking'
      case 'WALLET':
        return 'Wallet'
      default:
        return method
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order {order.orderId}</span>
            {getOrderStatusBadge(order.orderStatus)}
          </DialogTitle>
          <DialogDescription>
            Placed on {format(new Date(order.createdAt), 'dd MMM yyyy, hh:mm a')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Order Items ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden border bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Variant: {item.variant} • Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{(Number(item.price) * Number(item.quantity)).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">₹{item.price} each</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Price Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{order.subtotal.toLocaleString()}</span>
                </div>
                {Number(order.deliveryCharge) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Charge</span>
                    <span>₹{order.deliveryCharge}</span>
                  </div>
                )}
                {Number(order.deliveryCharge) === 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Charge</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                )}
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-green-600">-₹{order.discount}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-lg">₹{order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Customer Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{order.customer?.name}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{order.customer?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{order.customer?.phone}</span>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="font-medium">{order.shippingAddress?.fullName}</p>
                <p className="text-muted-foreground">{order.shippingAddress?.addressLine1}</p>
                {order.shippingAddress?.addressLine2 && (
                  <p className="text-muted-foreground">{order.shippingAddress?.addressLine2}</p>
                )}
                <p className="text-muted-foreground">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                </p>
                {order.shippingAddress?.landmark && (
                  <p className="text-muted-foreground text-xs">
                    Landmark: {order.shippingAddress?.landmark}
                  </p>
                )}
                <div className="flex items-center gap-2 pt-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{order.shippingAddress?.phone}</span>
                </div>
                {order.shippingAddress?.formattedAddress && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Complete Address:</p>
                    <p className="text-sm">{order.shippingAddress?.formattedAddress}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment Details
                </div>
                {getPaymentStatusBadge(order.payment?.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-medium">{getPaymentMethodLabel(order.payment?.method || '')}</span>
                  </div>
                  {order.payment?.transactionId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Transaction ID</span>
                      <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                        {order.payment?.transactionId}
                      </code>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold flex items-center">
                      <IndianRupee className="h-3 w-3" />
                      {order.payment?.amount.toLocaleString()}
                    </span>
                  </div>
                  {order.payment?.paidAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Paid At</span>
                      <span>{format(new Date(order.payment?.paidAt), 'dd MMM yyyy, hh:mm a')}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Placed</span>
                  <span>{format(new Date(order.createdAt), 'dd MMM yyyy, hh:mm a')}</span>
                </div>
                {order.updatedAt !== order.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span>{format(new Date(order.updatedAt), 'dd MMM yyyy, hh:mm a')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
