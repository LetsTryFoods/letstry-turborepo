'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ColumnSelector, ColumnDefinition } from "@/app/dashboard/components/column-selector"
import { ImagePreviewDialog } from "@/app/dashboard/components/image-preview-dialog"
import { useBannerPage } from "@/hooks/useBannerPage"
import { BannerForm } from "./components/BannerForm"
import { BannerTable } from "./components/BannerTable"
import { DeleteBannerDialog } from "./components/DeleteBannerDialog"

const allColumns: ColumnDefinition[] = [
  { key: "_id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "headline", label: "Headline" },
  { key: "subheadline", label: "Subheadline" },
  { key: "description", label: "Description" },
  { key: "imageUrl", label: "Image URL" },
  { key: "mobileImageUrl", label: "Mobile Image URL" },
  { key: "thumbnailUrl", label: "Thumbnail URL" },
  { key: "url", label: "URL" },
  { key: "ctaText", label: "CTA Text" },
  { key: "position", label: "Position" },
  { key: "isActive", label: "Active" },
  { key: "startDate", label: "Start Date" },
  { key: "endDate", label: "End Date" },
  { key: "backgroundColor", label: "Background Color" },
  { key: "textColor", label: "Text Color" },
  { key: "createdAt", label: "Created At" },
  { key: "updatedAt", label: "Updated At" },
]

export default function BannersPage() {
  const {
    banners,
    bannersLoading,
    bannersError,
    createBanner,
    updateBanner,
    selectedColumns,
    handleColumnToggle,
    isDialogOpen,
    setIsDialogOpen,
    editingBanner,
    handleEdit,
    handleCloseDialog,
    handleAddBanner,
    deleteAlertOpen,
    setDeleteAlertOpen,
    handleDeleteClick,
    handleDeleteConfirm,
    imagePreview,
    setImagePreview,
    handleToggleActive,
    handleImagePreview
  } = useBannerPage()

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Banners</h2>
        <div className="flex items-center space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddBanner}>Add Banner</Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl min-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</DialogTitle>
              </DialogHeader>
              <BannerForm 
                onClose={handleCloseDialog} 
                initialData={editingBanner}
                createBanner={createBanner}
                updateBanner={updateBanner}
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

        {bannersLoading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Loading banners...</p>
          </div>
        ) : bannersError ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-destructive">Error loading banners: {bannersError.message}</p>
          </div>
        ) : (
          <BannerTable
            banners={banners}
            selectedColumns={selectedColumns}
            allColumns={allColumns}
            onToggleActive={handleToggleActive}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onImagePreview={handleImagePreview}
          />
        )}
      </div>

      <DeleteBannerDialog
        open={deleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
        onConfirm={handleDeleteConfirm}
      />

      <ImagePreviewDialog
        imageUrl={imagePreview?.url || null}
        title={imagePreview?.title || ''}
        open={!!imagePreview}
        onOpenChange={() => setImagePreview(null)}
      />
    </div>
  )
}