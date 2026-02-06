'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { seoSchema, SeoFormData } from "@/lib/validations/seo.schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface BlogSeoDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    blogId: string
    initialData?: any
    onSave: (seoData: SeoFormData) => Promise<void>
}

export function BlogSeoDialog({ open, onOpenChange, blogId, initialData, onSave }: BlogSeoDialogProps) {
    const [keywords, setKeywords] = useState<string[]>(initialData?.seo?.metaKeywords || [])
    const [keywordInput, setKeywordInput] = useState("")

    const form = useForm<SeoFormData>({
        resolver: zodResolver(seoSchema),
        defaultValues: {
            metaTitle: initialData?.seo?.metaTitle || initialData?.title || "",
            metaDescription: initialData?.seo?.metaDescription || initialData?.excerpt || "",
            metaKeywords: initialData?.seo?.metaKeywords || [],
            canonicalUrl: initialData?.seo?.canonicalUrl || "",
            ogTitle: initialData?.seo?.ogTitle || initialData?.title || "",
            ogDescription: initialData?.seo?.ogDescription || initialData?.excerpt || "",
            ogImage: initialData?.seo?.ogImage || initialData?.image || "",
        },
    })

    const addKeyword = () => {
        if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
            const newKeywords = [...keywords, keywordInput.trim()]
            setKeywords(newKeywords)
            form.setValue('metaKeywords', newKeywords)
            setKeywordInput("")
        }
    }

    const removeKeyword = (keyword: string) => {
        const newKeywords = keywords.filter(k => k !== keyword)
        setKeywords(newKeywords)
        form.setValue('metaKeywords', newKeywords)
    }

    const onSubmit = async (data: SeoFormData) => {
        try {
            await onSave(data)
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to save SEO:", error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Blog SEO Settings</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="metaTitle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Meta Title *</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter meta title (max 70 characters)" />
                                    </FormControl>
                                    <FormDescription>
                                        {field.value?.length || 0}/70 characters
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="metaDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Meta Description *</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder="Enter meta description (max 160 characters)" className="h-24" />
                                    </FormControl>
                                    <FormDescription>
                                        {field.value?.length || 0}/160 characters
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="metaKeywords"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Meta Keywords</FormLabel>
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <Input
                                                value={keywordInput}
                                                onChange={(e) => setKeywordInput(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault()
                                                        addKeyword()
                                                    }
                                                }}
                                                placeholder="Add keyword and press Enter"
                                            />
                                            <Button type="button" onClick={addKeyword}>Add</Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {keywords.map((keyword) => (
                                                <Badge key={keyword} variant="secondary" className="gap-1">
                                                    {keyword}
                                                    <X
                                                        className="h-3 w-3 cursor-pointer"
                                                        onClick={() => removeKeyword(keyword)}
                                                    />
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="canonicalUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Canonical URL</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="https://example.com/blog/post-slug" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="border-t pt-4">
                            <h3 className="text-lg font-semibold mb-4">Open Graph (Social Media)</h3>

                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="ogTitle"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>OG Title</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Social media title" />
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
                                                <Textarea {...field} placeholder="Social media description" className="h-20" />
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
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Save SEO</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
