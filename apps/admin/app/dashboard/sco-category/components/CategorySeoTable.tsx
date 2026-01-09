"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Folder, Edit, ExternalLink } from "lucide-react";
import { SeoStatusBadge } from "@/components/seo/SeoStatusBadge";
import { Category } from "@/lib/categories/useCategories";

interface ArchiveDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    categoryToArchive: { _id: string; isArchived: boolean } | null
    onConfirm: () => void
}

interface CategorySeoTableProps {
    categories: Category[];
    loading: boolean;
    onManageSeo: (category: Category) => void;
}

export function CategorySeoTable({ categories, loading, onManageSeo }: CategorySeoTableProps) {
    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading categories...</div>;
    }

    if (!categories.length) {
        return <div className="p-8 text-center text-muted-foreground">No categories found.</div>;
    }

    return (
        <div className="rounded-md border bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Category Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>SEO Status</TableHead>
                        <TableHead>Meta Title</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {categories.map((category) => (
                        <TableRow key={category._id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    {category.imageUrl ? (
                                        <img src={category.imageUrl} className="w-8 h-8 rounded object-cover border" alt={category.name} />
                                    ) : (
                                        <Folder className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span>{category.name}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">/{category.slug}</code>
                            </TableCell>
                            <TableCell>
                                <SeoStatusBadge hasSeo={!!(category.seo && category.seo.metaTitle)} />
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate text-muted-foreground">
                                {category.seo?.metaTitle || "-"}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onManageSeo(category)}
                                        className="gap-1"
                                    >
                                        <Edit className="h-3.5 w-3.5" />
                                        Manage
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        asChild
                                    >
                                        <a
                                            href={`/categories/${category.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </a>
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
