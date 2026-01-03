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
import { Order, OrderStatus, PaymentStatus } from "@/lib/orders/queries"
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
      'DELIVERED': []
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
                  {order.orderId}
                </span>
              </TableCell>
              <TableCell>
                {order.customer ? (
                  <div>
                    <p className="font-medium">{order.customer.name}</p>
                    <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No customer info</p>
                )}
              </TableCell>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <p className="text-sm">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {order.items[0]?.name}
                          {order.items.length > 1 && ` +${order.items.length - 1} more`}
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
              <TableCell className="text-right">
                <p className="font-semibold">₹{parseFloat(order.totalAmount || '0').toLocaleString()}</p>
                {parseFloat(order.discount || '0') > 0 && (
                  <p className="text-xs text-green-600">-₹{parseFloat(order.discount).toLocaleString()}</p>
                )}
              </TableCell>
              <TableCell>
                {order.payment ? (
                  <div className="space-y-1">
                    {getPaymentStatusBadge(order.payment.status)}
                    <p className="text-xs text-muted-foreground">{order.payment.method || 'N/A'}</p>
                  </div>
                ) : (
                  <Badge variant="outline">No payment info</Badge>
                )}
              </TableCell>
              <TableCell>
                {getOrderStatusBadge(order.orderStatus)}
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

                  {order.orderStatus !== 'DELIVERED' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
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
