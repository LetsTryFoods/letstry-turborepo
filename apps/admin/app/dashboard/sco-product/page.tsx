"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, RefreshCw, Package, CheckCircle, XCircle, BarChart3 } from "lucide-react";
import { useProductSeoPage } from "@/hooks/useProductSeoPage";
import { ProductSeoTable } from "./components/ProductSeoTable";
import { ProductSeoForm } from "./components/ProductSeoForm";
import { DeleteProductSeoDialog } from "./components/DeleteProductSeoDialog";
import { Pagination } from "../components/pagination";

export default function ProductSeoPage() {
  const {
    // Data
    products,
    seoStatusMap,
    stats,
    
    // Loading states
    isLoading,
    deleteLoading,
    error,
    
    // Form dialog state
    isFormOpen,
    selectedProduct,
    selectedSeoData,
    
    // Delete dialog state
    isDeleteDialogOpen,
    
    // Filters
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    
    // Handlers
    handleEditSeo,
    handleCloseForm,
    handleCloseDeleteDialog,
    handleFormSuccess,
    handleConfirmDelete,
    
    // Refetch
    refetchProducts,

    // Pagination
    currentPage,
    setCurrentPage,
    pageSize,
    paginationMeta,
  } = useProductSeoPage();

  const handleRefresh = () => {
    refetchProducts();
  };

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading data: {error.message}</p>
            <Button onClick={handleRefresh} variant="outline" className="mt-4">
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
          <h1 className="text-2xl font-bold tracking-tight">Product SEO Management</h1>
          <p className="text-muted-foreground">
            Manage SEO metadata for each product to improve search visibility
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Products in catalog</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SEO Configured</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.configuredCount}</div>
            <p className="text-xs text-muted-foreground">Products with SEO</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Not Configured</CardTitle>
            <XCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.notConfiguredCount}</div>
            <p className="text-xs text-muted-foreground">Products need SEO</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.coveragePercentage}%</div>
            <p className="text-xs text-muted-foreground">SEO coverage rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Click on a product to add or edit its SEO configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, slug, or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filterStatus}
              onValueChange={(value: "all" | "configured" | "not-configured") => setFilterStatus(value)}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="configured">SEO Configured</SelectItem>
                <SelectItem value="not-configured">Not Configured</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Product Table */}
          <ProductSeoTable
            products={products}
            seoStatusMap={seoStatusMap}
            loading={isLoading}
            onEditSeo={handleEditSeo}
          />

          {/* Pagination */}
          {paginationMeta && (
            <Pagination
              currentPage={currentPage}
              totalPages={paginationMeta.totalPages}
              totalCount={paginationMeta.totalCount}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              hasNextPage={paginationMeta.hasNextPage}
              hasPreviousPage={paginationMeta.hasPreviousPage}
            />
          )}
        </CardContent>
      </Card>

      {/* SEO Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedSeoData ? "Edit" : "Add"} SEO for {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <ProductSeoForm
              product={selectedProduct}
              existingSeo={selectedSeoData}
              onSuccess={handleFormSuccess}
              onCancel={handleCloseForm}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteProductSeoDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        productName={selectedProduct?.name || ""}
        loading={deleteLoading}
      />
    </div>
  );
}