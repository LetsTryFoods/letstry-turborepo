"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { graphqlClient } from "@/lib/graphql/client-factory";
import { GET_MY_ORDERS } from "@/lib/queries/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ChevronDown, ChevronUp, MapPin, CreditCard, User as UserIcon } from "lucide-react";

interface Order {
    _id: string;
    orderId: string;
    orderStatus: string;
    totalAmount: string;
    subtotal: string;
    discount: string;
    deliveryCharge: string;
    currency: string;
    trackingNumber?: string;
    createdAt: string;
    deliveredAt?: string;
    cancelledAt?: string;
    cancellationReason?: string;
    items: Array<{
        variantId?: string;
        quantity: number;
        price?: string;
        totalPrice?: string;
        name?: string;
        sku?: string;
        variant?: string;
        image?: string;
    }>;
    payment?: {
        _id: string;
        status: string;
        method?: string;
        transactionId?: string;
        amount: string;
        paidAt?: string;
    };
    shippingAddress?: {
        fullName: string;
        phone: string;
        addressType?: string;
        addressLine1: string;
        addressLine2?: string;
        floor?: string;
        city: string;
        state: string;
        pincode: string;
        landmark?: string;
        formattedAddress?: string;
    };
    customer?: {
        _id: string;
        name: string;
        email?: string;
        phone?: string;
    };
}

const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        confirmed: "bg-blue-100 text-blue-800",
        packed: "bg-purple-100 text-purple-800",
        shipped: "bg-yellow-100 text-yellow-800",
        inTransit: "bg-orange-100 text-orange-800",
        delivered: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
};

const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        SUCCESS: "bg-green-100 text-green-800",
        PENDING: "bg-yellow-100 text-yellow-800",
        FAILED: "bg-red-100 text-red-800",
        EXECUTING: "bg-blue-100 text-blue-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
};

export const ProfileOrders = () => {
    const [page, setPage] = useState(1);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ["myOrders", page],
        queryFn: async () => {
            const result = await graphqlClient.request(GET_MY_ORDERS, {
                input: { page, limit: 10 },
            });
            return result.getMyOrders;
        },
    });

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-8">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="p-8">
                    <div className="text-center text-red-600">
                        Failed to load orders. Please try again.
                    </div>
                </CardContent>
            </Card>
        );
    }

    const orders = data?.orders || [];
    const meta = data?.meta;

    if (orders.length === 0) {
        return (
            <Card>
                <CardContent className="p-12">
                    <div className="text-center">
                        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-500">Start shopping to see your orders here!</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {orders.map((order: Order) => {
                const isExpanded = expandedOrder === order._id;

                return (
                    <Card key={order._id}>
                        <CardHeader className="cursor-pointer" onClick={() => setExpandedOrder(isExpanded ? null : order._id)}>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-2">
                                        <CardTitle className="text-lg">Order #{order.orderId}</CardTitle>
                                        <Badge className={getStatusColor(order.orderStatus)}>
                                            {order.orderStatus}
                                        </Badge>
                                        {order.payment && (
                                            <Badge className={getPaymentStatusColor(order.payment.status)}>
                                                {order.payment.status}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span>{order.items.length} items</span>
                                        <span>•</span>
                                        <span className="font-semibold text-gray-900">
                                            {order.currency} {order.totalAmount}
                                        </span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm">
                                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                </Button>
                            </div>
                        </CardHeader>

                        {isExpanded && (
                            <CardContent className="space-y-6 border-t pt-6">
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-4">Order Items</h4>
                                    <div className="space-y-3">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                                {item.image && (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name || "Product"}
                                                        className="w-16 h-16 object-cover rounded"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{item.name}</p>
                                                    {item.variant && <p className="text-sm text-gray-600">{item.variant}</p>}
                                                    {item.sku && <p className="text-xs text-gray-500">SKU: {item.sku}</p>}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                                    <p className="font-semibold text-gray-900">{order.currency} {item.totalPrice || item.price}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {order.shippingAddress && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <MapPin className="h-5 w-5 text-gray-600" />
                                                <h4 className="font-semibold text-gray-900">Shipping Address</h4>
                                            </div>
                                            <div className="text-sm text-gray-600 space-y-1 bg-gray-50 p-4 rounded-lg">
                                                <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                                                <p>{order.shippingAddress.phone}</p>
                                                <p>{order.shippingAddress.addressLine1}</p>
                                                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                                                {order.shippingAddress.floor && <p>Floor: {order.shippingAddress.floor}</p>}
                                                <p>
                                                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                                </p>
                                                {order.shippingAddress.landmark && <p>Landmark: {order.shippingAddress.landmark}</p>}
                                            </div>
                                        </div>
                                    )}

                                    {order.payment && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <CreditCard className="h-5 w-5 text-gray-600" />
                                                <h4 className="font-semibold text-gray-900">Payment Details</h4>
                                            </div>
                                            <div className="text-sm text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
                                                <div className="flex justify-between">
                                                    <span>Status:</span>
                                                    <Badge className={getPaymentStatusColor(order.payment.status)}>
                                                        {order.payment.status}
                                                    </Badge>
                                                </div>
                                                {order.payment.method && (
                                                    <div className="flex justify-between">
                                                        <span>Method:</span>
                                                        <span className="font-medium text-gray-900">{order.payment.method}</span>
                                                    </div>
                                                )}
                                                {order.payment.transactionId && (
                                                    <div className="flex justify-between">
                                                        <span>Transaction ID:</span>
                                                        <span className="font-mono text-xs text-gray-900">{order.payment.transactionId}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between">
                                                    <span>Amount:</span>
                                                    <span className="font-semibold text-gray-900">{order.currency} {order.payment.amount}</span>
                                                </div>
                                                {order.payment.paidAt && (
                                                    <div className="flex justify-between">
                                                        <span>Paid At:</span>
                                                        <span className="text-gray-900">{new Date(order.payment.paidAt).toLocaleString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Subtotal:</span>
                                            <span className="text-gray-900">{order.currency} {order.subtotal}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Discount:</span>
                                            <span className="text-green-600">- {order.currency} {order.discount}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Delivery Charge:</span>
                                            <span className="text-gray-900">{order.currency} {order.deliveryCharge}</span>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t border-gray-200">
                                            <span className="font-semibold text-gray-900">Total:</span>
                                            <span className="font-semibold text-gray-900">{order.currency} {order.totalAmount}</span>
                                        </div>
                                    </div>
                                </div>

                                {order.trackingNumber && (
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-1">Tracking Number:</p>
                                        <p className="font-mono font-semibold text-blue-900">{order.trackingNumber}</p>
                                    </div>
                                )}

                                {order.cancellationReason && (
                                    <div className="bg-red-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-1">Cancellation Reason:</p>
                                        <p className="text-red-900">{order.cancellationReason}</p>
                                    </div>
                                )}
                            </CardContent>
                        )}
                    </Card>
                );
            })}

            {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <Button
                        variant="outline"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                        Page {page} of {meta.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => setPage(page + 1)}
                        disabled={page === meta.totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
};
