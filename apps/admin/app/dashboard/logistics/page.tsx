"use client";

import { useLogisticsPage } from "../../../hooks/useLogisticsPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Package, IndianRupee, MapPin } from "lucide-react";
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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Logistics Analytics</h2>
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
      ) : !state.analytics ? (
        <div className="flex h-96 items-center justify-center">
          <p className="text-muted-foreground">No data available for this period.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Logistics Cost</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(state.analytics.totalCost)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Includes Base, Fuel (25%), FOV (0.2%), and GST (18%)
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Volumetric Weight</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{state.analytics.totalVolumetricWeight.toFixed(2)} kg</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Boxes Used</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{state.analytics.totalBoxesUsed}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Most Used Box</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold truncate">
                  {state.analytics.mostUsedBox ? state.analytics.mostUsedBox.boxName : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Used {state.analytics.mostUsedBox?.count || 0} times
                </p>
              </CardContent>
            </Card>
          </div>

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
                      <TableHead className="text-right">Vol Weight (kg)</TableHead>
                      <TableHead className="text-right">Base Cost</TableHead>
                      <TableHead className="text-right">Total Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.analytics.regionStats?.map((region: any) => (
                      <TableRow key={region.region}>
                        <TableCell className="font-medium">{region.region}</TableCell>
                        <TableCell className="text-right">{region.count}</TableCell>
                        <TableCell className="text-right">{region.volumetricWeight.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(region.baseCost)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(region.totalCost)}</TableCell>
                      </TableRow>
                    ))}
                    {(!state.analytics.regionStats || state.analytics.regionStats.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
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
                    {state.analytics.boxUsage?.map((box: any) => (
                      <TableRow key={box.boxId}>
                        <TableCell className="font-medium truncate max-w-[150px]">
                          {box.boxName}
                        </TableCell>
                        <TableCell className="text-right">{box.count}</TableCell>
                        <TableCell className="text-right">{formatCurrency(box.costGenerated)}</TableCell>
                      </TableRow>
                    ))}
                    {(!state.analytics.boxUsage || state.analytics.boxUsage.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
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
