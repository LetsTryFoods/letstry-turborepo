'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ImagePreviewDialogProps {
  imageUrl: string | null
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImagePreviewDialog({ imageUrl, title, open, onOpenChange }: ImagePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title} Preview</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-4 min-h-[400px]">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={title}
              className="max-w-full max-h-[70vh] object-contain rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UwZTBlMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+'
              }}
            />
          ) : (
            <p className="text-muted-foreground">No image URL provided</p>
          )}
        </div>
        <div className="text-sm text-muted-foreground break-all">
          <strong>URL:</strong> {imageUrl}
        </div>
      </DialogContent>
    </Dialog>
  )
}
