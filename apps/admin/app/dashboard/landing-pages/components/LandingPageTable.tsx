'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, Search } from 'lucide-react'
import { ColumnDefinition } from '@/app/dashboard/components/column-selector'

interface LandingPageTableProps {
  landingPages: any[]
  selectedColumns: string[]
  allColumns: ColumnDefinition[]
  onToggleActive: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onSeoClick: (id: string) => void
}

export function LandingPageTable({
  landingPages,
  selectedColumns,
  allColumns,
  onToggleActive,
  onEdit,
  onDelete,
  onSeoClick,
}: LandingPageTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {selectedColumns.map((columnKey) => {
              const column = allColumns.find((c) => c.key === columnKey)
              return <TableHead key={columnKey}>{column?.label}</TableHead>
            })}
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {landingPages.length === 0 ? (
            <TableRow>
              <TableCell colSpan={selectedColumns.length + 1} className="text-center text-muted-foreground">
                No landing pages found.
              </TableCell>
            </TableRow>
          ) : (
            landingPages.map((page: any) => (
              <TableRow key={page._id}>
                {selectedColumns.map((columnKey) => (
                  <TableCell key={columnKey}>
                    {columnKey === 'isActive' ? (
                      <Switch checked={page.isActive} onCheckedChange={() => onToggleActive(page._id)} />
                    ) : (
                      String(page[columnKey as keyof typeof page] ?? '')
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
                      <DropdownMenuItem onClick={() => onEdit(page._id)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onSeoClick(page._id)}>
                        <Search className="mr-2 h-4 w-4" />
                        SEO
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onDelete(page._id)} className="text-destructive">
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
