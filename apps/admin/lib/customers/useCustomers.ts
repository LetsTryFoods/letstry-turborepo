import { useQuery } from "@apollo/client/react";
import { GET_ALL_CUSTOMERS, GET_CUSTOMER_DETAILS } from "../graphql/customers";

export type CustomerStatus =
  | "GUEST"
  | "REGISTERED"
  | "VERIFIED"
  | "ACTIVE"
  | "SUSPENDED";

export interface CustomerAddress {
  _id: string;
  type: "HOME" | "WORK" | "OTHER";
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
}

export interface OrderSummary {
  _id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: CustomerStatus;
  totalOrders: number;
  totalSpent: number;
  activeCartItemsCount?: number;
  isGuest: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerSummary {
  totalCustomers: number;
  totalGuests: number;
  totalRegistered: number;
  totalRevenue: number;
  newThisMonth: number;
  platformStats: {
    android: number;
    ios: number;
    web: number;
  };
  statusStats: {
    guest: number;
    registered: number;
    verified: number;
    active: number;
    suspended: number;
  };
}

export interface PaginationMeta {
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GetAllCustomersResponse {
  getAllCustomers: {
    customers: any[];
    meta: PaginationMeta;
    summary: CustomerSummary;
  };
}

export interface GetCustomersInput {
  page?: number;
  limit?: number;
  status?: string;
  platform?: "ANDROID" | "IOS" | "WEB";
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "CREATED_AT" | "TOTAL_SPENT" | "TOTAL_ORDERS" | "LAST_ACTIVE";
  sortOrder?: "ASC" | "DESC";
  minSpent?: number;
  maxSpent?: number;
}

const mapBackendCustomerToFrontend = (backendCustomer: any): Customer => {
  return {
    _id: backendCustomer._id,
    name:
      `${backendCustomer.firstName || ""} ${
        backendCustomer.lastName || ""
      }`.trim() || "Guest User",
    email: backendCustomer.email || "",
    phone: backendCustomer.displayPhone || backendCustomer.phoneNumber || "",
    status: backendCustomer.status.toUpperCase() as CustomerStatus,
    totalOrders: backendCustomer.totalOrders || 0,
    totalSpent: backendCustomer.totalSpent || 0,
    activeCartItemsCount: backendCustomer.activeCartItemsCount,
    isGuest: backendCustomer.isGuest || false,
    createdAt: backendCustomer.createdAt,
    updatedAt: backendCustomer.updatedAt,
  };
};

export const useCustomers = (input?: GetCustomersInput) => {
  const { data, loading, error, refetch } = useQuery<GetAllCustomersResponse>(
    GET_ALL_CUSTOMERS,
    {
      variables: {
        input: {
          page: input?.page || 1,
          limit: input?.limit || 100,
          status: input?.status,
          platform: input?.platform,
          searchTerm: input?.searchTerm,
          startDate: input?.startDate,
          endDate: input?.endDate,
          sortBy: input?.sortBy,
          sortOrder: input?.sortOrder,
          minSpent: input?.minSpent,
          maxSpent: input?.maxSpent,
        },
      },
      fetchPolicy: "network-only",
    }
  );

  const customers =
    data?.getAllCustomers.customers.map(mapBackendCustomerToFrontend) || [];
  const meta = data?.getAllCustomers.meta;
  const summary = data?.getAllCustomers.summary;

  return {
    data: { customers, meta, summary },
    loading,
    error,
    refetch,
  };
};

export const useCustomerDetails = (id: string) => {
  const { data, loading, error, refetch } = useQuery<{ getCustomerDetails: any }>(
    GET_CUSTOMER_DETAILS,
    {
      variables: { id },
      skip: !id,
      fetchPolicy: "network-only",
    }
  );

  return {
    customer: data?.getCustomerDetails,
    loading,
    error,
    refetch,
  };
};

export const useDeleteCustomer = () => {
  const deleteCustomer = async (id: string) => {
    console.log(`Deleting customer ${id}`);
    return Promise.resolve({ success: true });
  };

  return {
    deleteCustomer,
    loading: false,
    error: null,
  };
};

export const getCustomerStats = (customers: Customer[]) => {
  return {
    total: customers.length,
    active: customers.filter((c) => c.status === "ACTIVE").length,
    inactive: customers.filter((c) => c.status === "REGISTERED").length,
    blocked: customers.filter((c) => c.status === "SUSPENDED").length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    totalOrders: customers.reduce((sum, c) => sum + c.totalOrders, 0),
    avgOrderValue:
      Math.round(
        customers.reduce((sum, c) => sum + c.totalSpent, 0) /
          customers.reduce((sum, c) => sum + c.totalOrders, 0)
      ) || 0,
    newThisMonth: customers.filter((c) => {
      const created = new Date(c.createdAt);
      const now = new Date();
      return (
        created.getMonth() === now.getMonth() &&
        created.getFullYear() === now.getFullYear()
      );
    }).length,
  };
};
