"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, Globe, FileText } from "lucide-react";
import { useSeoPage } from "@/hooks/useSeoPage";
import { SeoForm } from "./components/SeoForm";
import { SeoTable } from "./components/SeoTable";
import { DeleteSeoDialog } from "./components/DeleteSeoDialog";
import { ColumnSelector } from "@/app/dashboard/components/column-selector";
import { Pagination } from "@/app/dashboard/components/pagination";
import { SeoContentFormData } from "@/lib/validations/seo.schema";

export default function SeoContentPage() {
  const { state, actions, allColumns } = useSeoPage();

  const handleFormSubmit = async (data: SeoContentFormData) => {
    if (state.editingSeo) {
      await actions.handleUpdate(state.editingSeo._id, data);
    } else {
      await actions.handleCreate(data);
    }
  };

  return (
    <div className="flex flex-col gap-4 mx-4 auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Globe className="h-8 w-8 text-primary" />
            SEO Content Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage SEO metadata for all pages of your website
          </p>
        </div>
        <Button onClick={() => actions.setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add SEO Entry
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.meta?.totalCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <div className="h-2 w-2 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {state.seoContents.filter((s) => s.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <div className="h-2 w-2 rounded-full bg-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {state.seoContents.filter((s) => !s.isActive).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>SEO Entries</CardTitle>
              <CardDescription>
                Configure meta tags and social sharing settings for each page
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pages..."
                  value={state.searchTerm}
                  onChange={(e) => actions.setSearchTerm(e.target.value)}
                  className="pl-8 w-full sm:w-[250px]"
                />
              </div>
              <ColumnSelector
                allColumns={allColumns}
                selectedColumns={state.selectedColumns}
                onColumnToggle={actions.handleColumnToggle}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <SeoTable
            seoContents={state.seoContents}
            selectedColumns={state.selectedColumns}
            allColumns={allColumns}
            loading={state.loading}
            error={state.error}
            onEdit={actions.handleEdit}
            onDelete={actions.handleOpenDeleteDialog}
            onActiveToggle={actions.handleActiveToggle}
          />
          
          {state.meta && state.meta.totalPages > 1 && (
            <Pagination
              currentPage={state.currentPage}
              totalPages={state.meta.totalPages}
              totalCount={state.meta.totalCount}
              pageSize={state.pageSize}
              hasNextPage={state.meta.hasNextPage}
              hasPreviousPage={state.meta.hasPreviousPage}
              onPageChange={actions.handlePageChange}
            />
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={state.isFormOpen} onOpenChange={actions.handleCloseForm}>
        <DialogContent className="min-w-6xl max-w-7xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {state.editingSeo ? "Edit SEO Content" : "Add New SEO Entry"}
            </DialogTitle>
            <DialogDescription>
              {state.editingSeo
                ? `Editing SEO settings for "${state.editingSeo.pageName}"`
                : "Configure SEO metadata for a page"}
            </DialogDescription>
          </DialogHeader>
          <SeoForm
            initialData={state.editingSeo}
            onSubmit={handleFormSubmit}
            onCancel={actions.handleCloseForm}
            isLoading={state.creating || state.updating}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteSeoDialog
        open={state.deleteDialogOpen}
        onOpenChange={actions.setDeleteDialogOpen}
        seoContent={state.seoToDelete}
        onConfirm={actions.handleDelete}
        isDeleting={state.deleting}
      />
    </div>
  );
}
