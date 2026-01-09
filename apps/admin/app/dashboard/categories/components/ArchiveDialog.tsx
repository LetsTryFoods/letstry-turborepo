'use client'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface ArchiveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoryToArchive: { _id: string; isArchived: boolean } | null
  onConfirm: () => void
}

export function ArchiveDialog({ open, onOpenChange, categoryToArchive, onConfirm }: ArchiveDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {categoryToArchive?.isArchived
              ? "This will unarchive the category and make it visible again."
              : "This will archive the category. Archived categories are hidden by default but can be restored later."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {categoryToArchive?.isArchived ? 'Unarchive' : 'Archive'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
