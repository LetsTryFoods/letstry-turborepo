import { useQuery, useMutation } from "@apollo/client/react";
import {
  GET_ALL_ORDERS,
  GET_ORDER_BY_ID,
  UPDATE_ORDER_STATUS,
} from "../graphql/orders";

export type OrderStatus =
  | "CONFIRMED"
  | "PACKED"
  | "SHIPPED"
  | "IN_TRANSIT"
  | "DELIVERED";
export type PaymentStatus =
  | "NOT_STARTED"
  | "EXECUTING"
  | "SUCCESS"
  | "FAILED"
  | "PENDING"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

interface PaginationMeta {
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface StatusCounts {
  confirmed: number;
  packed: number;
  shipped: number;
  inTransit: number;
  delivered: number;
}

interface GetAllOrdersData {
  getAllOrders: {
    orders: Order[];
    meta: PaginationMeta;
    summary: OrdersSummary;
  };
}

interface GetOrderByIdData {
  getOrderById: Order;
}

interface UpdateOrderStatusData {
  updateOrderStatus: Order;
}

export interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface OrderItem {
  variantId: string;
  name: string;
  sku: string;
  variant?: string;
  image?: string;
  quantity: number;
  price: string;
  totalPrice: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  formattedAddress?: string;
}

export interface Payment {
  _id: string;
  method?: string;
  status: PaymentStatus;
  transactionId?: string;
  amount: string;
  paidAt?: Date;
}

export interface Order {
  _id: string;
  orderId: string;
  customer?: Customer;
  items: OrderItem[];
  shippingAddress?: ShippingAddress;
  payment?: Payment;
  subtotal: string;
  deliveryCharge: string;
  discount: string;
  totalAmount: string;
  currency?: string;
  orderStatus: OrderStatus;
  trackingNumber?: string;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersSummary {
  totalOrders: number;
  totalRevenue: string;
  statusCounts: {
    confirmed: number;
    packed: number;
    shipped: number;
    inTransit: number;
    delivered: number;
  };
}

export interface GetAllOrdersInput {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  startDate?: Date;
  endDate?: Date;
  userSearch?: string;
}

export interface UpdateOrderStatusInput {
  orderId: string;
  status: OrderStatus;
  trackingNumber?: string;
}

export const useAllOrders = (input: GetAllOrdersInput = {}) => {
  const { data, loading, error, refetch } = useQuery<GetAllOrdersData>(
    GET_ALL_ORDERS,
    {
      variables: {
        input: {
          page: input.page || 1,
          limit: input.limit || 10,
          ...input,
        },
      },
      fetchPolicy: "cache-and-network",
    }
  );

  return {
    orders: data?.getAllOrders?.orders || [],
    meta: data?.getAllOrders?.meta,
    summary: data?.getAllOrders?.summary,
    loading,
    error,
    refetch,
  };
};

export const useOrderById = (orderId: string) => {
  const { data, loading, error, refetch } = useQuery<GetOrderByIdData>(
    GET_ORDER_BY_ID,
    {
      variables: { orderId },
      skip: !orderId,
      fetchPolicy: "cache-and-network",
    }
  );

  return {
    order: data?.getOrderById,
    loading,
    error,
    refetch,
  };
};

export const useUpdateOrderStatus = () => {
  const [updateOrderStatus, { loading, error }] =
    useMutation<UpdateOrderStatusData>(UPDATE_ORDER_STATUS);

  const updateStatus = async (input: UpdateOrderStatusInput) => {
    const result = await updateOrderStatus({
      variables: { input },
      refetchQueries: ["GetAllOrders"],
    });
    return result.data?.updateOrderStatus;
  };

  return {
    updateStatus,
    loading,
    error,
  };
};

export const getOrderStats = (summary?: OrdersSummary) => {
  if (!summary) {
    return {
      total: 0,
      confirmed: 0,
      packed: 0,
      shipped: 0,
      inTransit: 0,
      delivered: 0,
      totalRevenue: 0,
    };
  }

  return {
    total: summary.totalOrders,
    confirmed: summary.statusCounts.confirmed,
    packed: summary.statusCounts.packed,
    shipped: summary.statusCounts.shipped,
    inTransit: summary.statusCounts.inTransit,
    delivered: summary.statusCounts.delivered,
    totalRevenue: parseFloat(summary.totalRevenue || "0"),
  };
};
