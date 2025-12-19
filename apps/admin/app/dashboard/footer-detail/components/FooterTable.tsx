'use client'

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { ColumnDefinition } from "@/app/dashboard/components/column-selector"

interface FooterTableProps {
  footerDetails: any[]
  selectedColumns: string[]
  allColumns: ColumnDefinition[]
  loading: boolean
  error: any
  onActiveToggle: (id: string, isActive: boolean) => void
  onEdit: (id: string) => void
  onDelete: (id: string, companyName: string) => void
}

export function FooterTable({
  footerDetails,
  selectedColumns,
  allColumns,
  loading,
  error,
  onActiveToggle,
  onEdit,
  onDelete
}: FooterTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-muted-foreground">Loading footer details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-destructive">Error loading footer details: {error.message}</p>
      </div>
    )
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
        {footerDetails.length === 0 ? (
          <TableRow>
            <TableCell colSpan={selectedColumns.length + 1} className="text-center text-muted-foreground">
              No footer details found. Add your first footer configuration to get started.
            </TableCell>
          </TableRow>
        ) : (
          footerDetails.map((footer: any) => (
            <TableRow key={footer._id}>
              {selectedColumns.map(columnKey => (
                <TableCell key={columnKey}>
                  {columnKey === 'isActive' ? (
                    <Switch
                      checked={footer.isActive}
                      onCheckedChange={() => onActiveToggle(footer._id, footer.isActive)}
                    />
                  ) : columnKey === 'logoUrl' ? (
                    footer.logoUrl ? (
                      <img src={footer.logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
                    ) : '-'
                  ) : columnKey === 'address' ? (
                    <div className="max-w-[250px] truncate" title={footer.address}>
                      {footer.address}
                    </div>
                  ) : columnKey === 'email' ? (
                    <a href={`mailto:${footer.email}`} className="text-primary hover:underline">
                      {footer.email}
                    </a>
                  ) : columnKey === 'phone' ? (
                    <a href={`tel:${footer.phone}`} className="text-primary hover:underline">
                      {footer.phone}
                    </a>
                  ) : columnKey === 'socialMediaLinks' ? (
                    footer.socialMediaLinks?.length > 0 ? (
                      <div className="flex gap-2">
                        {footer.socialMediaLinks.map((link: any, idx: number) => (
                          <a 
                            key={idx} 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            title={link.platform}
                          >
                            {link.iconUrl ? (
                              <img src={link.iconUrl} alt={link.platform} className="h-5 w-5 object-contain" />
                            ) : (
                              <span className="text-xs text-primary hover:underline">{link.platform}</span>
                            )}
                          </a>
                        ))}
                      </div>
                    ) : '-'
                  ) : (
                    String(footer[columnKey as keyof typeof footer] || '-')
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
                    <DropdownMenuItem onClick={() => onEdit(footer._id)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete(footer._id, footer.companyName)}
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
  )
}
