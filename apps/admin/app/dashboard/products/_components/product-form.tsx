"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/custom/image-upload";
import { WysiwygEditor } from "@/components/custom/wysiwyg-editor";
import { TagInput } from "@/components/custom/tag-input";
import {
  productFormSchema,
  ProductFormValues,
  getDefaultVariant,
} from "@/lib/validations/product";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/lib/categories/useCategories";
import { Product } from "@/types/product";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, ChevronDown, ChevronUp, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductFormProps {
  onClose: () => void;
  initialData?: Product | null;
  createProduct: (data: any) => Promise<any>;
  updateProduct: (data: any) => Promise<any>;
}

export function ProductForm({
  onClose,
  initialData,
  createProduct,
  updateProduct,
}: ProductFormProps) {
  const [expandedVariants, setExpandedVariants] = useState<number[]>([0]);

  const { data: categoriesData, loading: categoriesLoading } = useCategories(
    { page: 1, limit: 100 },
    false
  );
  const categories = (categoriesData as any)?.categories?.items || [];

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema as any),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      categoryIds: initialData?.categoryIds || [],
      brand: initialData?.brand || "",
      gtin: initialData?.gtin || "",
      mpn: initialData?.mpn || "",
      currency: initialData?.currency || "INR",
      ingredients: initialData?.ingredients || "",
      allergens: initialData?.allergens || "",
      shelfLife: initialData?.shelfLife || "",
      isVegetarian: initialData?.isVegetarian ?? true,
      isGlutenFree: initialData?.isGlutenFree ?? false,
      keywords: initialData?.keywords || [],
      tags: initialData?.tags || [],
      variants: initialData?.variants?.map((v) => ({
        _id: v._id,
        sku: v.sku || "",
        name: v.name || "",
        price: v.price || 0,
        mrp: v.mrp || 0,
        discountPercent: v.discountPercent || 0,
        discountSource: v.discountSource || "product",
        weight: v.weight || 0,
        weightUnit: v.weightUnit || "g",
        packageSize: v.packageSize || "",
        length: v.length || 0,
        height: v.height || 0,
        breadth: v.breadth || 0,
        stockQuantity: v.stockQuantity || 0,
        availabilityStatus: v.availabilityStatus || "in_stock",
        images: v.images?.map((img) => ({
          file: null,
          alt: img.alt,
          preview: img.url || "",
          finalUrl: img.url,
        })) || [{ file: null, alt: "", preview: "" }],
        thumbnailUrl: v.thumbnailUrl || "",
        isDefault: v.isDefault ?? false,
        isActive: v.isActive ?? true,
      })) || [getDefaultVariant()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const toggleVariantExpand = (index: number) => {
    setExpandedVariants((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSetDefaultVariant = (index: number) => {
    fields.forEach((_, i) => {
      form.setValue(`variants.${i}.isDefault`, i === index);
    });
  };

  const addNewVariant = () => {
    const newVariant = getDefaultVariant();
    newVariant.isDefault = fields.length === 0;
    append(newVariant);
    setExpandedVariants((prev) => [...prev, fields.length]);
  };

  const removeVariant = (index: number) => {
    const wasDefault = form.getValues(`variants.${index}.isDefault`);
    remove(index);

    // If we removed the default variant and there are remaining variants, set the first one as default
    if (wasDefault && fields.length > 1) {
      setTimeout(() => {
        form.setValue(`variants.0.isDefault`, true);
      }, 0);
    }

    setExpandedVariants((prev) =>
      prev.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i))
    );
  };

  // Auto-calculate discount for each variant
  const watchedVariants = form.watch("variants");

  useEffect(() => {
    watchedVariants?.forEach((variant, index) => {
      const price = Number(variant?.price) || 0;
      const mrp = Number(variant?.mrp) || 0;

      if (mrp > 0 && price > 0 && price <= mrp) {
        const discount = Math.round(((mrp - price) / mrp) * 100);
        const currentDiscount = form.getValues(
          `variants.${index}.discountPercent`
        );
        if (currentDiscount !== discount) {
          form.setValue(`variants.${index}.discountPercent`, discount, {
            shouldValidate: false,
          });
        }
      } else if (mrp > 0 && price === mrp) {
        const currentDiscount = form.getValues(
          `variants.${index}.discountPercent`
        );
        if (currentDiscount !== 0) {
          form.setValue(`variants.${index}.discountPercent`, 0, {
            shouldValidate: false,
          });
        }
      }
    });
  }, [watchedVariants, form]);

  const onSubmit = async (data: ProductFormValues) => {
    console.log("onSubmit called with data:", data);
    try {
      console.log("Form submitted with data:", data);

      // Format variants
      const formattedVariants = data.variants.map((variant) => {
        const formattedImages =
          variant.images
            ?.filter((img) => img.preview || img.finalUrl || img.url)
            .map((img) => ({
              url:
                img.finalUrl ||
                img.url ||
                img.preview ||
                `uploaded-image-${Date.now()}.webp`,
              alt: img.alt || "",
            })) || [];

        return {
          _id: variant._id || undefined,
          sku: variant.sku,
          name: variant.name,
          price: Number(variant.price),
          mrp: Number(variant.mrp),
          discountPercent: Number(variant.discountPercent),
          discountSource: variant.discountSource,
          weight: Number(variant.weight),
          weightUnit: variant.weightUnit,
          packageSize: variant.packageSize,
          length: Number(variant.length),
          height: Number(variant.height),
          breadth: Number(variant.breadth),
          stockQuantity: Number(variant.stockQuantity),
          availabilityStatus: variant.availabilityStatus,
          images: formattedImages,
          thumbnailUrl: formattedImages[0]?.url || "",
          isDefault: variant.isDefault,
          isActive: variant.isActive,
        };
      });

      // Ensure at least one variant has images
      const hasImages = formattedVariants.some((v) => v.images.length > 0);
      if (!hasImages && !initialData) {
        alert("Please upload at least one image for at least one variant");
        return;
      }

      // Ensure exactly one default variant
      const defaultVariants = formattedVariants.filter((v) => v.isDefault);
      if (defaultVariants.length === 0) {
        formattedVariants[0].isDefault = true;
      } else if (defaultVariants.length > 1) {
        formattedVariants.forEach((v, i) => {
          v.isDefault = i === 0;
        });
      }

      const formattedData = {
        name: data.name,
        slug: data.slug || undefined,
        description: data.description,
        categoryIds: data.categoryIds,
        brand: data.brand,
        gtin: data.gtin || undefined,
        mpn: data.mpn || undefined,
        currency: data.currency,
        ingredients: data.ingredients,
        allergens: data.allergens || undefined,
        shelfLife: data.shelfLife,
        isVegetarian: data.isVegetarian,
        isGlutenFree: data.isGlutenFree,
        keywords: data.keywords?.filter((k) => k !== "") || [],
        tags: data.tags?.filter((t) => t !== "") || [],
        variants: formattedVariants,
      };

      console.log("Formatted data for API:", formattedData);

      if (initialData) {
        console.log("Updating product:", initialData._id);
        const result = await updateProduct({
          variables: {
            _id: initialData._id,
            input: formattedData,
          },
        });
        console.log("Update result:", result);
      } else {
        console.log("Creating new product");
        const result = await createProduct({
          variables: {
            input: formattedData,
          },
        });
        console.log("Create result:", result);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save product:", error);
      alert(
        `Failed to save product: ${error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) =>
          console.error("Validation errors:", errors)
        )}
        className="space-y-6"
      >
        {/* Basic Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter product name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter brand name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Auto-generated if empty" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categories *</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select categories">
                              {field.value?.length > 0
                                ? `${field.value.length} categor${field.value.length === 1 ? "y" : "ies"
                                } selected`
                                : categoriesLoading
                                  ? "Loading categories..."
                                  : "Select categories"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {categoriesLoading ? (
                              <div className="p-2 text-sm text-muted-foreground">
                                Loading categories...
                              </div>
                            ) : categories.length === 0 ? (
                              <div className="p-2 text-sm text-muted-foreground">
                                No active categories found
                              </div>
                            ) : (
                              categories.map((category: any) => {
                                const isSelected = field.value?.includes(
                                  category._id
                                );
                                return (
                                  <div
                                    key={category.id}
                                    className="flex items-center space-x-2 px-2 py-1.5 cursor-pointer hover:bg-accent rounded-sm"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const newValue = isSelected
                                        ? field.value.filter(
                                          (id: string) => id !== category._id
                                        )
                                        : [...(field.value || []), category._id];
                                      field.onChange(newValue);
                                    }}
                                  >
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={(checked) => {
                                        const newValue = checked
                                          ? [
                                            ...(field.value || []),
                                            category._id,
                                          ]
                                          : field.value.filter(
                                            (id: string) => id !== category._id
                                          );
                                        field.onChange(newValue);
                                      }}
                                    />
                                    <span className="text-sm">
                                      {category.name}
                                    </span>
                                  </div>
                                );
                              })
                            )}
                          </SelectContent>
                        </Select>
                        {field.value?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {field.value.map((categoryId: string) => {
                              const category = categories.find(
                                (c: any) => c._id === categoryId
                              );
                              return category ? (
                                <Badge
                                  key={categoryId}
                                  variant="secondary"
                                  className="gap-1"
                                >
                                  {category.name}
                                  <button
                                    type="button"
                                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                                    onClick={() => {
                                      const newValue = field.value.filter(
                                        (id: string) => id !== categoryId
                                      );
                                      field.onChange(newValue);
                                    }}
                                  >
                                    ×
                                  </button>
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gtin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GTIN</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="EAN/UPC" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mpn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MPN</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Manufacturer Part Number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="INR">INR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <WysiwygEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Enter product description..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Product Details Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="ingredients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ingredients *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={2}
                      placeholder="List ingredients"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="allergens"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allergens</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Peanuts, Milk, Soy" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shelfLife"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shelf Life *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. 12 months" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-6">
              <FormField
                control={form.control}
                name="isVegetarian"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Vegetarian</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isGlutenFree"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Gluten Free</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keywords</FormLabel>
                    <FormControl>
                      <TagInput
                        value={field.value || []}
                        onChange={field.onChange}
                        placeholder="Type keyword and press Enter"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <TagInput
                        value={field.value || []}
                        onChange={field.onChange}
                        placeholder="Type tag and press Enter"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Variants Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Product Variants *</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addNewVariant}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Variant
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No variants added. Click &quot;Add Variant&quot; to create a
                product variant.
              </div>
            )}

            {fields.map((field, index) => {
              const isExpanded = expandedVariants.includes(index);
              const isDefault = form.watch(`variants.${index}.isDefault`);
              const variantName =
                form.watch(`variants.${index}.name`) || `Variant ${index + 1}`;

              return (
                <Card
                  key={field.id}
                  className={`border ${isDefault ? "border-primary" : ""}`}
                >
                  <CardHeader
                    className="cursor-pointer py-3"
                    onClick={() => toggleVariantExpand(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        <span className="font-medium">{variantName}</span>
                        {isDefault && (
                          <Badge variant="default" className="ml-2">
                            <Star className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {!isDefault && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefaultVariant(index)}
                          >
                            Set as Default
                          </Button>
                        )}
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVariant(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="space-y-4 pt-0">
                      {/* Variant Basic Info */}
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`variants.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Variant Name *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="e.g. 500g Pack"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`variants.${index}.sku`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SKU *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Unique SKU" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`variants.${index}.packageSize`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Package Size *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g. 500g, 1L" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Variant Pricing */}
                      <div className="grid grid-cols-4 gap-4">
                        <FormField
                          control={form.control}
                          name={`variants.${index}.mrp`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>MRP *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="1"
                                  min="1"
                                  {...field}
                                  onChange={(e) => {
                                    const mrp = Number(e.target.value);
                                    field.onChange(mrp);
                                    // Calculate discount percentage
                                    const price = form.getValues(
                                      `variants.${index}.price`
                                    );
                                    if (mrp > 0 && price > 0) {
                                      const discount = Math.round(
                                        ((mrp - price) / mrp) * 100
                                      );
                                      form.setValue(
                                        `variants.${index}.discountPercent`,
                                        Math.max(0, discount)
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`variants.${index}.price`}
                          render={({ field }) => {
                            const mrp = form.watch(`variants.${index}.mrp`);
                            const isPriceInvalid = field.value > mrp && mrp > 0;
                            return (
                              <FormItem>
                                <FormLabel>Selling Price *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="1"
                                    min="1"
                                    max={mrp || undefined}
                                    className={
                                      isPriceInvalid
                                        ? "border-destructive focus-visible:ring-destructive"
                                        : ""
                                    }
                                    {...field}
                                    onChange={(e) => {
                                      const price = Number(e.target.value);
                                      field.onChange(price);
                                      // Calculate discount percentage
                                      const currentMrp = form.getValues(
                                        `variants.${index}.mrp`
                                      );
                                      if (currentMrp > 0 && price > 0) {
                                        const discount = Math.round(
                                          ((currentMrp - price) / currentMrp) *
                                          100
                                        );
                                        form.setValue(
                                          `variants.${index}.discountPercent`,
                                          Math.max(0, discount)
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                {isPriceInvalid && (
                                  <p className="text-sm font-medium text-destructive">
                                    Selling Price cannot be greater than MRP
                                  </p>
                                )}
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />
                        <FormField
                          control={form.control}
                          name={`variants.${index}.discountPercent`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Discount %</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  readOnly
                                  disabled
                                  className="bg-muted cursor-not-allowed"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`variants.${index}.discountSource`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Discount Source</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select source" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="category">
                                    Category
                                  </SelectItem>
                                  <SelectItem value="product">
                                    Product
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Variant Dimensions */}
                      <div className="grid grid-cols-5 gap-4">
                        <FormField
                          control={form.control}
                          name={`variants.${index}.length`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Length (cm) *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="1"
                                  min="1"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`variants.${index}.height`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Height (cm) *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="1"
                                  min="1"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`variants.${index}.breadth`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Breadth (cm) *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="1"
                                  min="1"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`variants.${index}.weight`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Weight *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="1"
                                  min="1"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`variants.${index}.weightUnit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Unit" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="g">g</SelectItem>
                                  <SelectItem value="kg">kg</SelectItem>
                                  <SelectItem value="ml">ml</SelectItem>
                                  <SelectItem value="L">L</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Variant Stock */}
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`variants.${index}.stockQuantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stock Quantity *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  step="1"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`variants.${index}.availabilityStatus`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Availability Status *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="in_stock">
                                    In Stock
                                  </SelectItem>
                                  <SelectItem value="out_of_stock">
                                    Out of Stock
                                  </SelectItem>
                                  <SelectItem value="pre_order">
                                    Pre-Order
                                  </SelectItem>
                                  <SelectItem value="discontinued">
                                    Discontinued
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`variants.${index}.isActive`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col justify-end">
                              <div className="flex items-center space-x-2 pb-2">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="!mt-0">Active</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Variant Images */}
                      <div className="space-y-2">
                        <FormLabel>Variant Images *</FormLabel>
                        <VariantImageUpload
                          index={index}
                          form={form}
                          initialImages={
                            initialData?.variants?.[index]?.images || []
                          }
                        />
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-2 sticky bottom-0 bg-background py-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Separate component for variant images to handle state properly
interface VariantImageUploadProps {
  index: number;
  form: any;
  initialImages: Array<{ url: string; alt: string }>;
}

function VariantImageUpload({
  index,
  form,
  initialImages,
}: VariantImageUploadProps) {
  const [images, setImages] = useState<
    Array<{
      file: File | null;
      alt: string;
      preview: string;
      finalUrl?: string;
    }>
  >(
    initialImages.map((img) => ({
      file: null,
      alt: img.alt,
      preview: img.url || "",
      finalUrl: img.url,
    })) || []
  );

  const handleImagesChange = useCallback(
    (
      newImages: Array<{
        file: File | null;
        alt: string;
        preview: string;
        finalUrl?: string;
      }>
    ) => {
      setImages(newImages);
      form.setValue(
        `variants.${index}.images`,
        newImages.map((img) => ({
          file: img.file,
          alt: img.alt,
          preview: img.preview,
          finalUrl: img.finalUrl,
        })),
        { shouldValidate: false, shouldDirty: true }
      );

      // Set thumbnail URL to first image
      if (
        newImages.length > 0 &&
        (newImages[0].finalUrl || newImages[0].preview)
      ) {
        form.setValue(
          `variants.${index}.thumbnailUrl`,
          newImages[0].finalUrl || newImages[0].preview
        );
      }
    },
    [form, index]
  );

  return (
    <ImageUpload
      onImagesChange={handleImagesChange}
      initialImages={initialImages as any}
      maxFiles={10}
    />
  );
}
