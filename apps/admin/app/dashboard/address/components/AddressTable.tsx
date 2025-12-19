'use client'

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Pagination } from "@/app/dashboard/components/pagination"
import { ColumnDefinition } from "@/app/dashboard/components/column-selector"

interface AddressTableProps {
  addresses: any[]
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
  onActiveToggle: (id: string, isActive: boolean) => void
  onEdit: (id: string) => void
  onDelete: (id: string, batchCode: string) => void
}

export function AddressTable({
  addresses,
  selectedColumns,
  allColumns,
  loading,
  error,
  meta,
  onPageChange,
  onActiveToggle,
  onEdit,
  onDelete
}: AddressTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-muted-foreground">Loading addresses...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-destructive">Error loading addresses: {error.message}</p>
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
          {addresses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={selectedColumns.length + 1} className="text-center text-muted-foreground">
                No addresses found. Add your first manufacturing address to get started.
              </TableCell>
            </TableRow>
          ) : (
            addresses.map((address: any) => (
              <TableRow key={address._id}>
                {selectedColumns.map(columnKey => (
                  <TableCell key={columnKey}>
                    {columnKey === 'isActive' ? (
                      <Switch
                        checked={address.isActive}
                        onCheckedChange={() => onActiveToggle(address._id, address.isActive)}
                      />
                    ) : columnKey === 'subAddressHeading' ? (
                      <div className="max-w-[300px] truncate" title={address.subAddressHeading}>
                        {address.subAddressHeading}
                      </div>
                    ) : columnKey === 'batchCode' ? (
                      <span className="font-bold text-primary">
                        {address.batchCode}
                      </span>
                    ) : (
                      String(address[columnKey as keyof typeof address] || '-')
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
                      <DropdownMenuItem onClick={() => onEdit(address._id)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete(address._id, address.batchCode)}
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
      {addresses.length > 0 && (
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
