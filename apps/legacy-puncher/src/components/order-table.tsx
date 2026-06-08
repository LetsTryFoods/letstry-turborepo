"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LegacyOrder } from "@/lib/logistics/types";
import { toast } from "sonner";
import {
  Truck,
  FileText,
  Download,
  Loader2,
  ExternalLink,
  PackageCheck,
  Tag,
} from "lucide-react";

interface OrderTableProps {
  orders: LegacyOrder[];
}

interface OrderState {
  punched?: "DTDC" | "SHIPROCKET";
  awb?: string;
  labelUrl?: string;
  isPunching?: boolean;
  isGeneratingInvoice?: boolean;
  isGeneratingLabel?: boolean;
}

export function OrderTable({ orders }: OrderTableProps) {
  const [orderStates, setOrderStates] = useState<Record<string, OrderState>>(
    {},
  );

  const updateOrderState = (orderId: string, newState: Partial<OrderState>) => {
    setOrderStates((prev) => ({
      ...prev,
      [orderId]: { ...(prev[orderId] || {}), ...newState },
    }));
  };

  const handlePunch = async (
    order: LegacyOrder,
    provider: "DTDC" | "SHIPROCKET",
  ) => {
    updateOrderState(order.orderId, { isPunching: true });

    try {
      const response = await fetch("/api/punch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order, provider }),
      });

      const result = await response.json();

      if (result.success) {
        updateOrderState(order.orderId, {
          punched: provider,
          awb: result.awbNumber,
          labelUrl: result.labelUrl,
          isPunching: false,
        });
        toast.success(`Successfully punched ${order.orderId} to ${provider}`);
      } else {
        updateOrderState(order.orderId, { isPunching: false });
        toast.error(`Punch failed: ${result.error}`);
      }
    } catch (error: any) {
      updateOrderState(order.orderId, { isPunching: false });
      toast.error(`Request failed: ${error.message}`);
    }
  };

  const handleGenerateInvoice = async (order: LegacyOrder) => {
    updateOrderState(order.orderId, { isGeneratingInvoice: true });

    try {
      const response = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });

      if (!response.ok) throw new Error("Failed to generate invoice");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${order.orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      updateOrderState(order.orderId, { isGeneratingInvoice: false });
      toast.success(`Invoice generated for ${order.orderId}`);
    } catch (error: any) {
      updateOrderState(order.orderId, { isGeneratingInvoice: false });
      toast.error(`Invoice generation failed: ${error.message}`);
    }
  };

  const handleGenerateLabel = async (order: LegacyOrder) => {
    updateOrderState(order.orderId, { isGeneratingLabel: true });

    try {
      const response = await fetch("/api/label", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });

      if (!response.ok) throw new Error("Failed to generate label");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `label-${order.orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      updateOrderState(order.orderId, { isGeneratingLabel: false });
      toast.success(`Label generated for ${order.orderId}`);
    } catch (error: any) {
      updateOrderState(order.orderId, { isGeneratingLabel: false });
      toast.error(`Label generation failed: ${error.message}`);
    }
  };

  const handleDownloadLabel = (labelUrl: string, awb: string) => {
    if (!labelUrl) return;

    // If labelUrl is base64 (starts with data:application/pdf;base64,)
    if (labelUrl.startsWith("data:")) {
      const link = document.createElement("a");
      link.href = labelUrl;
      link.download = `label-${awb}.pdf`;
      link.click();
    } else {
      // If it's a direct URL
      window.open(labelUrl, "_blank");
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const state = orderStates[order.orderId] || {};
            const isPunched = !!state.awb;

            return (
              <TableRow key={order.orderId}>
                <TableCell className="font-medium">{order.orderId}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold">
                      {order.address.recipientName}
                    </span>
                    <span className="text-xs text-slate-500">
                      {order.address.city}, {order.address.pincode}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs">{order.items.length} items</div>
                </TableCell>
                <TableCell>₹{order.totalAmount}</TableCell>
                <TableCell>
                  {isPunched ? (
                    <div className="flex flex-col gap-1">
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        <PackageCheck className="mr-1 h-3 w-3" />
                        Punched ({state.punched})
                      </Badge>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {state.awb}
                      </span>
                    </div>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-700 border-amber-200"
                    >
                      Pending
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 flex-wrap">
                    {!isPunched ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={() => handlePunch(order, "DTDC")}
                          disabled={state.isPunching}
                        >
                          {state.isPunching ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Truck className="mr-1 h-3 w-3" />
                          )}
                          DTDC
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={() => handlePunch(order, "SHIPROCKET")}
                          disabled={state.isPunching}
                        >
                          {state.isPunching ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Truck className="mr-1 h-3 w-3" />
                          )}
                          Shiprocket
                        </Button>
                      </>
                    ) : (
                      state.labelUrl && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8"
                          onClick={() =>
                            handleDownloadLabel(state.labelUrl!, state.awb!)
                          }
                        >
                          <Download className="mr-1 h-3 w-3" />
                          Ship Label
                        </Button>
                      )
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => handleGenerateLabel(order)}
                      disabled={state.isGeneratingLabel}
                    >
                      {state.isGeneratingLabel ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Tag className="mr-1 h-3 w-3" />
                      )}
                      Delivery Label
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => handleGenerateInvoice(order)}
                      disabled={state.isGeneratingInvoice}
                    >
                      {state.isGeneratingInvoice ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <FileText className="mr-1 h-3 w-3" />
                      )}
                      Invoice
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
