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
import { Edit, Trash2, CheckCircle2, XCircle } from "lucide-react";

export interface ColumnDefinition<T> {
    header: string;
    render: (item: T) => React.ReactNode;
}

interface GenericSeoTableProps<T> {
    items: T[];
    columns: ColumnDefinition<T>[];
    hasSeo: (item: T) => boolean;
    getSeoTitle: (item: T) => string | undefined;
    getSeoDesc: (item: T) => string | undefined;
    onEdit: (item: T) => void;
    onDelete: (item: T) => void;
    rowKey: (item: T) => string;
}

export function GenericSeoTable<T>({
    items,
    columns,
    hasSeo,
    getSeoTitle,
    getSeoDesc,
    onEdit,
    onDelete,
    rowKey,
}: GenericSeoTableProps<T>) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((col, i) => (
                            <TableHead key={i}>{col.header}</TableHead>
                        ))}
                        <TableHead>SEO Status</TableHead>
                        <TableHead>Meta Title</TableHead>
                        <TableHead>Meta Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={columns.length + 4} className="text-center py-8 text-muted-foreground">
                                No items found
                            </TableCell>
                        </TableRow>
                    ) : (
                        items.map((item) => (
                            <TableRow key={rowKey(item)}>
                                {columns.map((col, i) => (
                                    <TableCell key={i}>{col.render(item)}</TableCell>
                                ))}
                                <TableCell>
                                    {hasSeo(item) ? (
                                        <Badge variant="default" className="gap-1">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Configured
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="gap-1">
                                            <XCircle className="h-3 w-3" />
                                            Not Set
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="max-w-xs truncate">
                                    {getSeoTitle(item) || "-"}
                                </TableCell>
                                <TableCell className="max-w-xs truncate">
                                    {getSeoDesc(item) || "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onEdit(item)}
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            {hasSeo(item) ? "Edit" : "Add"} SEO
                                        </Button>
                                        {hasSeo(item) && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => onDelete(item)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
