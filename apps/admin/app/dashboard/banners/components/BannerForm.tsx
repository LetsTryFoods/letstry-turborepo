'use client'

import { useState, useEffect, useCallback } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { bannerFormSchema } from "@/lib/validations/banner.schema"
import { z } from "zod"
import { ImageUpload } from "@/components/custom/image-upload"

type BannerFormValues = z.infer<typeof bannerFormSchema>

interface BannerFormProps {
  onClose: () => void
  initialData?: any | null
  createBanner: any
  updateBanner: any
}

export function BannerForm({ onClose, initialData, createBanner, updateBanner }: BannerFormProps) {
  // Helper function to format ISO date to datetime-local format
  const formatDateForInput = (isoDate: string | null | undefined) => {
    if (!isoDate) return ""
    const date = new Date(isoDate)
    // Format as YYYY-MM-DDTHH:MM for datetime-local input
    return date.toISOString().slice(0, 16)
  }

  const [uploadedImages, setUploadedImages] = useState<Array<{ file: File | null; alt: string; preview: string; finalUrl?: string }>>(
    initialData?.imageUrl ? [{
      file: null,
      alt: initialData.name || "Banner Image",
      preview: initialData.imageUrl,
      finalUrl: initialData.imageUrl
    }] : []
  )

  const [uploadedMobileImages, setUploadedMobileImages] = useState<Array<{ file: File | null; alt: string; preview: string; finalUrl?: string }>>(
    initialData?.mobileImageUrl ? [{
      file: null,
      alt: initialData.name || "Banner Mobile Image",
      preview: initialData.mobileImageUrl,
      finalUrl: initialData.mobileImageUrl
    }] : []
  )

  const handleImagesChange = useCallback((images: Array<{ file: File | null; alt: string; preview: string; finalUrl?: string }>) => {
    setUploadedImages(images)
  }, [])

  const handleMobileImagesChange = useCallback((images: Array<{ file: File | null; alt: string; preview: string; finalUrl?: string }>) => {
    setUploadedMobileImages(images)
  }, [])

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      headline: initialData?.headline || "",
      subheadline: initialData?.subheadline || "",
      description: initialData?.description || "",
      imageUrl: initialData?.imageUrl || "",
      mobileImageUrl: initialData?.mobileImageUrl || "",
      thumbnailUrl: initialData?.thumbnailUrl || "",
      url: initialData?.url || "",
      ctaText: initialData?.ctaText || "",
      position: initialData?.position || 0,
      isActive: initialData?.isActive ?? true,
      startDate: formatDateForInput(initialData?.startDate),
      endDate: formatDateForInput(initialData?.endDate),
      backgroundColor: initialData?.backgroundColor || "",
      textColor: initialData?.textColor || "",
    },
  })

  useEffect(() => {
    const imageUrl = uploadedImages[0]?.finalUrl || ''
    form.setValue('imageUrl', imageUrl, { shouldValidate: true, shouldDirty: true })
  }, [uploadedImages, form])

  useEffect(() => {
    const mobileImageUrl = uploadedMobileImages[0]?.finalUrl || ''
    form.setValue('mobileImageUrl', mobileImageUrl, { shouldValidate: true, shouldDirty: true })
  }, [uploadedMobileImages, form])

  const onSubmit = async (data: BannerFormValues) => {
    try {
     
      const formattedData = {
        ...data,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
      }

      if (initialData) {
        await updateBanner({
          variables: {
            id: initialData._id,
            input: formattedData
          }
        })
      } else {
        await createBanner({
          variables: {
            input: formattedData
          }
        })
      }
      onClose()
    } catch (error) {
      console.error("Failed to save banner:", error)
    }
  }

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
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="headline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Headline *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subheadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subheadline *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-2 col-span-2">
            <FormLabel>Banner Image *</FormLabel>
            <ImageUpload 
              onImagesChange={handleImagesChange}
              initialImages={initialData?.imageUrl ? [{ url: initialData.imageUrl, alt: initialData.name }] : []}
              maxFiles={1}
              allowedFileTypes={['image/webp']}
            />
            <input type="hidden" {...form.register('imageUrl')} />
          </div>
          <div className="space-y-2 col-span-2">
            <FormLabel>Mobile Image *</FormLabel>
            <ImageUpload 
              onImagesChange={handleMobileImagesChange}
              initialImages={initialData?.mobileImageUrl ? [{ url: initialData.mobileImageUrl, alt: initialData.name }] : []}
              maxFiles={1}
              allowedFileTypes={['image/webp']}
            />
            <input type="hidden" {...form.register('mobileImageUrl')} />
          </div>
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Redirect to URL *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ctaText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CTA Text *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={field.value as number}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="thumbnailUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thumbnail URL</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="backgroundColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Background Color</FormLabel>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Input 
                      type="color" 
                      {...field} 
                      value={field.value || '#000000'}
                      className="w-20 h-10 cursor-pointer"
                    />
                  </FormControl>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="#000000" 
                      value={field.value || ''}
                      className="flex-1"
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="textColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Text Color</FormLabel>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Input 
                      type="color" 
                      {...field} 
                      value={field.value || '#FFFFFF'}
                      className="w-20 h-10 cursor-pointer"
                    />
                  </FormControl>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="#FFFFFF" 
                      value={field.value || ''}
                      className="flex-1"
                    />
                  </FormControl>
                </div>
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="!mt-0">Is Active</FormLabel>
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create Banner</Button>
        </div>
      </form>
    </Form>
  )
}
