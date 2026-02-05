'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"

interface BlogTableProps {
    blogs: any[]
    selectedColumns: string[]
    onToggleActive: (id: string) => void
    onEdit: (id: string) => void
    onDelete: (id: string) => void
    onImagePreview: (url: string, title: string) => void
}

export function BlogTable({
    blogs,
    selectedColumns,
    onToggleActive,
    onEdit,
    onDelete,
    onImagePreview
}: BlogTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        {selectedColumns.map(columnKey => (
                            <TableHead key={columnKey} className="capitalize">{columnKey}</TableHead>
                        ))}
                        <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {blogs.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={selectedColumns.length + 1} className="text-center text-muted-foreground">
                                No blogs found. Add your first blog to get started.
                            </TableCell>
                        </TableRow>
                    ) : (
                        blogs.map((blog: any) => (
                            <TableRow key={blog._id}>
                                {selectedColumns.map(columnKey => (
                                    <TableCell key={columnKey}>
                                        {columnKey === 'isActive' ? (
                                            <Switch
                                                checked={blog.isActive}
                                                onCheckedChange={() => onToggleActive(blog._id)}
                                            />
                                        ) : columnKey === 'image' ? (
                                            <button
                                                onClick={() => onImagePreview(blog.image, 'Blog Image')}
                                                className="text-blue-600 hover:text-blue-800 underline text-left max-w-[200px] truncate block"
                                            >
                                                {blog.image}
                                            </button>
                                        ) : (
                                            String(blog[columnKey as keyof typeof blog] || '')
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
                                            <DropdownMenuItem onClick={() => onEdit(blog._id)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => onDelete(blog._id)}
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
