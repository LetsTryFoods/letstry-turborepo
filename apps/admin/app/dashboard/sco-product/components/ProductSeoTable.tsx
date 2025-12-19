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
import { Pencil, Check, X, Image as ImageIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Product, ProductSeo } from "@/lib/products/useProducts";

interface ProductSeoStatus {
  productId: string;
  hasSeo: boolean;
  metaTitle?: string;
  seoData?: ProductSeo;
}

interface ProductSeoTableProps {
  products: Product[];
  seoStatusMap: Map<string, ProductSeoStatus>;
  loading: boolean;
  onEditSeo: (product: Product) => void;
}

export function ProductSeoTable({
  products,
  seoStatusMap,
  loading,
  onEditSeo,
}: ProductSeoTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-muted-foreground">No products found.</p>
      </div>
    );
  }

  const truncateText = (text: string | undefined, maxLength: number) => {
    if (!text) return "-";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60px]">Image</TableHead>
          <TableHead>Product Name</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Brand</TableHead>
          <TableHead className="text-center">SEO Status</TableHead>
          <TableHead>Meta Title</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => {
          const seoStatus = seoStatusMap.get(product._id);
          const hasSeo = seoStatus?.hasSeo || false;

          return (
            <TableRow key={product._id}>
              {/* Thumbnail */}
              <TableCell>
                {product?.variants?.[0]?.images?.[0]?.url ? (
                  <img
                    src={product?.variants?.[0]?.images?.[0]?.url}
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </TableCell>

              {/* Product Name */}
              <TableCell>
                <span className="font-medium">{truncateText(product.name, 40)}</span>
              </TableCell>

              {/* Slug */}
              <TableCell>
                <code className="px-2 py-1 bg-muted rounded text-xs">/{product.slug}</code>
              </TableCell>

              {/* Brand */}
              <TableCell>
                <span className="text-muted-foreground">{product.brand || "-"}</span>
              </TableCell>

              {/* SEO Status */}
              <TableCell className="text-center">
                {hasSeo ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="default" className="gap-1">
                          <Check className="h-3 w-3" />
                          Configured
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>SEO configured for this product</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="outline" className="gap-1 text-orange-600 border-orange-300">
                          <X className="h-3 w-3" />
                          Not Set
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>No SEO configured - click to add</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </TableCell>

              {/* Meta Title Preview */}
              <TableCell>
                {seoStatus?.metaTitle ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm text-muted-foreground cursor-help">
                          {truncateText(seoStatus.metaTitle, 35)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p>{seoStatus.metaTitle}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <span className="text-sm text-muted-foreground italic">Not configured</span>
                )}
              </TableCell>

              {/* Actions */}
              <TableCell>
                <Button
                  variant={hasSeo ? "outline" : "default"}
                  size="sm"
                  onClick={() => onEditSeo(product)}
                  className="gap-1"
                >
                  <Pencil className="h-3 w-3" />
                  {hasSeo ? "Edit" : "Add"} SEO
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
