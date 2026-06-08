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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from "lucide-react";
import { CategoryLandingPage } from "@/lib/category-landing-pages/useCategoryLandingPages";

interface CategoryLandingPageTableProps {
  pages: CategoryLandingPage[];
  onToggleActive: (id: string) => void;
  onEdit: (page: CategoryLandingPage) => void;
  onDelete: (id: string) => void;
}

export function CategoryLandingPageTable({
  pages,
  onToggleActive,
  onEdit,
  onDelete,
}: CategoryLandingPageTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Tiles</TableHead>
            <TableHead>FAQs</TableHead>
            <TableHead>Active</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground py-8"
              >
                No category landing pages yet.
              </TableCell>
            </TableRow>
          ) : (
            pages.map((page) => (
              <TableRow key={page._id}>
                <TableCell className="font-medium max-w-[220px] truncate">
                  {page.pageTitle}
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                    /{page.slug}
                  </code>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {page.tiles?.length ?? 0} tiles
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {page.faqs?.length ?? 0} FAQs
                  </Badge>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={page.isActive}
                    onCheckedChange={() => onToggleActive(page._id)}
                  />
                </TableCell>
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
                      <DropdownMenuItem onClick={() => onEdit(page)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a
                          href={`/${page.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Preview
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(page._id)}
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
  );
}
