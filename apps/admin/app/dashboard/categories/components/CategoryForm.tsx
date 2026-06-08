"use client";

import { useState, useEffect, useCallback } from "react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categoryFormSchema } from "@/lib/validations/category.schema";
import { ImageUpload } from "@/components/custom/image-upload";
import { getCdnUrl, extractKeyFromUrl } from "@/lib/image-utils";

interface CategoryFormProps {
  onClose: () => void;
  initialData?: any | null;
  createCategory?: any;
  updateCategory?: any;
}

export function CategoryForm({
  onClose,
  initialData,
  createCategory,
  updateCategory,
}: CategoryFormProps) {
  const [uploadedImages, setUploadedImages] = useState<
    Array<{
      file: File | null;
      alt: string;
      preview: string;
      finalUrl?: string;
      key?: string;
    }>
  >(
    initialData?.imageUrl
      ? [
          {
            file: null,
            alt: initialData.name || "Category Image",
            preview: getCdnUrl(initialData.imageUrl),
            finalUrl: getCdnUrl(initialData.imageUrl),
            key: extractKeyFromUrl(initialData.imageUrl),
          },
        ]
      : [],
  );

  const [uploadedMobileImages, setUploadedMobileImages] = useState<
    Array<{
      file: File | null;
      alt: string;
      preview: string;
      finalUrl?: string;
      key?: string;
    }>
  >(
    initialData?.mobileImageUrl
      ? [
          {
            file: null,
            alt: initialData.name || "Mobile Category Image",
            preview: getCdnUrl(initialData.mobileImageUrl),
            finalUrl: getCdnUrl(initialData.mobileImageUrl),
            key: extractKeyFromUrl(initialData.mobileImageUrl),
          },
        ]
      : [],
  );

  const form = useForm({
    resolver: zodResolver(categoryFormSchema as any),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      parentId: initialData?.parentId || "",
      imageUrl: extractKeyFromUrl(initialData?.imageUrl) || "",
      mobileImageUrl: extractKeyFromUrl(initialData?.mobileImageUrl) || "",
      codeValue: initialData?.codeValue || "",
      inCodeSet: initialData?.inCodeSet || "",
      favourite: initialData?.favourite ?? false,
      mobile: initialData?.mobile ?? false,
      isArchived: initialData?.isArchived ?? false,
    },
  });

  const handleImagesChange = useCallback(
    (
      images: Array<{
        file: File | null;
        alt: string;
        preview: string;
        finalUrl?: string;
        key?: string;
      }>,
    ) => {
      setUploadedImages(images);
    },
    [],
  );

  const handleMobileImagesChange = useCallback(
    (
      images: Array<{
        file: File | null;
        alt: string;
        preview: string;
        finalUrl?: string;
        key?: string;
      }>,
    ) => {
      setUploadedMobileImages(images);
    },
    [],
  );

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        parentId: initialData.parentId || "",
        imageUrl: extractKeyFromUrl(initialData.imageUrl) || "",
        mobileImageUrl: extractKeyFromUrl(initialData.mobileImageUrl) || "",
        codeValue: initialData.codeValue || "",
        inCodeSet: initialData.inCodeSet || "",
        favourite: initialData.favourite ?? false,
        mobile: initialData.mobile ?? false,
        isArchived: initialData.isArchived ?? false,
      });

      setUploadedImages(
        initialData.imageUrl
          ? [
              {
                file: null,
                alt: initialData.name || "Category Image",
                preview: getCdnUrl(initialData.imageUrl),
                finalUrl: getCdnUrl(initialData.imageUrl),
                key: extractKeyFromUrl(initialData.imageUrl),
              },
            ]
          : [],
      );

      setUploadedMobileImages(
        initialData.mobileImageUrl
          ? [
              {
                file: null,
                alt: initialData.name || "Mobile Category Image",
                preview: getCdnUrl(initialData.mobileImageUrl),
                finalUrl: getCdnUrl(initialData.mobileImageUrl),
                key: extractKeyFromUrl(initialData.mobileImageUrl),
              },
            ]
          : [],
      );
    } else {
      form.reset({
        name: "",
        slug: "",
        description: "",
        parentId: "",
        imageUrl: "",
        mobileImageUrl: "",
        codeValue: "",
        inCodeSet: "",
        favourite: false,
        mobile: false,
        isArchived: false,
      });
      setUploadedImages([]);
      setUploadedMobileImages([]);
    }
  }, [initialData, form]);

  useEffect(() => {
    const imageUrl = uploadedImages[0]?.key || "";
    form.setValue("imageUrl", imageUrl, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [uploadedImages, form]);

  useEffect(() => {
    const mobileImageUrl = uploadedMobileImages[0]?.key || "";
    form.setValue("mobileImageUrl", mobileImageUrl, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [uploadedMobileImages, form]);

  const onSubmit = async (data: any) => {
    try {
      const formattedData = {
        ...data,
        slug: data.slug || undefined,
        description: data.description || undefined,
        parentId: data.parentId || undefined,
        imageUrl: uploadedImages[0]?.key || "",
        mobileImageUrl: uploadedMobileImages[0]?.key || "",
      };

      if (initialData) {
        await updateCategory({
          variables: {
            id: initialData._id,
            input: formattedData,
          },
        });
      } else {
        await createCategory({
          variables: {
            input: formattedData,
          },
        });
      }
      onClose();
    } catch (error) {
      console.error("Failed to save category:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., Snacks" />
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
                  <Input
                    {...field}
                    placeholder="e.g., snacks (auto-generated if empty)"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="codeValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code Value (Optional)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., SNACKS - Leave empty if not needed"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="inCodeSet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>In Code Set (Optional)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., FOOD_CATEGORY - Leave empty if not needed"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent ID</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Leave empty for root category"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <FormLabel>Category Image</FormLabel>
            <ImageUpload
              onImagesChange={handleImagesChange}
              initialImages={
                initialData?.imageUrl
                  ? [
                      {
                        url: getCdnUrl(initialData.imageUrl),
                        alt: initialData.name,
                      },
                    ]
                  : []
              }
              maxFiles={1}
              allowedFileTypes={["image/webp"]}
            />
            <input type="hidden" {...form.register("imageUrl")} />
          </div>

          <div className="space-y-2">
            <FormLabel>Mobile Category Image</FormLabel>
            <div
              onClickCapture={(e) => {
                if (!form.getValues("mobile")) {
                  e.stopPropagation();
                  e.preventDefault();
                  alert(
                    "Please enable the 'Mobile' option before uploading a mobile category image.",
                  );
                }
              }}
            >
              <ImageUpload
                onImagesChange={handleMobileImagesChange}
                initialImages={
                  initialData?.mobileImageUrl
                    ? [
                        {
                          url: getCdnUrl(initialData.mobileImageUrl),
                          alt: initialData.name,
                        },
                      ]
                    : []
                }
                maxFiles={1}
                allowedFileTypes={["image/webp"]}
              />
            </div>
            <input type="hidden" {...form.register("mobileImageUrl")} />
          </div>
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Category description..."
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="favourite"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="!mt-0">Favourite</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mobile"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="!mt-0">Mobile</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isArchived"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="!mt-0">Is Archived</FormLabel>
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? "Update" : "Create"} Category
          </Button>
        </div>
      </form>
    </Form>
  );
}
