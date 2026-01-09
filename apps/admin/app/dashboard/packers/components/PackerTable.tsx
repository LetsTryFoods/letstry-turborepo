'use client'

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash, BarChart } from "lucide-react"
import { ColumnDefinition } from "@/app/dashboard/components/column-selector"

interface PackerTableProps {
  packers: any[]
  selectedColumns: string[]
  allColumns: ColumnDefinition[]
  loading: boolean
  error: any
  onEdit: (packer: any) => void
  onDelete: (packerId: string) => void
  onToggleActive: (packerId: string, isActive: boolean) => void
  onViewStats: (packerId: string) => void
  orderCounts?: Record<string, { assigned: number; inProgress: number; completed: number }>
}

export function PackerTable({
  packers,
  selectedColumns,
  allColumns,
  loading,
  error,
  onEdit,
  onDelete,
  onToggleActive,
  onViewStats,
  orderCounts
}: PackerTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-muted-foreground">Loading packers...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-destructive">Error loading packers: {error.message}</p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      online: "default",
      offline: "secondary",
      busy: "outline"
    }
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>
  }

  return (
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
        {packers.length === 0 ? (
          <TableRow>
            <TableCell colSpan={selectedColumns.length + 1} className="text-center text-muted-foreground">
              No packers found. Add your first packer to get started.
            </TableCell>
          </TableRow>
        ) : (
          packers.map((packer: any) => (
            <TableRow key={packer.id}>
              {selectedColumns.map(columnKey => (
                <TableCell key={columnKey}>
                  {columnKey === 'isActive' ? (
                    <Switch
                      checked={packer.isActive}
                      onCheckedChange={() => onToggleActive(packer.id, packer.isActive)}
                    />
                  ) : columnKey === 'accuracyRate' ? (
                    packer.accuracyRate === 0 && packer.totalOrdersPacked === 0
                      ? 'No orders packed'
                      : `${packer.accuracyRate.toFixed(2)}%`
                  ) : columnKey === 'averagePackTime' ? (
                    `${packer.averagePackTime.toFixed(0)}s`
                  ) : columnKey === 'lastActiveAt' && packer.lastActiveAt ? (
                    formatDate(packer.lastActiveAt)
                  ) : columnKey === 'assignedOrders' ? (
                    orderCounts?.[packer.id]?.assigned || 0
                  ) : columnKey === 'inProgressOrders' ? (
                    orderCounts?.[packer.id] !== undefined ? (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        {orderCounts[packer.id].inProgress} Active
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )
                  ) : columnKey === 'completedOrders' ? (
                    orderCounts?.[packer.id]?.completed || 0
                  ) : (
                    packer[columnKey]?.toString() || '-'
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
                    <DropdownMenuItem onClick={() => onViewStats(packer.id)}>
                      <BarChart className="mr-2 h-4 w-4" />
                      View Stats
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onEdit(packer)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(packer.id)}
                      className="text-destructive"
                    >
                      <Trash className="mr-2 h-4 w-4" />
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
  )
}
