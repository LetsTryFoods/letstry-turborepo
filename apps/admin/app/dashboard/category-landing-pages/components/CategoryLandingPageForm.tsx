'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  categoryLandingPageFormSchema,
  CategoryLandingPageFormValues,
} from '@/lib/validations/category-landing-page.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { CategoryTilesField } from './CategoryTilesField'
import { FaqsField } from './FaqsField'

interface CategoryLandingPageFormProps {
  onClose: () => void
  initialData?: any | null
  createPage: any
  updatePage: any
}

export function CategoryLandingPageForm({
  onClose,
  initialData,
  createPage,
  updatePage,
}: CategoryLandingPageFormProps) {
  const form = useForm<CategoryLandingPageFormValues>({
    resolver: zodResolver(categoryLandingPageFormSchema),
    defaultValues: {
      slug: initialData?.slug || '',
      pageTitle: initialData?.pageTitle || '',
      description: initialData?.description || '',
      tilesHeading: initialData?.tilesHeading || '',
      faqHeading: initialData?.faqHeading || '',
      tiles: (initialData?.tiles || []).map((t: any) => ({
        name: t.name || '',
        blurb: t.blurb || '',
        imageUrl: t.imageUrl || '',
        shopNowUrl: t.shopNowUrl || '',
        position: t.position ?? 0,
      })),
      faqs: (initialData?.faqs || []).map((f: any) => ({
        question: f.question || '',
        answer: f.answer || '',
        position: f.position ?? 0,
      })),
      seo: {
        metaTitle: initialData?.seo?.metaTitle || '',
        metaDescription: initialData?.seo?.metaDescription || '',
        canonicalUrl: initialData?.seo?.canonicalUrl || '',
        ogTitle: initialData?.seo?.ogTitle || '',
        ogDescription: initialData?.seo?.ogDescription || '',
        ogImage: initialData?.seo?.ogImage || '',
      },
      isActive: initialData?.isActive ?? true,
    },
  })

  const onSubmit = async (data: CategoryLandingPageFormValues) => {
    try {
      if (initialData) {
        await updatePage({ variables: { id: initialData._id, input: data } })
      } else {
        await createPage({ variables: { input: data } })
      }
      onClose()
    } catch {}
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* ── Page Details ── */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Page Details
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="pageTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Page Title (H1) *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="No Palm Oil Snacks — Healthy Indian Namkeen" />
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
                  <FormLabel>URL Slug *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="bhujia" />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Must match a category slug to show products at{' '}
                    <span className="font-mono">/category/[slug]</span>
                  </p>
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
                <FormLabel>Intro Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className="h-28 resize-none"
                    placeholder={'Paragraph one...\n\nParagraph two...'}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Separate paragraphs with a blank line (double Enter).
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="tilesHeading"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiles Section Heading</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Shop by Category" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="faqHeading"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>FAQ Section Heading</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Frequently Asked Questions" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0">Active (visible on website)</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* ── Category Tiles ── */}
        <CategoryTilesField form={form} />

        <Separator />

        {/* ── FAQs ── */}
        <FaqsField form={form} />

        <Separator />

        {/* ── SEO (collapsible) ── */}
        <Collapsible>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border px-4 py-2 text-sm font-semibold hover:bg-muted transition-colors">
            SEO Settings (optional)
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform [[data-state=open]_&]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="seo.metaTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Title</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seo.canonicalUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Canonical URL</FormLabel>
                    <FormControl><Input {...field} placeholder="https://..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="seo.metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Description</FormLabel>
                  <FormControl><Textarea {...field} className="h-16 resize-none" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="seo.ogTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OG Title</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seo.ogImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OG Image URL</FormLabel>
                    <FormControl><Input {...field} placeholder="https://..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="seo.ogDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OG Description</FormLabel>
                  <FormControl><Textarea {...field} className="h-16 resize-none" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CollapsibleContent>
        </Collapsible>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update Page' : 'Create Page'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
