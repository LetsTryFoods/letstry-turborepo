"use client";

import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  ShoppingCart,
  IndianRupee,
  Trash2,
  Home,
  Building2,
  MoreHorizontal,
} from "lucide-react";
import { Customer } from "@/lib/customers/useCustomers";
import CustomerStatCard from "./CustomerStatCard";
import { getInitials, formatCurrency } from "../utils/customerUtils";

interface CustomerDetailsDialogProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (customer: Customer) => void;
}

const orderStatusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  PENDING: { label: "Pending", variant: "secondary" },
  CONFIRMED: { label: "Confirmed", variant: "default" },
  PROCESSING: { label: "Processing", variant: "default" },
  SHIPPED: { label: "Shipped", variant: "default" },
  DELIVERED: { label: "Delivered", variant: "default" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  REFUNDED: { label: "Refunded", variant: "outline" },
};

const addressTypeIcons = {
  HOME: Home,
  WORK: Building2,
  OTHER: MoreHorizontal,
};

export default function CustomerDetailsDialog({
  customer,
  open,
  onOpenChange,
  onDelete,
}: CustomerDetailsDialogProps) {
  const avgOrderValue =
    customer.totalOrders > 0
      ? Math.round(customer.totalSpent / customer.totalOrders)
      : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
          <DialogDescription>
            Complete information about this customer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {customer.avatar ? (
                  <img src={customer.avatar} alt={customer.name} />
                ) : (
                  <AvatarFallback className="text-lg">
                    {getInitials(customer.name)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{customer.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Mail className="h-4 w-4" />
                  {customer.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {customer.phone}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-4 gap-4">
            <CustomerStatCard
              icon={ShoppingBag}
              label="Total Orders"
              value={customer.totalOrders}
            />

            <CustomerStatCard
              icon={IndianRupee}
              label="Total Spent"
              value={formatCurrency(customer.totalSpent)}
            />

            <CustomerStatCard
              icon={ShoppingCart}
              label="Active Cart"
              value={customer.activeCartItemsCount || 0}
            />

            <CustomerStatCard
              icon={Calendar}
              label="Member Since"
              value={format(new Date(customer.createdAt), "MMM yyyy")}
            />
          </div>

          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <p>
                Detailed customer information including addresses and order
                history will be available soon.
              </p>
              <p className="text-sm mt-2">
                Click on a customer row to view full details on a dedicated
                page.
              </p>
            </CardContent>
          </Card>

          <Separator />

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground mr-2">Actions:</span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(customer)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
