'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ColumnSelector, ColumnDefinition } from "../components/column-selector"
import { ImagePreviewDialog } from "../components/image-preview-dialog"
import { useCategoryPage } from "@/hooks/useCategoryPage"
import { CategoryForm } from "./components/CategoryForm"
import { CategoryTable } from "./components/CategoryTable"
import { ArchiveDialog } from "./components/ArchiveDialog"

const allColumns: ColumnDefinition[] = [
  { key: "_id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "slug", label: "Slug" },
  { key: "description", label: "Description" },
  { key: "parentId", label: "Parent ID" },
  { key: "imageUrl", label: "Image URL" },
  { key: "codeValue", label: "Code Value" },
  { key: "inCodeSet", label: "In Code Set" },
  { key: "productCount", label: "Product Count" },
  { key: "isArchived", label: "Archived" },
  { key: "favourite", label: "Favourite" },
  { key: "createdAt", label: "Created At" },
  { key: "updatedAt", label: "Updated At" },
]

export default function CategoriesPage() {
  const { state, actions } = useCategoryPage()

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-archived"
              checked={state.includeArchived}
              onCheckedChange={(checked) => actions.setIncludeArchived(checked as boolean)}
            />
            <label
              htmlFor="include-archived"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Show Archived
            </label>
          </div>
          <Dialog open={state.isDialogOpen} onOpenChange={actions.setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={actions.handleAddCategory}>Add Category</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{state.editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
              </DialogHeader>
              <CategoryForm 
                onClose={actions.handleCloseDialog} 
                initialData={state.editingCategory}
                createCategory={actions.createCategory}
                updateCategory={actions.updateCategory}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        <ColumnSelector
          allColumns={allColumns}
          selectedColumns={state.selectedColumns}
          onColumnToggle={actions.handleColumnToggle}
        />

        <div className="rounded-md border">
          <CategoryTable
            categories={state.categories}
            selectedColumns={state.selectedColumns}
            allColumns={allColumns}
            loading={state.categoriesLoading}
            error={state.categoriesError}
            meta={state.meta}
            onPageChange={actions.handlePageChange}
            onArchiveToggle={actions.handleArchiveToggle}
            onFavouriteToggle={actions.handleFavouriteToggle}
            onEdit={actions.handleEdit}
            onImagePreview={actions.handleImagePreview}
          />
        </div>
      </div>

      <ArchiveDialog
        open={state.deleteAlertOpen}
        onOpenChange={actions.setDeleteAlertOpen}
        categoryToArchive={state.categoryToArchive}
        onConfirm={actions.handleArchiveConfirm}
      />

      <ImagePreviewDialog
        imageUrl={state.imagePreview?.url || null}
        title={state.imagePreview?.title || ''}
        open={!!state.imagePreview}
        onOpenChange={() => actions.setImagePreview(null)}
      />
    </div>
  )
}
