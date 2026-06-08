"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  useCategoryLandingPages,
  useCreateCategoryLandingPage,
  useUpdateCategoryLandingPage,
  useUpdateCategoryLandingPageActive,
  useDeleteCategoryLandingPage,
  CategoryLandingPage,
} from "@/lib/category-landing-pages/useCategoryLandingPages";
import { CategoryLandingPageForm } from "./components/CategoryLandingPageForm";
import { CategoryLandingPageTable } from "./components/CategoryLandingPageTable";

export default function CategoryLandingPagesPage() {
  const { data, loading } = useCategoryLandingPages();
  const { mutate: createPage } = useCreateCategoryLandingPage();
  const { mutate: updatePage } = useUpdateCategoryLandingPage();
  const { mutate: toggleActive } = useUpdateCategoryLandingPageActive();
  const { mutate: deletePage } = useDeleteCategoryLandingPage();

  const pages: CategoryLandingPage[] =
    (data as any)?.categoryLandingPages ?? [];

  const [formOpen, setFormOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CategoryLandingPage | null>(
    null,
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingPage(null);
    setFormOpen(true);
  };

  const handleEdit = (page: CategoryLandingPage) => {
    setEditingPage(page);
    setFormOpen(true);
  };

  const handleToggleActive = async (id: string) => {
    const page = pages.find((p) => p._id === id);
    if (!page) return;
    try {
      await toggleActive({ variables: { id, isActive: !page.isActive } });
      toast.success(`Page ${page.isActive ? "deactivated" : "activated"}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await deletePage({ variables: { id: deleteId } });
      toast.success("Page deleted");
    } catch {
      toast.error("Failed to delete page");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Category Landing Pages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage category pages at{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">
              /category/[slug]
            </code>
            . Set the slug to match a category slug — the page will show the
            category&apos;s products automatically plus your custom tiles and
            FAQs.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Page
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading...
        </div>
      ) : (
        <CategoryLandingPageTable
          pages={pages}
          onToggleActive={handleToggleActive}
          onEdit={handleEdit}
          onDelete={(id) => setDeleteId(id)}
        />
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPage
                ? "Edit Category Landing Page"
                : "New Category Landing Page"}
            </DialogTitle>
          </DialogHeader>
          <CategoryLandingPageForm
            onClose={() => setFormOpen(false)}
            initialData={editingPage}
            createPage={createPage}
            updatePage={updatePage}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this page?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The page will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
