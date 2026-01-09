'use client'

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Archive, ArchiveRestore, Package } from "lucide-react"
import { Pagination } from "@/app/dashboard/components/pagination"
import { ColumnDefinition } from "@/app/dashboard/components/column-selector"
import Link from "next/link"

interface CategoryTableProps {
  categories: any[]
  selectedColumns: string[]
  allColumns: ColumnDefinition[]
  loading: boolean
  error: any
  meta: {
    totalCount: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  onPageChange: (page: number) => void
  onArchiveToggle: (id: string, isArchived: boolean) => void
  onFavouriteToggle: (id: string, favourite: boolean) => void
  onEdit: (id: string) => void
  onImagePreview: (url: string, title: string) => void
}

export function CategoryTable({
  categories,
  selectedColumns,
  allColumns,
  loading,
  error,
  meta,
  onPageChange,
  onArchiveToggle,
  onFavouriteToggle,
  onEdit,
  onImagePreview
}: CategoryTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-muted-foreground">Loading categories...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-destructive">Error loading categories: {error.message}</p>
      </div>
    )
  }

  return (
    <>
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
          {categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={selectedColumns.length + 1} className="text-center text-muted-foreground">
                No categories found. Add your first category to get started.
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category: any) => (
              <TableRow key={category._id}>
                {selectedColumns.map(columnKey => (
                  <TableCell key={columnKey}>
                    {columnKey === 'isArchived' ? (
                      <Switch
                        checked={category.isArchived}
                        onCheckedChange={() => onArchiveToggle(category._id, category.isArchived)}
                      />
                    ) : columnKey === 'favourite' ? (
                      <Switch
                        checked={category.favourite}
                        onCheckedChange={() => onFavouriteToggle(category._id, category.favourite)}
                      />
                    ) : columnKey === 'imageUrl' ? (
                      category.imageUrl ? (
                        <button
                          onClick={() => onImagePreview(
                            String(category.imageUrl || ''),
                            'Category Image'
                          )}
                          className="text-blue-600 hover:text-blue-800 underline text-left max-w-[200px] truncate block"
                        >
                          {String(category.imageUrl || '')}
                        </button>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )
                    ) : columnKey === 'parentId' ? (
                      category.parentId ? String(category.parentId) : <span className="text-muted-foreground">Root</span>
                    ) : columnKey === 'description' ? (
                      <div className="max-w-[300px] truncate">
                        {String(category[columnKey as keyof typeof category] || '-')}
                      </div>
                    ) : (
                      String(category[columnKey as keyof typeof category] || '-')
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
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/products?categoryId=${category._id}`}>
                          <Package className="mr-2 h-4 w-4" />
                          View Products ({category.productCount || 0})
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(category._id)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onArchiveToggle(category._id, category.isArchived)}
                        className={category.isArchived ? "text-green-600" : "text-orange-600"}
                      >
                        {category.isArchived ? (
                          <>
                            <ArchiveRestore className="mr-2 h-4 w-4" />
                            Unarchive
                          </>
                        ) : (
                          <>
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {categories.length > 0 && (
        <Pagination
          currentPage={meta.page}
          totalPages={meta.totalPages}
          totalCount={meta.totalCount}
          pageSize={meta.limit}
          hasNextPage={meta.hasNextPage}
          hasPreviousPage={meta.hasPreviousPage}
          onPageChange={onPageChange}
        />
      )}
    </>
  )
}
