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
import { Button } from "@/components/ui/button"
import { AbandonedCart } from "@/lib/abandoned-carts/useAbandonedCarts"
import { format, formatDistanceToNow } from "date-fns"
import { 
  ShoppingCart, 
  User, 
  Phone,
  Mail,
  Clock,
  MessageCircle,
  MessageSquare,
  IndianRupee
} from "lucide-react"

interface CartDetailsDialogProps {
  cart: AbandonedCart | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSendWhatsApp: (cart: AbandonedCart) => void
  onSendSMS: (cart: AbandonedCart) => void
}

export function CartDetailsDialog({ cart, open, onOpenChange, onSendWhatsApp, onSendSMS }: CartDetailsDialogProps) {
  if (!cart) return null

  const getActivityBadge = (lastActivity: string) => {
    const now = new Date()
    const activityDate = new Date(lastActivity)
    const hoursDiff = (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60)

    if (hoursDiff < 24) {
      return <Badge className="bg-green-600">Active Today</Badge>
    } else if (hoursDiff < 72) {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-600">2-3 Days Ago</Badge>
    } else if (hoursDiff < 168) {
      return <Badge variant="outline" className="border-orange-500 text-orange-600">This Week</Badge>
    } else {
      return <Badge variant="secondary">Older</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Abandoned Cart Details</span>
            {getActivityBadge(cart.lastActivity)}
          </DialogTitle>
          <DialogDescription>
            Last activity {formatDistanceToNow(new Date(cart.lastActivity), { addSuffix: true })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <User className="h-4 w-4 mr-2" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium text-lg">{cart.customer.name}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{cart.customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <code className="font-mono bg-muted px-2 py-1 rounded">{cart.customer.phone}</code>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => onSendWhatsApp(cart)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send WhatsApp
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                  onClick={() => onSendSMS(cart)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send SMS
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cart Items */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart Items ({cart.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cart.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden border bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Variant: {item.variant} • Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">₹{item.price} each</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              {/* Cart Total */}
              <div className="flex justify-between items-center">
                <span className="font-medium">Cart Total</span>
                <span className="text-xl font-bold text-green-600 flex items-center">
                  <IndianRupee className="h-4 w-4" />
                  {cart.subtotal.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cart Created</span>
                  <span>{format(new Date(cart.createdAt), 'dd MMM yyyy, hh:mm a')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>{format(new Date(cart.updatedAt), 'dd MMM yyyy, hh:mm a')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Activity</span>
                  <span>{format(new Date(cart.lastActivity), 'dd MMM yyyy, hh:mm a')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
