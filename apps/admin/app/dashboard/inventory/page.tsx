"use client";

import { useState, useEffect } from "react";
import {
  useProducts,
  useUpdateProductVariantStock,
  useZeroAllProductStock,
  Product,
  ProductVariant,
} from "@/lib/products/useProducts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Package,
  Plus,
  Minus,
  Check,
  AlertTriangle,
  XCircle,
  Database,
  RefreshCw,
  TrendingDown,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { getCdnUrl } from "@/lib/utils/image-utils";
import { Pagination } from "@/app/dashboard/components/pagination";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";

const GET_ALL_PRODUCTS_STOCK = gql`
  query GetAllProductsStock {
    products(
      pagination: { page: 1, limit: 1000 }
      includeOutOfStock: true
      includeArchived: false
    ) {
      items {
        variants {
          _id
          stockQuantity
        }
      }
    }
  }
`;

interface RowLoadingState {
  [variantId: string]: boolean;
}

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "OUT" | "LOW" | "IN"
  >("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25);
  const [stockInputs, setStockInputs] = useState<{
    [variantId: string]: string;
  }>({});
  const [savingState, setSavingState] = useState<RowLoadingState>({});

  // Fetch all products (retrieve 100 products per page to acts as a centralized dashboard)
  const { data, loading, error, refetch } = useProducts(
    { page: currentPage, limit: pageSize },
    true,
    false,
  );
  const { updateVariantStock } = useUpdateProductVariantStock();
  const { zeroAllStock, loading: zeroingStock } = useZeroAllProductStock();

  // Fetch stock quantities for all products/variants to calculate overall stats
  const { data: statsData, refetch: refetchStats } = useQuery(
    GET_ALL_PRODUCTS_STOCK,
    {
      fetchPolicy: "cache-and-network",
    },
  );

  const products: Product[] = (data as any)?.products?.items || [];
  const meta = (data as any)?.products?.meta || {
    totalCount: 0,
    totalPages: 1,
  };

  // Extract all variants from all products with parent context
  const allVariants = products.flatMap((product) =>
    (product.variants || [])
      .filter((variant) => !!variant._id)
      .map((variant) => ({
        ...variant,
        _id: variant._id as string,
        productId: product._id,
        productName: product.name,
        productImage: variant.thumbnailUrl || variant.images?.[0]?.url || "",
      })),
  );

  // Sync initial inputs when products load
  useEffect(() => {
    const inputs: { [variantId: string]: string } = {};
    allVariants.forEach((v) => {
      inputs[v._id] = String(v.stockQuantity);
    });
    setStockInputs(inputs);
  }, [products]);

  // Filter variants based on search and stock status
  const filteredVariants = allVariants.filter((v) => {
    const matchesSearch =
      v.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.sku.toLowerCase().includes(searchTerm.toLowerCase());

    const stock = v.stockQuantity;
    let matchesStatus = true;
    if (statusFilter === "OUT") matchesStatus = stock === 0;
    else if (statusFilter === "LOW") matchesStatus = stock > 0 && stock < 10;
    else if (statusFilter === "IN") matchesStatus = stock >= 10;

    return matchesSearch && matchesStatus;
  });

  // Handle absolute stock level update
  const handleUpdateStock = async (
    productId: string,
    variantId: string,
    value: number,
  ) => {
    if (value < 0 || isNaN(value)) {
      toast.error("Invalid stock quantity");
      return;
    }

    setSavingState((prev) => ({ ...prev, [variantId]: true }));
    try {
      await updateVariantStock(productId, variantId, value);
      toast.success("Stock level updated successfully!");
      refetch();
      refetchStats();
    } catch (err: any) {
      toast.error(err.message || "Failed to update stock");
    } finally {
      setSavingState((prev) => ({ ...prev, [variantId]: false }));
    }
  };

  // Handle relative stock increment/decrement
  const handleAdjustStock = async (
    productId: string,
    variantId: string,
    currentStock: number,
    adjustment: number,
  ) => {
    const newStock = Math.max(0, currentStock + adjustment);
    setStockInputs((prev) => ({ ...prev, [variantId]: String(newStock) }));
    await handleUpdateStock(productId, variantId, newStock);
  };

  // Stock status badge component
  const getStockBadge = (qty: number) => {
    if (qty === 0) {
      return (
        <Badge
          variant="destructive"
          className="bg-red-50 text-red-600 border-red-200 text-[10px] py-0 px-1.5 h-5 flex items-center gap-1 w-max font-bold"
        >
          <XCircle className="h-3 w-3 shrink-0" /> Out of Stock
        </Badge>
      );
    }
    if (qty < 10) {
      return (
        <Badge
          variant="outline"
          className="border-orange-200 text-orange-600 bg-orange-50 text-[10px] py-0 px-1.5 h-5 flex items-center gap-1 w-max font-bold"
        >
          <AlertTriangle className="h-3 w-3 shrink-0" /> Low Stock
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="border-green-200 text-green-600 bg-green-50 text-[10px] py-0 px-1.5 h-5 flex items-center gap-1 w-max font-bold"
      >
        <Check className="h-3 w-3 shrink-0" /> In Stock
      </Badge>
    );
  };

  // Calculate high-level overall stock insights from ALL products
  const allProductsForStats = (statsData as any)?.products?.items || [];
  const allVariantsForStats = allProductsForStats.flatMap(
    (product: any) => product.variants || [],
  );

  const totals =
    allVariantsForStats.length > 0
      ? allVariantsForStats.reduce(
          (acc: any, v: any) => {
            acc.totalItems += 1;
            if (v.stockQuantity === 0) acc.outOfStock += 1;
            else if (v.stockQuantity < 10) acc.lowStock += 1;
            else acc.inStock += 1;
            return acc;
          },
          { totalItems: 0, outOfStock: 0, lowStock: 0, inStock: 0 },
        )
      : allVariants.reduce(
          (acc, v) => {
            acc.totalItems += 1;
            if (v.stockQuantity === 0) acc.outOfStock += 1;
            else if (v.stockQuantity < 10) acc.lowStock += 1;
            else acc.inStock += 1;
            return acc;
          },
          { totalItems: 0, outOfStock: 0, lowStock: 0, inStock: 0 },
        );

  return (
    <div className="p-6 space-y-6 mb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
            <Package className="h-8 w-8 text-indigo-600 shrink-0" /> Central
            Inventory Hub
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Centrally manage and update stock levels for all products and
            variants instantly.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 self-start sm:self-auto">
          <Button
            onClick={() => {
              refetch();
              refetchStats();
            }}
            variant="outline"
            size="sm"
            className="cursor-pointer"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Stock
          </Button>
          <Button
            onClick={async () => {
              const confirmed = window.confirm(
                "🚨 WARNING: Are you sure you want to reset the stock level of ALL variants across ALL products in the entire warehouse to 0? This action cannot be undone.",
              );
              if (!confirmed) return;

              try {
                await zeroAllStock();
                toast.success("All stock levels reset to 0 store-wide!");
                refetch();
                refetchStats();
              } catch (err: any) {
                toast.error(err.message || "Failed to reset stock levels");
              }
            }}
            variant="destructive"
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer transition-all duration-200 shadow-sm flex items-center gap-2"
            disabled={zeroingStock}
          >
            {zeroingStock ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                <TrendingDown className="h-4 w-4" />
                Zero All Stock
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total SKUs
            </CardTitle>
            <Database className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-gray-900">
              {totals.totalItems}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Variants actively tracked
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-green-100 bg-green-50/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-green-700">
              In Stock
            </CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-green-700">
              {totals.inStock}
            </div>
            <p className="text-xs text-green-600/80 mt-0.5">
              Healthy stock levels
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-orange-100 bg-orange-50/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-orange-700">
              Low Stock
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-orange-700">
              {totals.lowStock}
            </div>
            <p className="text-xs text-orange-600/80 mt-0.5">
              Requires replenishment
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-red-100 bg-red-50/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-red-700">
              Out of Stock
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-red-700">
              {totals.outOfStock}
            </div>
            <p className="text-xs text-red-600/80 mt-0.5">
              Urgent priority outward
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="shadow-sm border-gray-200">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory by product name, variant, or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">
                Status:
              </span>
              <Button
                variant={statusFilter === "ALL" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("ALL")}
                className="text-xs h-8 px-3 rounded-full cursor-pointer"
              >
                All
              </Button>
              <Button
                variant={statusFilter === "IN" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("IN")}
                className={`text-xs h-8 px-3 rounded-full cursor-pointer ${
                  statusFilter === "IN"
                    ? ""
                    : "hover:border-green-300 hover:text-green-600"
                }`}
              >
                In Stock ({totals.inStock})
              </Button>
              <Button
                variant={statusFilter === "LOW" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("LOW")}
                className={`text-xs h-8 px-3 rounded-full cursor-pointer ${
                  statusFilter === "LOW"
                    ? ""
                    : "hover:border-orange-300 hover:text-orange-600"
                }`}
              >
                Low Stock ({totals.lowStock})
              </Button>
              <Button
                variant={statusFilter === "OUT" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("OUT")}
                className={`text-xs h-8 px-3 rounded-full cursor-pointer ${
                  statusFilter === "OUT"
                    ? ""
                    : "hover:border-red-300 hover:text-red-600"
                }`}
              >
                Out of Stock ({totals.outOfStock})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Inventory Management Grid */}
      <Card className="shadow-sm border-gray-200 overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <p className="text-sm text-gray-500">
                Loading catalog inventory data...
              </p>
            </div>
          ) : error ? (
            <div className="p-10 text-center text-red-600 text-sm">
              Error fetching products variant catalog: {error.message}
            </div>
          ) : filteredVariants.length === 0 ? (
            <div className="p-16 text-center text-gray-400 font-medium flex flex-col items-center gap-2">
              <Package className="h-10 w-10 text-gray-300" />
              <span>No product variants match your filters.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider py-2 px-3">
                      Product
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider py-2 px-3">
                      Variant details
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider py-2 px-3">
                      SKU Code
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider py-2 px-3">
                      Price / MRP
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider py-2 px-3">
                      Status
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider py-2 px-3 text-center w-[160px]">
                      Stock Level
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider py-2 px-3 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVariants.map((variant) => {
                    const isSaving = savingState[variant._id];
                    return (
                      <TableRow
                        key={variant._id}
                        className="hover:bg-gray-50/50 transition-colors h-auto"
                      >
                        {/* Image & Product Name */}
                        <TableCell className="py-2.5 px-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={getCdnUrl(variant.productImage)}
                              alt={variant.productName}
                              className="h-9 w-9 rounded-md object-cover border border-gray-100 bg-gray-50 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "/placeholder-product.png";
                              }}
                            />
                            <div className="leading-snug">
                              <span className="font-semibold text-gray-900 text-xs hover:underline block max-w-[220px] truncate">
                                {variant.productName}
                              </span>
                              <span className="text-[10px] text-gray-400 font-normal">
                                Let's Try Foods
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Variant Name */}
                        <TableCell className="py-2.5 px-3 font-medium text-gray-700 text-xs">
                          {variant.name}{" "}
                          {variant.weight
                            ? `(${variant.weight} ${variant.weightUnit})`
                            : ""}
                        </TableCell>

                        {/* SKU */}
                        <TableCell className="py-2.5 px-3">
                          <span
                            className="font-mono text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded select-all hover:bg-gray-200 transition-colors cursor-pointer"
                            onClick={() => {
                              navigator.clipboard.writeText(variant.sku);
                              toast.success("SKU copied to clipboard!");
                            }}
                            title="Click to copy SKU"
                          >
                            {variant.sku}
                          </span>
                        </TableCell>

                        {/* Price */}
                        <TableCell className="py-2.5 px-3 text-xs text-gray-600">
                          <div className="leading-snug">
                            <span className="font-bold text-gray-900 block">
                              ₹{variant.price}
                            </span>
                            <span className="text-[10px] text-gray-400 line-through font-medium">
                              ₹{variant.mrp}
                            </span>
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-2.5 px-3">
                          {getStockBadge(variant.stockQuantity)}
                        </TableCell>

                        {/* Stock Controls (Inline inputs and buttons) */}
                        <TableCell className="py-2.5 px-3 text-center">
                          <div className="inline-flex items-center justify-center gap-1.5">
                            {/* Decrement Button */}
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 rounded-md cursor-pointer border-gray-200 shrink-0 text-gray-600 hover:bg-gray-100"
                              onClick={() =>
                                handleAdjustStock(
                                  variant.productId,
                                  variant._id,
                                  variant.stockQuantity,
                                  -1,
                                )
                              }
                              disabled={variant.stockQuantity <= 0 || isSaving}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>

                            {/* Direct Text Input */}
                            <Input
                              type="number"
                              value={
                                stockInputs[variant._id] !== undefined
                                  ? stockInputs[variant._id]
                                  : ""
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                setStockInputs((prev) => ({
                                  ...prev,
                                  [variant._id]: val,
                                }));
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const num = parseInt(
                                    stockInputs[variant._id] || "0",
                                  );
                                  handleUpdateStock(
                                    variant.productId,
                                    variant._id,
                                    num,
                                  );
                                }
                              }}
                              onBlur={() => {
                                const num = parseInt(
                                  stockInputs[variant._id] || "0",
                                );
                                if (num !== variant.stockQuantity) {
                                  handleUpdateStock(
                                    variant.productId,
                                    variant._id,
                                    num,
                                  );
                                }
                              }}
                              className="h-7 w-14 text-center font-mono text-xs font-semibold py-0 px-1 border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              disabled={isSaving}
                            />

                            {/* Increment Button */}
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 rounded-md cursor-pointer border-gray-200 shrink-0 text-gray-600 hover:bg-gray-100"
                              onClick={() =>
                                handleAdjustStock(
                                  variant.productId,
                                  variant._id,
                                  variant.stockQuantity,
                                  1,
                                )
                              }
                              disabled={isSaving}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>

                        {/* Inline saving indicator / refresh */}
                        <TableCell className="py-2.5 px-3 text-right">
                          {isSaving ? (
                            <span className="flex items-center justify-end gap-1.5 text-[10px] font-semibold text-indigo-600">
                              <Loader2 className="h-3 w-3 animate-spin shrink-0" />{" "}
                              Saving...
                            </span>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-[10px] font-semibold h-7 py-0.5 px-2 rounded cursor-pointer"
                              onClick={() => {
                                const num = parseInt(
                                  stockInputs[variant._id] || "0",
                                );
                                handleUpdateStock(
                                  variant.productId,
                                  variant._id,
                                  num,
                                );
                              }}
                              disabled={
                                parseInt(stockInputs[variant._id] || "0") ===
                                variant.stockQuantity
                              }
                            >
                              Update
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {meta.totalPages > 1 && (
                <div className="border-t border-gray-200 px-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={meta.totalPages}
                    totalCount={meta.totalCount}
                    pageSize={pageSize}
                    onPageChange={(page) => setCurrentPage(page)}
                    hasNextPage={meta.hasNextPage}
                    hasPreviousPage={meta.hasPreviousPage}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
