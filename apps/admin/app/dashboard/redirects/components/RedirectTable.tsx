import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from 'lucide-react'
import { ColumnDefinition } from '@/app/dashboard/components/column-selector'

interface RedirectTableProps {
  redirects: any[]
  selectedColumns: string[]
  allColumns: ColumnDefinition[]
  onToggleActive: (id: string, isActive: boolean) => void
  onEdit: (redirect: any) => void
  onDelete: (id: string) => void
}

export function RedirectTable({
  redirects,
  selectedColumns,
  allColumns,
  onToggleActive,
  onEdit,
  onDelete,
}: RedirectTableProps) {
  const getStatusCodeColor = (code: number) => {
    if (code === 301 || code === 308) return 'bg-green-500'
    if (code === 302 || code === 307) return 'bg-yellow-500'
    return 'bg-gray-500'
  }

  const getSourceColor = (source: string) => {
    if (source === 'shopify') return 'bg-purple-500'
    if (source === 'react') return 'bg-blue-500'
    return 'bg-gray-500'
  }

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
          {redirects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={selectedColumns.length + 1} className="text-center text-muted-foreground">
                No redirects found. Add your first redirect to get started.
              </TableCell>
            </TableRow>
          ) : (
            redirects.map((redirect: any) => (
              <TableRow key={redirect._id}>
                {selectedColumns.map((columnKey) => (
                  <TableCell key={columnKey}>
                    {columnKey === 'isActive' ? (
                      <Switch
                        checked={redirect.isActive}
                        onCheckedChange={(checked) => onToggleActive(redirect._id, checked)}
                      />
                    ) : columnKey === 'statusCode' ? (
                      <Badge className={getStatusCodeColor(redirect.statusCode)}>
                        {redirect.statusCode}
                      </Badge>
                    ) : columnKey === 'source' ? (
                      <Badge className={getSourceColor(redirect.source)}>
                        {redirect.source}
                      </Badge>
                    ) : columnKey === 'fromPath' || columnKey === 'toPath' ? (
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {String(redirect[columnKey as keyof typeof redirect] || '')}
                      </code>
                    ) : columnKey === 'createdAt' || columnKey === 'updatedAt' ? (
                      new Date(redirect[columnKey]).toLocaleDateString()
                    ) : (
                      String(redirect[columnKey as keyof typeof redirect] || '')
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
                      <DropdownMenuItem onClick={() => onEdit(redirect)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(redirect._id)}
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
