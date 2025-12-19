"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import {
  ColumnSelector,
  ColumnDefinition,
} from "@/app/dashboard/components/column-selector";
import { Pagination } from "@/app/dashboard/components/pagination";
import { ProductActions } from "./product-actions";
import { Product } from "@/types/product";
import { Badge } from "@/components/ui/badge";

export const allColumns: ColumnDefinition[] = [
  { key: "_id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "slug", label: "Slug" },
  { key: "brand", label: "Brand" },
  { key: "categoryIds", label: "Categories" },
  { key: "variants", label: "Variants" },
  { key: "priceRange", label: "Price Range" },
  { key: "thumbnailUrl", label: "Thumbnail" },
  { key: "defaultVariant", label: "Default SKU" },
  { key: "isVegetarian", label: "Vegetarian" },
  { key: "isGlutenFree", label: "Gluten Free" },
  { key: "isArchived", label: "Archived" },
  { key: "createdAt", label: "Created At" },
  { key: "updatedAt", label: "Updated At" },
];

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  error: any;
  selectedColumns: string[];
  onColumnToggle: (columnKey: string) => void;
  onEdit: (id: string) => void;
  onAction: (
    id: string,
    action: "archive" | "unarchive" | "delete",
    isArchived?: boolean
  ) => void;
  onImagePreview: (url: string, title: string) => void;
  meta: {
    page: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  onPageChange: (page: number) => void;
}

export function ProductTable({
  products,
  loading,
  error,
  selectedColumns,
  onColumnToggle,
  onEdit,
  onAction,
  onImagePreview,
  meta,
  onPageChange,
}: ProductTableProps) {
  const formatCurrency = (amount: number, currency: string = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <ColumnSelector
        allColumns={allColumns}
        selectedColumns={selectedColumns}
        onColumnToggle={onColumnToggle}
      />

      <div className="rounded-md border">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-destructive">
              Error loading products: {error.message}
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  {selectedColumns.map((columnKey) => {
                    const column = allColumns.find((c) => c.key === columnKey);
                    return (
                      <TableHead key={columnKey}>{column?.label}</TableHead>
                    );
                  })}
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={selectedColumns.length + 1}
                      className="text-center text-muted-foreground"
                    >
                      No products found. Add your first product to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => {
                    const defaultVariant =
                      product.defaultVariant || product.variants?.[0];
                    const thumbnailUrl =
                      defaultVariant?.thumbnailUrl ||
                      product.variants?.[0]?.thumbnailUrl;

                    return (
                      <TableRow key={product._id}>
                        {selectedColumns.map((columnKey) => (
                          <TableCell key={columnKey}>
                            {columnKey === "name" ? (
                              <Link
                                href={`/dashboard/products/${product._id}`}
                                className="font-medium text-blue-600 hover:underline"
                              >
                                {product.name}
                              </Link>
                            ) : columnKey === "isArchived" ? (
                              <span
                                className={
                                  product.isArchived
                                    ? "text-orange-600"
                                    : "text-green-600"
                                }
                              >
                                {product.isArchived ? "Archived" : "Active"}
                              </span>
                            ) : columnKey === "thumbnailUrl" ? (
                              thumbnailUrl ? (
                                <button
                                  onClick={() =>
                                    onImagePreview(
                                      String(thumbnailUrl),
                                      "Product Thumbnail"
                                    )
                                  }
                                  className="text-blue-600 hover:text-blue-800 underline text-left max-w-[200px] truncate block"
                                >
                                  View Image
                                </button>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )
                            ) : columnKey === "variants" ? (
                              <Badge variant="outline">
                                {product.variants?.length || 0} variant(s)
                              </Badge>
                            ) : columnKey === "priceRange" ? (
                              product.priceRange ? (
                                <span>
                                  {formatCurrency(
                                    product.priceRange.min,
                                    product.currency
                                  )}{" "}
                                  -{" "}
                                  {formatCurrency(
                                    product.priceRange.max,
                                    product.currency
                                  )}
                                </span>
                              ) : defaultVariant ? (
                                formatCurrency(
                                  defaultVariant.price,
                                  product.currency
                                )
                              ) : (
                                "-"
                              )
                            ) : columnKey === "defaultVariant" ? (
                              defaultVariant?.sku || "-"
                            ) : columnKey === "isVegetarian" ||
                              columnKey === "isGlutenFree" ? (
                              product[columnKey as keyof Product] ? (
                                "✓"
                              ) : (
                                "✗"
                              )
                            ) : (
                              <div className="max-w-[200px] truncate">
                                {String(
                                  product[columnKey as keyof Product] || "-"
                                )}
                              </div>
                            )}
                          </TableCell>
                        ))}
                        <TableCell>
                          <ProductActions
                            product={product}
                            onEdit={onEdit}
                            onAction={onAction}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            {products.length > 0 && (
              <Pagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
                totalCount={meta.totalCount}
                pageSize={meta.limit}
                onPageChange={onPageChange}
                hasNextPage={meta.hasNextPage}
                hasPreviousPage={meta.hasPreviousPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
