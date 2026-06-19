"use client";

import { useLogisticsPage } from "../../../hooks/useLogisticsPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Package,
  IndianRupee,
  MapPin,
  TrendingDown,
  Truck,
  ShoppingBag,
  PercentIcon,
  BadgePercent,
  ArrowDownRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Package as PackageIcon } from "lucide-react";
import { getCdnUrl } from "../../../lib/utils/image-utils";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(value || 0);

const formatCurrencyFull = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(value || 0);

export default function LogisticsPage() {
  const { state, actions } = useLogisticsPage();

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  const a = state.analytics;
  const d = state.discountAnalytics?.summary;
  const orders = state.discountAnalytics?.orders;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Logistics & Margin Analytics
        </h2>
        <div className="flex items-center space-x-4">
          <Select
            value={state.month.toString()}
            onValueChange={(val) => actions.setMonth(parseInt(val))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value.toString()}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={state.year.toString()}
            onValueChange={(val) => actions.setYear(parseInt(val))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {state.loading ? (
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !a ? (
        <div className="flex h-96 items-center justify-center">
          <p className="text-muted-foreground">
            No data available for this period.
          </p>
        </div>
      ) : (
        <div className="space-y-8">

          {/* ═══════════════════════════════════════════════════════════════
              SECTION 1 — Net Profit & Discount Summary
          ══════════════════════════════════════════════════════════════════ */}
          {d && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-muted-foreground uppercase tracking-wider text-xs">
                Margin & Discount Analysis (Actual Values)
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-green-200 bg-green-50/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Net Revenue (After Logistics)
                    </CardTitle>
                    <IndianRupee className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(d.totalNetRevenue)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      (Subtotal + Delivery Fees) - Courier Cost
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Implied MRP Value
                    </CardTitle>
                    <BadgePercent className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {formatCurrency(d.impliedTotalMRP)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Value before any discount
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Net Discount Given
                    </CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(d.totalNetDiscountAmount)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Includes 30% off + company absorbed delivery
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Avg Effective Discount
                    </CardTitle>
                    <PercentIcon className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {d.avgNetDiscountPct.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Overall discount to MRP ratio
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Summary breakdown card */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <IndianRupee className="h-4 w-4" />
                    Overall Revenue Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Revenue vs Cost
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Implied MRP
                          </span>
                          <span className="font-medium">
                            {formatCurrencyFull(d.impliedTotalMRP)}
                          </span>
                        </div>
                        <div className="flex justify-between text-red-600">
                          <span>— 30% Initial Discount</span>
                          <span>− {formatCurrencyFull(d.totalDiscountOnMRP)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 font-semibold text-green-600">
                          <span>= Customer Order Value</span>
                          <span>
                            {formatCurrencyFull(d.totalSubtotal)}
                          </span>
                        </div>
                        <div className="flex justify-between text-blue-600">
                          <span>+ Delivery Collected</span>
                          <span>
                            + {formatCurrencyFull(d.totalDeliveryChargesCollected)}
                          </span>
                        </div>
                        <div className="flex justify-between text-red-600">
                          <span>— Actual Courier Cost</span>
                          <span>
                            − {formatCurrencyFull(d.totalLogisticsCost)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-2 font-bold text-base text-green-700">
                          <span>= Net Earning (Actual Margin)</span>
                          <span>{formatCurrencyFull(d.totalNetRevenue)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Order Stats
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between mt-3">
                          <span className="text-muted-foreground">
                            Free Delivery Orders (Company bore cost)
                          </span>
                          <Badge variant="outline">
                            {d.freeDeliveryOrdersCount}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Paid Delivery Orders (Customer paid ₹49/₹89)
                          </span>
                          <Badge variant="secondary">
                            {d.paidDeliveryOrdersCount}
                          </Badge>
                        </div>
                        <div className="flex justify-between mt-4">
                          <span className="text-muted-foreground">
                            Company Net Delivery Expense (Absorbed Cost)
                          </span>
                          <span className={d.totalNetCostToBusiness > 0 ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                            {formatCurrencyFull(d.totalNetCostToBusiness)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Wise Table */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Order-wise Margin Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          <TableHead>Order</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                          <TableHead className="text-right">Del Collected</TableHead>
                          <TableHead className="text-right">Courier Cost</TableHead>
                          <TableHead className="text-right bg-green-50/50">Net Revenue</TableHead>
                          <TableHead className="text-right text-muted-foreground">MRP</TableHead>
                          <TableHead className="text-right text-red-500 bg-red-50/50">Net Discount</TableHead>
                          <TableHead className="text-right">Net Disc %</TableHead>
                          <TableHead className="text-center">Box Info</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders?.map((o: any) => (
                          <TableRow key={o.orderId}>
                            <TableCell className="font-medium text-xs">
                              {o.orderNumber || o.orderId}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(o.subtotal)}
                            </TableCell>
                            <TableCell className="text-right">
                              {o.deliveryCharge > 0 ? (
                                <span className="text-blue-600">{formatCurrency(o.deliveryCharge)}</span>
                              ) : (
                                <span className="text-muted-foreground">Free</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right text-red-600">
                              {formatCurrency(o.logisticsCost)}
                            </TableCell>
                            <TableCell className="text-right font-bold text-green-700 bg-green-50/20">
                              {formatCurrency(o.netRevenue)}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {formatCurrency(o.impliedMRP)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-red-600 bg-red-50/20">
                              {formatCurrency(o.netDiscountAmount)}
                            </TableCell>
                            <TableCell className="text-right">
                              {o.netDiscountPct.toFixed(1)}%
                            </TableCell>
                            <TableCell className="text-center">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" title="View Box Info">
                                    <Eye className="h-4 w-4 text-blue-500" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                  <DialogHeader>
                                    <DialogTitle>Box Details for Order</DialogTitle>
                                  </DialogHeader>
                                  <div className="flex flex-col items-center gap-4 py-4">
                                    <div className="text-sm font-semibold">{o.orderNumber || o.orderId}</div>
                                    
                                    {o.boxPhotoUrl ? (
                                      <div className="relative w-full max-w-[250px] aspect-square rounded-lg border overflow-hidden bg-muted flex items-center justify-center">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img 
                                          src={getCdnUrl(o.boxPhotoUrl)} 
                                          alt="Box Image" 
                                          className="object-contain w-full h-full"
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-full max-w-[250px] aspect-square rounded-lg border border-dashed flex flex-col items-center justify-center text-muted-foreground bg-muted/50">
                                        <PackageIcon className="h-10 w-10 mb-2 opacity-50" />
                                        <span className="text-sm">No Image</span>
                                      </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4 w-full text-sm mt-4">
                                      <div className="flex flex-col gap-1">
                                        <span className="text-muted-foreground">Box Selected</span>
                                        <span className="font-medium">{o.boxName || "N/A"}</span>
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        <span className="text-muted-foreground">Volumetric Weight</span>
                                        <span className="font-medium">{o.volumetricWeight ? o.volumetricWeight.toFixed(2) + ' kg' : 'N/A'}</span>
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        <span className="text-muted-foreground">Actual Courier Cost</span>
                                        <span className="font-medium text-red-600">{formatCurrency(o.logisticsCost)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!orders || orders.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                              No order data available
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              SECTION 2 — Logistics / Courier Cost
          ══════════════════════════════════════════════════════════════════ */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-muted-foreground uppercase tracking-wider text-xs">
              Courier Base Stats
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Logistics Cost
                  </CardTitle>
                  <IndianRupee className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(a.totalCost)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Base + Fuel (25%) + FOV (0.2%) + GST (18%)
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Volumetric Weight
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {a.totalVolumetricWeight.toFixed(2)} kg
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Boxes Used
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{a.totalBoxesUsed}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Most Used Box
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold truncate">
                    {a.mostUsedBox ? a.mostUsedBox.boxName : "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Used {a.mostUsedBox?.count || 0} times
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              SECTION 3 — Breakdown Tables
          ══════════════════════════════════════════════════════════════════ */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Region Stats */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Region-wise Cost Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Region</TableHead>
                      <TableHead className="text-right">Orders</TableHead>
                      <TableHead className="text-right">Vol Wt (kg)</TableHead>
                      <TableHead className="text-right">Base Cost</TableHead>
                      <TableHead className="text-right">Total Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {a.regionStats?.map((region: any) => (
                      <TableRow key={region.region}>
                        <TableCell className="font-medium">
                          {region.region}
                        </TableCell>
                        <TableCell className="text-right">
                          {region.count}
                        </TableCell>
                        <TableCell className="text-right">
                          {region.volumetricWeight.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(region.baseCost)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(region.totalCost)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!a.regionStats || a.regionStats.length === 0) && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-4 text-muted-foreground"
                        >
                          No regional data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Box Usage Stats */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Box Size Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Box Size</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                      <TableHead className="text-right">Base Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {a.boxUsage?.map((box: any) => (
                      <TableRow key={box.boxId}>
                        <TableCell className="font-medium truncate max-w-[150px]">
                          {box.boxName}
                        </TableCell>
                        <TableCell className="text-right">
                          {box.count}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(box.costGenerated)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!a.boxUsage || a.boxUsage.length === 0) && (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center py-4 text-muted-foreground"
                        >
                          No box usage data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
