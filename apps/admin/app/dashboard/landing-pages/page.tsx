'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ColumnSelector, ColumnDefinition } from '@/app/dashboard/components/column-selector'
import { useLandingPagePage } from '@/hooks/useLandingPagePage'
import { LandingPageForm } from './components/LandingPageForm'
import { LandingPageTable } from './components/LandingPageTable'
import { DeleteLandingPageDialog } from './components/DeleteLandingPageDialog'
import { LandingPageSeoDialog } from './components/LandingPageSeoDialog'

const allColumns: ColumnDefinition[] = [
  { key: '_id', label: 'ID' },
  { key: 'title', label: 'Title' },
  { key: 'slug', label: 'Slug' },
  { key: 'description', label: 'Description' },
  { key: 'thumbnailUrl', label: 'Thumbnail URL' },
  { key: 'isActive', label: 'Active' },
  { key: 'position', label: 'Position' },
  { key: 'createdAt', label: 'Created At' },
  { key: 'updatedAt', label: 'Updated At' },
]

export default function LandingPagesPage() {
  const {
    landingPages,
    pagesLoading,
    pagesError,
    createLandingPage,
    updateLandingPage,
    selectedColumns,
    handleColumnToggle,
    isDialogOpen,
    setIsDialogOpen,
    editingPage,
    handleEdit,
    handleCloseDialog,
    handleAddPage,
    deleteAlertOpen,
    setDeleteAlertOpen,
    handleDeleteClick,
    handleDeleteConfirm,
    handleToggleActive,
    seoDialogOpen,
    setSeoDialogOpen,
    seoTargetPage,
    handleSeoClick,
    handleSeoSave,
  } = useLandingPagePage()

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Landing Pages</h2>
        <div className="flex items-center space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddPage}>Add Landing Page</Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPage ? 'Edit Landing Page' : 'Add New Landing Page'}</DialogTitle>
              </DialogHeader>
              <LandingPageForm
                onClose={handleCloseDialog}
                initialData={editingPage}
                createLandingPage={createLandingPage}
                updateLandingPage={updateLandingPage}
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

        {pagesLoading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Loading landing pages...</p>
          </div>
        ) : pagesError ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-destructive">Error loading landing pages: {(pagesError as any).message}</p>
          </div>
        ) : (
          <LandingPageTable
            landingPages={landingPages}
            selectedColumns={selectedColumns}
            allColumns={allColumns}
            onToggleActive={handleToggleActive}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onSeoClick={handleSeoClick}
          />
        )}
      </div>

      <DeleteLandingPageDialog
        open={deleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
        onConfirm={handleDeleteConfirm}
      />

      <LandingPageSeoDialog
        open={seoDialogOpen}
        onOpenChange={setSeoDialogOpen}
        initialData={seoTargetPage}
        onSave={handleSeoSave}
      />
    </div>
  )
}
