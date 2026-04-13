'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { seoSchema, SeoFormData } from '@/lib/validations/seo.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface LandingPageSeoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: any
  onSave: (seoData: SeoFormData) => Promise<void>
}

export function LandingPageSeoDialog({ open, onOpenChange, initialData, onSave }: LandingPageSeoDialogProps) {
  const [keywords, setKeywords] = useState<string[]>(initialData?.seo?.metaKeywords || [])
  const [keywordInput, setKeywordInput] = useState('')

  const form = useForm<SeoFormData>({
    resolver: zodResolver(seoSchema),
    defaultValues: {
      metaTitle: initialData?.seo?.metaTitle || initialData?.title || '',
      metaDescription: initialData?.seo?.metaDescription || initialData?.description || '',
      metaKeywords: initialData?.seo?.metaKeywords || [],
      canonicalUrl: initialData?.seo?.canonicalUrl || '',
      ogTitle: initialData?.seo?.ogTitle || initialData?.title || '',
      ogDescription: initialData?.seo?.ogDescription || initialData?.description || '',
      ogImage: initialData?.seo?.ogImage || initialData?.thumbnailUrl || '',
    },
  })

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      const newKeywords = [...keywords, keywordInput.trim()]
      setKeywords(newKeywords)
      form.setValue('metaKeywords', newKeywords)
      setKeywordInput('')
    }
  }

  const removeKeyword = (keyword: string) => {
    const newKeywords = keywords.filter((k) => k !== keyword)
    setKeywords(newKeywords)
    form.setValue('metaKeywords', newKeywords)
  }

  const onSubmit = async (data: SeoFormData) => {
    try {
      await onSave(data)
      onOpenChange(false)
    } catch {}
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Landing Page SEO Settings</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="metaTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter meta title" />
                  </FormControl>
                  <FormDescription>{field.value?.length || 0}/70 characters</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter meta description" className="h-24" />
                  </FormControl>
                  <FormDescription>{field.value?.length || 0}/160 characters</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Meta Keywords</FormLabel>
              <div className="flex gap-2">
                <Input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="Add keyword"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword() } }}
                />
                <Button type="button" variant="outline" onClick={addKeyword}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {keywords.map((kw) => (
                  <Badge key={kw} variant="secondary" className="gap-1">
                    {kw}
                    <button type="button" onClick={() => removeKeyword(kw)}><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
            </FormItem>
            <FormField
              control={form.control}
              name="canonicalUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Canonical URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://example.com/landing/slug" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ogTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OG Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Open Graph title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ogDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OG Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Open Graph description" className="h-20" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ogImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OG Image URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://example.com/image.jpg" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Save SEO</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
