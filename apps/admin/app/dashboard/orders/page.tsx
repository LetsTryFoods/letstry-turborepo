"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  useAllOrders,
  useUpdateOrderStatus,
  getOrderStats,
  Order,
  OrderStatus,
} from "@/lib/orders/queries";
import { OrderTable } from "./components/OrderTable";
import { OrderDetailsDialog } from "./components/OrderDetailsDialog";
import { Pagination } from "@/components/ui/pagination";
import { useEffect } from "react";
import {
  Search,
  RefreshCw,
  Package,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  IndianRupee,
  ShoppingBag,
  Globe,
  Smartphone,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";
import api from "@/lib/axios";
import { DELAY_REASONS } from "./components/WhatsAppNotifyDialog";

const WHATSAPP_API_BASE =
  process.env.NEXT_PUBLIC_WHATSAPP_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://apiv3.letstryfoods.com";

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Bulk WhatsApp delay state
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkReason, setBulkReason] = useState<string>(DELAY_REASONS[0].value);
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ sent: number; failed: number } | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Bulk WhatsApp delay sender
  const handleBulkDelaySend = async () => {
    setBulkSending(true);
    setBulkResult(null);
    let sent = 0;
    let failed = 0;

    try {
      // Fetch ALL confirmed orders (no pagination limit)
      const { data } = await api.get(
        `${WHATSAPP_API_BASE}/whatsapp/meta/send-template`,
        { params: {} }
      );
    } catch { /* will use GraphQL route below */ }

    // We'll use the existing Apollo query but with a large limit to get all confirmed
    try {
      const res = await api.post(
        process.env.NEXT_PUBLIC_GRAPHQL_URL || "https://apiv3.letstryfoods.com/graphql",
        {
          query: `query GetConfirmedOrders { getAllOrders(input: { status: "CONFIRMED", page: 1, limit: 9999 }) { orders { orderId customer { name phone } userInfo { phoneNumber } shippingAddress { phone fullName } } } }`,
        }
      );
      const confirmedOrders: Order[] = res.data?.data?.getAllOrders?.orders || [];

      if (confirmedOrders.length === 0) {
        toast.error("No confirmed orders found.");
        setBulkSending(false);
        return;
      }

      const toastId = toast.loading(`Sending 0/${confirmedOrders.length}…`);

      for (let i = 0; i < confirmedOrders.length; i++) {
        const order = confirmedOrders[i];
        const phone =
          order.customer?.phone ||
          order.userInfo?.phoneNumber ||
          order.shippingAddress?.phone;
        const firstName = (order.customer?.name || order.shippingAddress?.fullName || "Customer").split(" ")[0];

        if (!phone) { failed++; continue; }

        try {
          await api.post(`${WHATSAPP_API_BASE}/whatsapp/meta/send-template`, {
            phoneNumber: phone,
            templateName: "order_delivery_delay",
            languageCode: "en",
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: firstName },
                  { type: "text", text: order.orderId },
                  { type: "text", text: bulkReason },
                ],
              },
            ],
          });
          sent++;
        } catch {
          failed++;
        }

        toast.loading(`Sending ${i + 1}/${confirmedOrders.length}…`, { id: toastId });
      }

      toast.dismiss(toastId);
      setBulkResult({ sent, failed });
      toast.success(`Done! Sent: ${sent}, Failed: ${failed}`);
    } catch (err: any) {
      toast.error(`Bulk send failed: ${err?.message || "Unknown error"}`);
    } finally {
      setBulkSending(false);
    }
  };

  const { orders, summary, meta, loading, error, refetch } = useAllOrders({
    status: statusFilter !== "ALL" ? (statusFilter as OrderStatus) : undefined,
    page,
    limit,
    userSearch: debouncedSearch || undefined,
  });
  const { updateStatus } = useUpdateOrderStatus();

  const stats = getOrderStats(summary);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateStatus({ orderId, status });
      refetch();
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">
              Error loading orders:{" "}
              {(error as Error)?.message || "Unknown error"}
            </p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="mt-4"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track customer orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setBulkDialogOpen(true)}
            variant="outline"
            size="sm"
            className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-800"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Notify All Confirmed
          </Button>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5 text-teal-600 shrink-0" /> Web:{" "}
                <span className="font-bold text-foreground">
                  {stats.webOrdersCount}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <Smartphone className="h-3.5 w-3.5 text-indigo-600 shrink-0" />{" "}
                App:{" "}
                <span className="font-bold text-foreground">
                  {stats.appOrdersCount}
                </span>
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{stats.totalRevenue.toLocaleString()}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5 text-teal-600 shrink-0" /> Web:{" "}
                <span className="font-bold text-foreground">
                  ₹{stats.webRevenue.toLocaleString()}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <Smartphone className="h-3.5 w-3.5 text-indigo-600 shrink-0" />{" "}
                App:{" "}
                <span className="font-bold text-foreground">
                  ₹{stats.appRevenue.toLocaleString()}
                </span>
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.confirmed + stats.packed + (stats.shipmentFailed ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.shipped + stats.inTransit}
            </div>
            <p className="text-xs text-muted-foreground">Out for delivery</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card className="border-blue-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Confirmed</p>
                <p className="text-lg font-bold">{stats.confirmed}</p>
              </div>
              <CheckCircle className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Packed</p>
                <p className="text-lg font-bold">{stats.packed}</p>
              </div>
              <Package className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Shipped</p>
                <p className="text-lg font-bold">{stats.shipped}</p>
              </div>
              <Truck className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-indigo-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">In Transit</p>
                <p className="text-lg font-bold">{stats.inTransit}</p>
              </div>
              <Truck className="h-5 w-5 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Delivered</p>
                <p className="text-lg font-bold">{stats.delivered}</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Failed</p>
                <p className="text-lg font-bold">{stats.shipmentFailed ?? 0}</p>
              </div>
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order #, customer name, email, phone or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Orders</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="PACKED">Packed</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="SHIPMENT_FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Orders ({meta?.totalCount || 0})</span>
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm("")}
              >
                Clear search
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <OrderTable
            orders={orders}
            onViewDetails={handleViewDetails}
            onUpdateStatus={handleUpdateStatus}
          />
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing page <span className="font-medium">{page}</span> of{" "}
              <span className="font-medium">{meta?.totalPages || 1}</span>
            </p>
            <Pagination
              currentPage={page}
              totalPages={meta?.totalPages || 1}
              onPageChange={setPage}
            />
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <OrderDetailsDialog
        order={selectedOrder}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />

      {/* Bulk WhatsApp Delay Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={(o) => { if (!bulkSending) { setBulkDialogOpen(o); if (!o) setBulkResult(null); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              Notify All Confirmed Orders
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              This will send the <span className="font-semibold text-foreground">Order Delay</span> WhatsApp template to <span className="font-semibold text-foreground">all confirmed orders</span> in the system.
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Reason for delay</Label>
              <Select value={bulkReason} onValueChange={setBulkReason} disabled={bulkSending}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DELAY_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {bulkResult && (
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted border text-sm">
                <span className="text-green-700 font-semibold">✓ Sent: {bulkResult.sent}</span>
                {bulkResult.failed > 0 && (
                  <span className="text-red-600 font-semibold">✗ Failed: {bulkResult.failed}</span>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setBulkDialogOpen(false); setBulkResult(null); }}
              disabled={bulkSending}
            >
              {bulkResult ? "Close" : "Cancel"}
            </Button>
            {!bulkResult && (
              <Button
                size="sm"
                onClick={handleBulkDelaySend}
                disabled={bulkSending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {bulkSending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending…</>
                ) : (
                  <><MessageCircle className="h-4 w-4 mr-2" />Send to All Confirmed</>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
