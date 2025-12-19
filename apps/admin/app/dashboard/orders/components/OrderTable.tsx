"use client"

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
import { Eye, Package, Truck, CheckCircle, XCircle, RefreshCcw, Clock, Loader2 } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Order, OrderStatus, PaymentStatus } from "@/lib/orders/useOrders"
import { format } from "date-fns"
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

export function OrderTable({ orders, onViewDetails, onUpdateStatus }: OrderTableProps) {
  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>
      case 'CONFIRMED':
        return <Badge variant="outline" className="border-blue-500 text-blue-600"><CheckCircle className="h-3 w-3 mr-1" /> Confirmed</Badge>
      case 'PROCESSING':
        return <Badge variant="outline" className="border-orange-500 text-orange-600"><Loader2 className="h-3 w-3 mr-1" /> Processing</Badge>
      case 'SHIPPED':
        return <Badge variant="outline" className="border-purple-500 text-purple-600"><Truck className="h-3 w-3 mr-1" /> Shipped</Badge>
      case 'DELIVERED':
        return <Badge className="bg-green-600"><Package className="h-3 w-3 mr-1" /> Delivered</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Cancelled</Badge>
      case 'REFUNDED':
        return <Badge variant="secondary"><RefreshCcw className="h-3 w-3 mr-1" /> Refunded</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID':
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

  const canUpdateTo = (currentStatus: OrderStatus, newStatus: OrderStatus): boolean => {
    const statusFlow: Record<OrderStatus, OrderStatus[]> = {
      'PENDING': ['CONFIRMED', 'CANCELLED'],
      'CONFIRMED': ['PROCESSING', 'CANCELLED'],
      'PROCESSING': ['SHIPPED', 'CANCELLED'],
      'SHIPPED': ['DELIVERED', 'CANCELLED'],
      'DELIVERED': ['REFUNDED'],
      'CANCELLED': [],
      'REFUNDED': []
    }
    return statusFlow[currentStatus]?.includes(newStatus) || false
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order._id}>
              <TableCell>
                <span className="font-mono text-sm font-medium">
                  {order.orderNumber}
                </span>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{order.customer.name}</p>
                  <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
                </div>
              </TableCell>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <p className="text-sm">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {order.items[0]?.product.name}
                          {order.items.length > 1 && ` +${order.items.length - 1} more`}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <p key={idx} className="text-xs">
                            {item.quantity}x {item.product.name} ({item.variant})
                          </p>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell className="text-right">
                <p className="font-semibold">₹{order.total.toLocaleString()}</p>
                {order.discount > 0 && (
                  <p className="text-xs text-green-600">-₹{order.discount}</p>
                )}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {getPaymentStatusBadge(order.payment.status)}
                  <p className="text-xs text-muted-foreground">{order.payment.method}</p>
                </div>
              </TableCell>
              <TableCell>
                {getOrderStatusBadge(order.status)}
              </TableCell>
              <TableCell>
                <p className="text-sm">{format(new Date(order.createdAt), 'dd MMM yyyy')}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(order.createdAt), 'hh:mm a')}</p>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onViewDetails(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View Details</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {canUpdateTo(order.status, 'CONFIRMED') && (
                          <DropdownMenuItem onClick={() => onUpdateStatus(order._id, 'CONFIRMED')}>
                            <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                            Confirm Order
                          </DropdownMenuItem>
                        )}
                        {canUpdateTo(order.status, 'PROCESSING') && (
                          <DropdownMenuItem onClick={() => onUpdateStatus(order._id, 'PROCESSING')}>
                            <Loader2 className="h-4 w-4 mr-2 text-orange-600" />
                            Start Processing
                          </DropdownMenuItem>
                        )}
                        {canUpdateTo(order.status, 'SHIPPED') && (
                          <DropdownMenuItem onClick={() => onUpdateStatus(order._id, 'SHIPPED')}>
                            <Truck className="h-4 w-4 mr-2 text-purple-600" />
                            Mark as Shipped
                          </DropdownMenuItem>
                        )}
                        {canUpdateTo(order.status, 'DELIVERED') && (
                          <DropdownMenuItem onClick={() => onUpdateStatus(order._id, 'DELIVERED')}>
                            <Package className="h-4 w-4 mr-2 text-green-600" />
                            Mark as Delivered
                          </DropdownMenuItem>
                        )}
                        {canUpdateTo(order.status, 'CANCELLED') && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => onUpdateStatus(order._id, 'CANCELLED')}
                              className="text-destructive"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Order
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {order.status === 'DELIVERED' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onUpdateStatus(order._id, 'REFUNDED')}
                          className="text-orange-600"
                        >
                          <RefreshCcw className="h-4 w-4 mr-2" />
                          Process Refund
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
