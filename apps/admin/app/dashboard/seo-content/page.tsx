"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Globe, Search } from "lucide-react";
import { useSeoPage } from "@/hooks/useSeoPage";
import { SeoForm } from "./components/SeoForm";
import { SeoTable } from "./components/SeoTable";
import { DeleteSeoDialog } from "./components/DeleteSeoDialog";
import { Pagination } from "@/app/dashboard/components/pagination";
import { SeoContentFormData } from "@/lib/validations/seo.schema";
import { SeoPageLayout } from "@/components/seo/SeoPageLayout";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SeoContentPage() {
  const { state, actions } = useSeoPage();

  const handleFormSubmit = async (data: SeoContentFormData) => {
    if (state.editingSeo) {
      await actions.handleUpdate(state.editingSeo._id, data as any);
    } else {
      await actions.handleCreate(data as any);
    }
  };

  const configuredCount = state.seoContents.length;

  return (
    <SeoPageLayout
      title="SEO Content Management"
      description="Manage SEO metadata for all pages of your website"
      icon={<Globe className="h-8 w-8 text-primary" />}
      total={state.meta?.totalCount || state.seoContents.length}
      configured={configuredCount}
      loading={state.loading}
      onRefresh={() => actions.handlePageChange(state.currentPage)}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pages..."
              value={state.searchTerm}
              onChange={(e) => actions.setSearchTerm(e.target.value)}
              className="pl-8 w-full sm:w-[250px]"
            />
          </div>
          <Select
            value={state.filterStatus || "all"}
            onValueChange={(value: any) => actions.setFilterStatus?.(value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pages</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => actions.setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add SEO Entry
        </Button>
      </div>

      <SeoTable
        seoContents={state.seoContents}
        loading={state.loading}
        onEdit={actions.handleEdit}
        onDelete={actions.handleOpenDeleteDialog}
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

      <DeleteSeoDialog
        open={state.deleteDialogOpen}
        onOpenChange={actions.setDeleteDialogOpen}
        seoContent={state.seoToDelete}
        onConfirm={actions.handleDelete}
        isDeleting={state.deleting}
      />
    </SeoPageLayout>
  );
}
