'use client'

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ProductForm } from "./product-form"
import { Product } from "@/types/product"

interface ProductHeaderProps {
  includeOutOfStock: boolean
  setIncludeOutOfStock: (checked: boolean) => void
  isDialogOpen: boolean
  setIsDialogOpen: (open: boolean) => void
  handleAddProduct: () => void
  editingProduct: Product | null
  handleCloseDialog: () => void
  createProduct: any
  updateProduct: any
}

export function ProductHeader({
  includeOutOfStock,
  setIncludeOutOfStock,
  isDialogOpen,
  setIsDialogOpen,
  handleAddProduct,
  editingProduct,
  handleCloseDialog,
  createProduct,
  updateProduct
}: ProductHeaderProps) {
  return (
    <div className="flex items-center justify-between space-y-2">
      <h2 className="text-3xl font-bold tracking-tight">Products</h2>
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="include-out-of-stock"
            checked={includeOutOfStock}
            onCheckedChange={(checked) => setIncludeOutOfStock(checked as boolean)}
          />
          <label
            htmlFor="include-out-of-stock"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Show Out of Stock
          </label>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddProduct}>Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-7xl w-[95vw] max-h-[90vh] overflow-y-auto sm:max-w-7xl">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
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
  )
}
