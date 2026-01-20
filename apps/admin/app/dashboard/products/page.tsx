"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Search,
} from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import {
  useProducts,
  useProductsByCategory,
  useSearchProducts,
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useArchiveProduct,
  useUnarchiveProduct,
  useDeleteProduct,
} from "@/lib/products/useProducts";
import {
  ColumnSelector,
  ColumnDefinition,
} from "@/app/dashboard/components/column-selector";
import { ImagePreviewDialog } from "@/app/dashboard/components/image-preview-dialog";
import { Pagination } from "@/app/dashboard/components/pagination";
import { ProductForm } from "./_components/product-form";

const allColumns: ColumnDefinition[] = [
  { key: "_id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "slug", label: "Slug" },
  { key: "brand", label: "Brand" },
  { key: "categoryName", label: "Category Name" },
  { key: "isVegetarian", label: "Vegetarian" },
  { key: "isGlutenFree", label: "Gluten Free" },
  { key: "favourite", label: "Favourite" },
  { key: "isArchived", label: "Archived" },
  { key: "createdAt", label: "Created At" },
  { key: "updatedAt", label: "Updated At" },
];

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('categoryId');

  const [selectedColumns, setSelectedColumns] = useState([
    "name",
    "brand",
    "favourite",
    "isArchived",
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);

  const { data: fullProductData, loading: loadingFullProduct } = useProduct(editingProductId || '') as { data: any; loading: boolean };
  const [productToAction, setProductToAction] = useState<{
    _id: string;
    action: "archive" | "unarchive" | "delete";
    isArchived?: boolean;
  } | null>(null);
  const [imagePreview, setImagePreview] = useState<{
    url: string;
    title: string;
  } | null>(null);

  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const allProductsQuery = useProducts({ page: currentPage, limit: pageSize }, false, showArchived);
  const categoryProductsQuery = useProductsByCategory(
    categoryId || '',
    { page: currentPage, limit: pageSize }
  );
  const searchProductsQuery = useSearchProducts(
    debouncedSearchTerm,
    { page: currentPage, limit: pageSize }
  );

  const productsQuery = debouncedSearchTerm
    ? searchProductsQuery
    : (categoryId ? categoryProductsQuery : allProductsQuery);
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
  } = productsQuery;
  const { mutate: createProduct } = useCreateProduct();
  const { mutate: updateProduct } = useUpdateProduct();
  const { mutate: archiveProduct } = useArchiveProduct();
  const { mutate: unarchiveProduct } = useUnarchiveProduct();
  const { mutate: deleteProduct } = useDeleteProduct();

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryId]);

  useEffect(() => {
    if (fullProductData?.product) {
      setEditingProduct(fullProductData.product);
      if (editingProductId && !isDialogOpen) {
        setIsDialogOpen(true);
      }
    }
  }, [fullProductData, editingProductId, isDialogOpen]);

  const products = debouncedSearchTerm
    ? (productsData as any)?.searchProducts?.items || []
    : categoryId
      ? (productsData as any)?.productsByCategory?.items || []
      : (productsData as any)?.products?.items || [];

  const meta = debouncedSearchTerm
    ? (productsData as any)?.searchProducts?.meta || {
      totalCount: 0,
      page: 1,
      limit: pageSize,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    }
    : categoryId
      ? (productsData as any)?.productsByCategory?.meta || {
        totalCount: 0,
        page: 1,
        limit: pageSize,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      }
      : (productsData as any)?.products?.meta || {
        totalCount: 0,
        page: 1,
        limit: pageSize,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

  const handleColumnToggle = (columnKey: string) => {
    setSelectedColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((key) => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAction = async (
    productId: string,
    action: "archive" | "unarchive" | "delete",
    isArchived?: boolean
  ) => {
    setProductToAction({ _id: productId, action, isArchived });
    setDeleteAlertOpen(true);
  };

  const handleActionConfirm = async () => {
    if (productToAction) {
      try {
        if (productToAction.action === "archive") {
          await archiveProduct({ variables: { _id: productToAction._id } });
        } else if (productToAction.action === "unarchive") {
          await unarchiveProduct({ variables: { _id: productToAction._id } });
        } else if (productToAction.action === "delete") {
          await deleteProduct({ variables: { _id: productToAction._id } });
        }
        setProductToAction(null);
      } catch (error) {
        console.error(`Failed to ${productToAction.action} product:`, error);
      }
    }
    setDeleteAlertOpen(false);
  };

  const handleFavouriteToggle = async (
    productId: string,
    currentFavourite: boolean
  ) => {
    try {
      await updateProduct({
        variables: {
          _id: productId,
          input: {
            favourite: !currentFavourite,
          },
        },
      });
    } catch (error) {
      console.error("Failed to toggle product favourite status:", error);
    }
  };

  const handleArchiveToggle = async (
    productId: string,
    currentArchived: boolean
  ) => {
    try {
      if (currentArchived) {
        await unarchiveProduct({
          variables: { _id: productId },
        });
      } else {
        await archiveProduct({
          variables: { _id: productId },
        });
      }
    } catch (error) {
      console.error("Failed to toggle product archive status:", error);
    }
  };

  const handleEdit = (productId: string) => {
    setEditingProductId(productId);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setEditingProductId(null);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setEditingProductId(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          {categoryId && (
            <Link href="/dashboard/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to All Products
            </Link>
          )}
          <h2 className="text-3xl font-bold tracking-tight">
            {categoryId ? 'Category Products' : 'Products'}
          </h2>
          {categoryId && (
            <p className="text-sm text-muted-foreground mt-1">
              Showing products for selected category
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative w-64 md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {!categoryId && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-archived"
                checked={showArchived}
                onCheckedChange={(checked) => setShowArchived(checked as boolean)}
              />
              <label
                htmlFor="show-archived"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Show Archived
              </label>
            </div>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddProduct}>Add Product</Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl w-[95vw] max-h-[90vh] overflow-y-auto sm:max-w-7xl">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </DialogTitle>
              </DialogHeader>
              <ProductForm
                onClose={handleCloseDialog}
                initialData={editingProduct}
                createProduct={createProduct}
                updateProduct={updateProduct}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        <ColumnSelector
          allColumns={allColumns}
          selectedColumns={selectedColumns}
          onColumnToggle={handleColumnToggle}
        />

        <div className="rounded-md border">
          {productsLoading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : productsError ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-destructive">
                Error loading products: {productsError.message}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    {selectedColumns.map((columnKey) => {
                      const column = allColumns.find(
                        (c) => c.key === columnKey
                      );
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
                        No products found. Add your first product to get
                        started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product: any) => (
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
                              <Switch
                                checked={product.isArchived}
                                onCheckedChange={() =>
                                  handleArchiveToggle(
                                    product._id,
                                    product.isArchived
                                  )
                                }
                              />
                            ) : columnKey === "categoryName" ? (
                              product?.category?.name && (
                                <span className="text-muted-foreground">{product.category.name}</span>
                              )
                            ) : columnKey === "isVegetarian" ||
                              columnKey === "isGlutenFree" ? (
                              product[columnKey] ? (
                                "✓"
                              ) : (
                                "✗"
                              )
                            ) : columnKey === "favourite" ? (
                              <Switch
                                checked={product.favourite}
                                onCheckedChange={() =>
                                  handleFavouriteToggle(
                                    product._id,
                                    product.favourite
                                  )
                                }
                              />
                            ) : (
                              <div className="max-w-[200px] truncate">
                                {String(
                                  product[columnKey as keyof typeof product] ||
                                  "-"
                                )}
                              </div>
                            )}
                          </TableCell>
                        ))}
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleEdit(product._id)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleAction(
                                    product._id,
                                    product.isArchived
                                      ? "unarchive"
                                      : "archive",
                                    product.isArchived
                                  )
                                }
                                className={
                                  product.isArchived
                                    ? "text-green-600"
                                    : "text-orange-600"
                                }
                              >
                                {product.isArchived ? (
                                  <>
                                    <ArchiveRestore className="mr-2 h-4 w-4" />
                                    Unarchive
                                  </>
                                ) : (
                                  <>
                                    <Archive className="mr-2 h-4 w-4" />
                                    Archive
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleAction(product._id, "delete")
                                }
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {products.length > 0 && (
                <Pagination
                  currentPage={meta.page}
                  totalPages={meta.totalPages}
                  totalCount={meta.totalCount}
                  pageSize={meta.limit}
                  onPageChange={handlePageChange}
                  hasNextPage={meta.hasNextPage}
                  hasPreviousPage={meta.hasPreviousPage}
                />
              )}
            </>
          )}
        </div>
      </div>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {productToAction?.action === "delete"
                ? "This action cannot be undone. This will permanently delete the product."
                : productToAction?.action === "archive"
                  ? "This will archive the product. Archived products are hidden by default but can be restored later."
                  : "This will unarchive the product and make it visible again."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleActionConfirm}
              className={
                productToAction?.action === "delete"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {productToAction?.action === "delete"
                ? "Delete"
                : productToAction?.action === "archive"
                  ? "Archive"
                  : "Unarchive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ImagePreviewDialog
        imageUrl={imagePreview?.url || null}
        title={imagePreview?.title || ""}
        open={!!imagePreview}
        onOpenChange={() => setImagePreview(null)}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <ProductsPageContent />
    </Suspense>
  );
}
