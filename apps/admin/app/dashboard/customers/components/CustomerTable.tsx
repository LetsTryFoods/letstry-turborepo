"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  MoreHorizontal,
  Trash2,
  Phone,
  Mail,
  ShoppingCart,
} from "lucide-react";
import { Customer, useDeleteCustomer } from "@/lib/customers/useCustomers";
import CustomerDetailsDialog from "./CustomerDetailsDialog";
import { getInitials, formatCurrency } from "../utils/customerUtils";

interface CustomerTableProps {
  customers: Customer[];
  onRefresh: () => void;
}

export default function CustomerTable({
  customers,
  onRefresh,
}: CustomerTableProps) {
  const router = useRouter();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { deleteCustomer } = useDeleteCustomer();

  const handleRowClick = (customerId: string) => {
    router.push(`/dashboard/customers/${customerId}`);
  };

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailsDialog(true);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (selectedCustomer) {
      await deleteCustomer(selectedCustomer._id);
      onRefresh();
    }
    setShowDeleteDialog(false);
    setSelectedCustomer(null);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-center">Orders</TableHead>
              <TableHead className="text-right">Total Spent</TableHead>
              <TableHead className="text-center">Active Cart</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => {
                return (
                  <TableRow
                    key={customer._id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(customer._id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {customer.avatar ? (
                            <img src={customer.avatar} alt={customer.name} />
                          ) : (
                            <AvatarFallback>
                              {getInitials(customer.name)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{customer.name}</p>
                            {customer.isGuest && (
                              <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">
                                Guest
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </p>
                        <p className="text-sm flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium">
                        {customer.totalOrders}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(customer.totalSpent)}
                    </TableCell>
                    <TableCell className="text-center">
                      {customer.activeCartItemsCount &&
                      customer.activeCartItemsCount > 0 ? (
                        <div className="flex items-center justify-center gap-1">
                          <ShoppingCart className="h-4 w-4 text-green-600" />
                          <span className="font-medium">
                            {customer.activeCartItemsCount}
                          </span>
                        </div>
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          No Cart
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {format(new Date(customer.createdAt), "dd MMM yyyy")}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleViewDetails(customer)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteCustomer(customer)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Customer Details Dialog */}
      {selectedCustomer && (
        <CustomerDetailsDialog
          customer={selectedCustomer}
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
          onDelete={handleDeleteCustomer}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the account of{" "}
              <strong>{selectedCustomer?.name}</strong>?
              <span className="block mt-2 text-red-600">
                This action cannot be undone. All customer data including order
                history will be permanently removed.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
