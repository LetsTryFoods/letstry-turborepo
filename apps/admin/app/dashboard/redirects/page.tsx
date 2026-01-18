'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ColumnSelector, ColumnDefinition } from '@/app/dashboard/components/column-selector'
import { useRedirectPage } from '@/hooks/useRedirectPage'
import { RedirectForm } from './components/RedirectForm'
import { RedirectTable } from './components/RedirectTable'
import { DeleteRedirectDialog } from './components/DeleteRedirectDialog'
import { Search } from 'lucide-react'

const allColumns: ColumnDefinition[] = [
  { key: '_id', label: 'ID' },
  { key: 'fromPath', label: 'From Path' },
  { key: 'toPath', label: 'To Path' },
  { key: 'statusCode', label: 'Status Code' },
  { key: 'isActive', label: 'Active' },
  { key: 'description', label: 'Description' },
  { key: 'source', label: 'Source' },
  { key: 'createdAt', label: 'Created At' },
  { key: 'updatedAt', label: 'Updated At' },
]

export default function RedirectsPage() {
  const {
    redirects,
    total,
    page,
    limit,
    search,
    loading,
    error,
    selectedColumns,
    handleColumnToggle,
    isDialogOpen,
    setIsDialogOpen,
    editingRedirect,
    handleEdit,
    handleCloseDialog,
    handleAddRedirect,
    deleteAlertOpen,
    setDeleteAlertOpen,
    handleDeleteClick,
    handleDeleteConfirm,
    createRedirect,
    updateRedirect,
    handleToggleActive,
    handleSearch,
    setPage,
  } = useRedirectPage()

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">URL Redirects</h2>
        <div className="flex items-center space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddRedirect}>Add Redirect</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingRedirect ? 'Edit Redirect' : 'Add New Redirect'}
                </DialogTitle>
              </DialogHeader>
              <RedirectForm
                onClose={handleCloseDialog}
                initialData={editingRedirect}
                createRedirect={createRedirect}
                updateRedirect={updateRedirect}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search redirects..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <ColumnSelector
            allColumns={allColumns}
            selectedColumns={selectedColumns}
            onColumnToggle={handleColumnToggle}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Loading redirects...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-destructive">Error loading redirects: {error.message}</p>
          </div>
        ) : (
          <>
            <RedirectTable
              redirects={redirects}
              selectedColumns={selectedColumns}
              allColumns={allColumns}
              onToggleActive={handleToggleActive}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} redirects
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <DeleteRedirectDialog
        open={deleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
