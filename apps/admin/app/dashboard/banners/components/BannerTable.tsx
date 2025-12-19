'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { ColumnDefinition } from "@/app/dashboard/components/column-selector"

interface BannerTableProps {
  banners: any[]
  selectedColumns: string[]
  allColumns: ColumnDefinition[]
  onToggleActive: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onImagePreview: (url: string, title: string) => void
}

export function BannerTable({
  banners,
  selectedColumns,
  allColumns,
  onToggleActive,
  onEdit,
  onDelete,
  onImagePreview
}: BannerTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {selectedColumns.map(columnKey => {
              const column = allColumns.find(c => c.key === columnKey)
              return (
                <TableHead key={columnKey}>{column?.label}</TableHead>
              )
            })}
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {banners.length === 0 ? (
            <TableRow>
              <TableCell colSpan={selectedColumns.length + 1} className="text-center text-muted-foreground">
                No banners found. Add your first banner to get started.
              </TableCell>
            </TableRow>
          ) : (
            banners.map((banner: any) => (
              <TableRow key={banner._id}>
                {selectedColumns.map(columnKey => (
                  <TableCell key={columnKey}>
                    {columnKey === 'isActive' ? (
                      <Switch
                        checked={banner.isActive}
                        onCheckedChange={() => onToggleActive(banner._id)}
                      />
                    ) : columnKey === 'imageUrl' || columnKey === 'mobileImageUrl' || columnKey === 'thumbnailUrl' ? (
                      <button
                        onClick={() => onImagePreview(
                          String(banner[columnKey as keyof typeof banner] || ''),
                          columnKey === 'imageUrl' ? 'Image' : columnKey === 'mobileImageUrl' ? 'Mobile Image' : 'Thumbnail'
                        )}
                        className="text-blue-600 hover:text-blue-800 underline text-left max-w-[200px] truncate block"
                      >
                        {String(banner[columnKey as keyof typeof banner] || '')}
                      </button>
                    ) : (
                      String(banner[columnKey as keyof typeof banner] || '')
                    )}
                  </TableCell>
                ))}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onEdit(banner._id)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete(banner._id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
