"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProduct } from "@/lib/products/useProducts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Package,
  Tag,
  DollarSign,
  Ruler,
  Info,
  Image as ImageIcon,
  Layers,
  Star,
  Box,
} from "lucide-react";
import Image from "next/image";
import { ProductVariant } from "@/types/product";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data, loading, error } = useProduct(id);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-destructive">
          Error loading product: {error.message}
        </p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    );
  }

  const product = (data as any)?.product;

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-muted-foreground">Product not found.</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    );
  }

  const formatCurrency = (amount: number, currency: string = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  // Get variants from product
  const variants: ProductVariant[] = product.variants || [];
  const selectedVariant =
    variants[selectedVariantIndex] || product.defaultVariant || variants[0];

  // Find default variant index
  const defaultVariantIndex = variants.findIndex(
    (v: ProductVariant) => v.isDefault
  );

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {product.name}
            </h2>
            <p className="text-muted-foreground flex items-center gap-2">
              <span className="font-mono text-sm">{product.slug}</span>
              {product.isArchived && (
                <Badge variant="destructive">Archived</Badge>
              )}
              {!product.isArchived && <Badge variant="default">Active</Badge>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {product.priceRange && (
            <Badge variant="outline">
              {formatCurrency(product.priceRange.min, product.currency)} -{" "}
              {formatCurrency(product.priceRange.max, product.currency)}
            </Badge>
          )}
          <Badge variant="secondary">{variants.length} variant(s)</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Brand
                  </p>
                  <p>{product.brand}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Categories
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {product.categories?.length > 0 ? (
                      product.categories.map((cat: any) => (
                        <Badge key={cat._id} variant="outline">
                          {cat.name}
                        </Badge>
                      ))
                    ) : (
                      <p>-</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    GTIN
                  </p>
                  <p className="font-mono">{product.gtin || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    MPN
                  </p>
                  <p className="font-mono">{product.mpn || "-"}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Description
                </p>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Details & Attributes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Details & Attributes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Ingredients
                  </p>
                  <p className="text-sm">{product.ingredients}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Allergens
                  </p>
                  <p className="text-sm">{product.allergens || "None"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Shelf Life
                  </p>
                  <p className="text-sm">{product.shelfLife}</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${product.isVegetarian ? "bg-green-500" : "bg-gray-300"
                        }`}
                    />
                    <span className="text-sm">Vegetarian</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${product.isGlutenFree ? "bg-green-500" : "bg-gray-300"
                        }`}
                    />
                    <span className="text-sm">Gluten Free</span>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4" /> Keywords
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.keywords?.length > 0 ? (
                      product.keywords.map((keyword: string, i: number) => (
                        <Badge key={i} variant="outline">
                          {keyword}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Layers className="h-4 w-4" /> Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.tags?.length > 0 ? (
                      product.tags.map((tag: string, i: number) => (
                        <Badge key={i} variant="secondary">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Variants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Box className="h-5 w-5" />
                Product Variants ({variants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {variants.map((variant: ProductVariant, index: number) => (
                  <div
                    key={variant._id || index}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedVariantIndex === index
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                      }`}
                    onClick={() => setSelectedVariantIndex(index)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{variant.name}</h4>
                        {variant.isDefault && (
                          <Badge variant="default" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                        {!variant.isActive && (
                          <Badge variant="destructive" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <Badge
                        variant={
                          variant.availabilityStatus === "in_stock"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {variant.availabilityStatus === "in_stock"
                          ? "In Stock"
                          : variant.availabilityStatus === "out_of_stock"
                            ? "Out of Stock"
                            : variant.availabilityStatus === "pre_order"
                              ? "Pre-Order"
                              : "Discontinued"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">SKU</p>
                        <p className="font-mono">{variant.sku}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Price</p>
                        <p className="font-semibold">
                          {formatCurrency(variant.price, product.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">MRP</p>
                        <p className="line-through text-muted-foreground">
                          {formatCurrency(variant.mrp, product.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Discount</p>
                        <p className="text-green-600">
                          {variant.discountPercent}% OFF
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Package Size</p>
                        <p>{variant.packageSize}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Weight</p>
                        <p>
                          {variant.weight} {variant.weightUnit}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Dimensions</p>
                        <p>
                          {variant.length}×{variant.height}×{variant.breadth} cm
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Stock</p>
                        <p>{variant.stockQuantity}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {variants.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No variants found for this product.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar (Selected Variant Details) */}
        <div className="space-y-6">
          {/* Variant Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                {selectedVariant ? `${selectedVariant.name} Images` : "Images"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {selectedVariant?.images?.map((img: any, i: number) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-md overflow-hidden border"
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
                {(!selectedVariant?.images ||
                  selectedVariant.images.length === 0) && (
                    <p className="text-sm text-muted-foreground col-span-2 text-center py-4">
                      No images available
                    </p>
                  )}
              </div>
            </CardContent>
          </Card>

          {/* Selected Variant Pricing & Stock */}
          {selectedVariant && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  {selectedVariant.name} - Pricing & Stock
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Price
                    </p>
                    <p className="text-xl font-bold">
                      {formatCurrency(selectedVariant.price, product.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      MRP
                    </p>
                    <p className="text-muted-foreground line-through">
                      {formatCurrency(selectedVariant.mrp, product.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Discount
                    </p>
                    <Badge variant="secondary">
                      {selectedVariant.discountPercent}% OFF
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Discount Source
                    </p>
                    <p className="capitalize">
                      {selectedVariant.discountSource}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Stock Quantity
                    </p>
                    <p>{selectedVariant.stockQuantity}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Status
                    </p>
                    <Badge
                      variant={
                        selectedVariant.availabilityStatus === "in_stock"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {selectedVariant.availabilityStatus === "in_stock"
                        ? "In Stock"
                        : selectedVariant.availabilityStatus === "out_of_stock"
                          ? "Out of Stock"
                          : selectedVariant.availabilityStatus === "pre_order"
                            ? "Pre-Order"
                            : "Discontinued"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Selected Variant Dimensions & Weight */}
          {selectedVariant && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5" />
                  {selectedVariant.name} - Dimensions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Length
                    </p>
                    <p>{selectedVariant.length} cm</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Height
                    </p>
                    <p>{selectedVariant.height} cm</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Breadth
                    </p>
                    <p>{selectedVariant.breadth} cm</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Weight
                    </p>
                    <p>
                      {selectedVariant.weight} {selectedVariant.weightUnit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Package Size
                    </p>
                    <p>{selectedVariant.packageSize}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
