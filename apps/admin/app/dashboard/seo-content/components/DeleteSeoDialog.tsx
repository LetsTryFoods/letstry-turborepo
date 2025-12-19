"use client";

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
import { SeoContent } from "@/lib/seo/useSeo";

interface DeleteSeoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seoContent: SeoContent | null;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteSeoDialog({
  open,
  onOpenChange,
  seoContent,
  onConfirm,
  isDeleting,
}: DeleteSeoDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete SEO Content</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the SEO configuration for{" "}
            <strong>&quot;{seoContent?.pageName}&quot;</strong>?
            <br />
            <br />
            This will remove all SEO metadata for the{" "}
            <code className="px-1 py-0.5 bg-muted rounded">/{seoContent?.pageSlug}</code> page.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
