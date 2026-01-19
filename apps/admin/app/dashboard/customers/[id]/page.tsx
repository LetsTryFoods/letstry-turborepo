"use client";

import { useQuery } from "@apollo/client/react";
import { useParams, useRouter } from "next/navigation";
import { GET_CUSTOMER_DETAILS } from "@/lib/graphql/customers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  ShoppingCart,
  MapPin,
  IndianRupee,
  Smartphone,
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency, getInitials, parseDeviceInfo } from "../utils/customerUtils";

interface GetCustomerDetailsResponse {
  getCustomerDetails: any;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const { data, loading, error } = useQuery<GetCustomerDetailsResponse>(
    GET_CUSTOMER_DETAILS,
    {
      variables: { id: customerId },
      fetchPolicy: "network-only",
    }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading customer details...</p>
      </div>
    );
  }

  if (error || !data?.getCustomerDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-destructive">Failed to load customer details</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const customer = data.getCustomerDetails;
  const customerName =
    `${customer.firstName || ""} ${customer.lastName || ""}`.trim() ||
    "Guest User";

  return (
    <div className="space-y-6 mx-6 mb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Customer Details
          </h1>
          <p className="text-muted-foreground">
            Complete information for {customerName}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
                  {getInitials(customerName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  {customerName}
                  {customer.isGuest && (
                    <Badge className="bg-green-500">Guest</Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {customer.status}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {customer.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{customer.email}</span>
              </div>
            )}
            {customer.phoneNumber && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{customer.phoneNumber}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Joined {format(new Date(customer.createdAt), "PPP")}</span>
            </div>
            {customer.deviceInfo && (
              <div className="flex items-center gap-2 text-sm">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <span>{parseDeviceInfo(customer.deviceInfo)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Total Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{customer.totalOrders}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <IndianRupee className="h-4 w-4" />
                  Total Spent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(customer.totalSpent)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Active Cart
                </div>
                {customer.activeCart && (
                  <Badge variant="secondary">
                    {customer.activeCart.items.length} items
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customer.activeCart ? (
                <div className="space-y-4">
                  {customer.activeCart.items.map((item: any) => (
                    <div
                      key={item._id}
                      className="flex gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      {/* Product Image */}
                      {item.imageUrl && (
                        <div className="flex-shrink-0">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-md border"
                          />
                        </div>
                      )}

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          SKU: {item.sku}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="text-xs">
                            <span className="text-muted-foreground">Qty:</span>{" "}
                            <span className="font-medium">{item.quantity}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-muted-foreground">
                              Unit Price:
                            </span>{" "}
                            <span className="font-medium">
                              {formatCurrency(item.unitPrice)}
                            </span>
                          </div>
                          {item.mrp > item.unitPrice && (
                            <div className="text-xs">
                              <span className="text-muted-foreground">
                                MRP:
                              </span>{" "}
                              <span className="line-through text-muted-foreground">
                                {formatCurrency(item.mrp)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="flex-shrink-0 text-right">
                        <p className="font-semibold">
                          {formatCurrency(item.totalPrice)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Cart Summary */}
                  <Separator />
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">
                        {formatCurrency(
                          customer.activeCart.totalsSummary.subtotal
                        )}
                      </span>
                    </div>
                    {customer.activeCart.totalsSummary.discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>
                          -
                          {formatCurrency(
                            customer.activeCart.totalsSummary.discountAmount
                          )}
                        </span>
                      </div>
                    )}
                    {customer.activeCart.totalsSummary.handlingCharge > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Handling Charge
                        </span>
                        <span>
                          {formatCurrency(
                            customer.activeCart.totalsSummary.handlingCharge
                          )}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Grand Total</span>
                      <span className="text-lg">
                        {formatCurrency(
                          customer.activeCart.totalsSummary.grandTotal
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No active cart</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Addresses ({customer.addresses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customer.addresses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No addresses saved</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {customer.addresses.map((address: any) => (
                <div
                  key={address._id}
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{address.addressType}</Badge>
                    {address.isDefault && (
                      <Badge variant="secondary">Default</Badge>
                    )}
                  </div>
                  <p className="font-medium">{address.recipientName}</p>
                  <p className="text-sm text-muted-foreground">
                    {address.recipientPhone}
                  </p>
                  <p className="text-sm">
                    {address.buildingName}
                    {address.floor && `, Floor ${address.floor}`}
                  </p>
                  {address.streetArea && (
                    <p className="text-sm">{address.streetArea}</p>
                  )}
                  {address.landmark && (
                    <p className="text-sm text-muted-foreground">
                      Landmark: {address.landmark}
                    </p>
                  )}
                  <p className="text-sm">
                    {address.addressLocality}, {address.addressRegion} - {address.postalCode}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {address.addressCountry}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Order History ({customer.orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customer.orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {customer.orders.map((order: any) => (
                <div
                  key={order._id}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.createdAt), "PPP")}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge>{order.status}</Badge>
                      <p className="text-lg font-semibold mt-1">
                        {formatCurrency(parseFloat(order.totalAmount))}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>
                          {item.name} x {item.quantity}
                        </span>
                        <span>
                          {formatCurrency(parseFloat(item.totalPrice))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
