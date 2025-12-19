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
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from "lucide-react";
import { SeoContent } from "@/lib/seo/useSeo";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Column {
  key: string;
  label: string;
}

interface SeoTableProps {
  seoContents: SeoContent[];
  selectedColumns: string[];
  allColumns: Column[];
  loading: boolean;
  error?: any;
  onEdit: (seo: SeoContent) => void;
  onDelete: (seo: SeoContent) => void;
  onActiveToggle: (seo: SeoContent) => void;
}

export function SeoTable({
  seoContents,
  selectedColumns,
  allColumns,
  loading,
  error,
  onEdit,
  onDelete,
  onActiveToggle,
}: SeoTableProps) {
  const visibleColumns = allColumns.filter((col) =>
    selectedColumns.includes(col.key)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-muted-foreground">Loading SEO content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-destructive">Error: {error.message}</p>
      </div>
    );
  }

  if (seoContents.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-muted-foreground">No SEO content found. Add your first entry!</p>
      </div>
    );
  }

  const truncateText = (text: string | undefined, maxLength: number) => {
    if (!text) return "-";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const renderCell = (seo: SeoContent, columnKey: string) => {
    switch (columnKey) {
      case "pageName":
        return <span className="font-medium text-primary">{seo.pageName}</span>;
      case "pageSlug":
        return (
          <code className="px-2 py-1 bg-muted rounded text-sm">/{seo.pageSlug}</code>
        );
      case "metaTitle":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">{truncateText(seo.metaTitle, 35)}</span>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>{seo.metaTitle}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "metaDescription":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help text-muted-foreground text-sm">
                  {truncateText(seo.metaDescription, 40)}
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-md">
                <p>{seo.metaDescription}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "ogTitle":
        return truncateText(seo.ogTitle, 25);
      case "ogImage":
        return seo.ogImage ? (
          <a href={seo.ogImage} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">
            View Image
          </a>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      case "isActive":
        return (
          <Switch
            checked={seo.isActive}
            onCheckedChange={() => onActiveToggle(seo)}
          />
        );
      case "updatedAt":
        return (
          <span className="text-sm text-muted-foreground">
            {new Date(seo.updatedAt).toLocaleDateString()}
          </span>
        );
      default:
        return "-";
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {visibleColumns.map((column) => (
            <TableHead key={column.key}>{column.label}</TableHead>
          ))}
          <TableHead className="w-[80px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {seoContents.map((seo) => (
          <TableRow key={seo._id}>
            {visibleColumns.map((column) => (
              <TableCell key={`${seo._id}-${column.key}`}>
                {renderCell(seo, column.key)}
              </TableCell>
            ))}
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(seo)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  {seo.canonicalUrl && (
                    <DropdownMenuItem asChild>
                      <a href={seo.canonicalUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Page
                      </a>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => onDelete(seo)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
