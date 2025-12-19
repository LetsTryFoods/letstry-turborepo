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
import { Eye, MessageCircle, MessageSquare } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AbandonedCart } from "@/lib/abandoned-carts/useAbandonedCarts"
import { format, formatDistanceToNow } from "date-fns"
import { ShoppingCart } from "lucide-react"

interface CartTableProps {
  carts: AbandonedCart[]
  onViewDetails: (cart: AbandonedCart) => void
  onSendWhatsApp: (cart: AbandonedCart) => void
  onSendSMS: (cart: AbandonedCart) => void
}

export function CartTable({ carts, onViewDetails, onSendWhatsApp, onSendSMS }: CartTableProps) {
  const getActivityBadge = (lastActivity: string) => {
    const now = new Date()
    const activityDate = new Date(lastActivity)
    const hoursDiff = (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60)

    if (hoursDiff < 24) {
      return <Badge className="bg-green-600">Active Today</Badge>
    } else if (hoursDiff < 72) {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-600">2-3 Days</Badge>
    } else if (hoursDiff < 168) {
      return <Badge variant="outline" className="border-orange-500 text-orange-600">This Week</Badge>
    } else {
      return <Badge variant="secondary">Older</Badge>
    }
  }

  if (carts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No abandoned carts found</p>
        <p className="text-sm text-muted-foreground">Great! All customers have completed their orders</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Items</TableHead>
            <TableHead className="text-right">Cart Value</TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {carts.map((cart) => (
            <TableRow key={cart._id}>
              <TableCell>
                <div>
                  <p className="font-medium">{cart.customer.name}</p>
                  <p className="text-xs text-muted-foreground">{cart.customer.email}</p>
                </div>
              </TableCell>
              <TableCell>
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {cart.customer.phone}
                </code>
              </TableCell>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <p className="text-sm">{cart.items.length} item{cart.items.length > 1 ? 's' : ''}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {cart.items[0]?.product.name}
                          {cart.items.length > 1 && ` +${cart.items.length - 1} more`}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        {cart.items.map((item, idx) => (
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
                <p className="font-semibold text-green-600">₹{cart.subtotal.toLocaleString()}</p>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-sm">{formatDistanceToNow(new Date(cart.lastActivity), { addSuffix: true })}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(cart.lastActivity), 'dd MMM, hh:mm a')}</p>
                </div>
              </TableCell>
              <TableCell>
                {getActivityBadge(cart.lastActivity)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onViewDetails(cart)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View Details</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="default"
                          size="icon"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => onSendWhatsApp(cart)}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Send WhatsApp Reminder</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-blue-500 text-blue-600 hover:bg-blue-50"
                          onClick={() => onSendSMS(cart)}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Send SMS Notification</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
