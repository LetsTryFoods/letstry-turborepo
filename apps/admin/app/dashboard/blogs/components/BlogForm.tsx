'use client'

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { blogFormSchema, BlogFormValues } from "@/lib/validations/blog.schema"
import { ImageUpload } from "@/components/custom/image-upload"
import { WysiwygEditor } from "@/components/custom/wysiwyg-editor"

interface BlogFormProps {
    onClose: () => void
    initialData?: any | null
    createBlog: any
    updateBlog: any
}

export function BlogForm({ onClose, initialData, createBlog, updateBlog }: BlogFormProps) {
    const [uploadedImages, setUploadedImages] = useState<Array<{ file: File | null; alt: string; preview: string; finalUrl?: string }>>(
        initialData?.image ? [{
            file: null,
            alt: initialData.title || "Blog Image",
            preview: initialData.image,
            finalUrl: initialData.image
        }] : []
    )

    const handleImagesChange = useCallback((images: Array<{ file: File | null; alt: string; preview: string; finalUrl?: string }>) => {
        setUploadedImages(images)
    }, [])

    const form = useForm<BlogFormValues>({
        resolver: zodResolver(blogFormSchema),
        defaultValues: {
            slug: initialData?.slug || "",
            title: initialData?.title || "",
            excerpt: initialData?.excerpt || "",
            content: initialData?.content || "",
            image: initialData?.image || "",
            date: initialData?.date || new Date().toISOString().split('T')[0],
            author: initialData?.author || "Let's Try Team",
            category: initialData?.category || "",
            isActive: initialData?.isActive ?? true,
            position: initialData?.position || 0,
        },
    })

    useEffect(() => {
        const imageUrl = uploadedImages[0]?.finalUrl || ''
        form.setValue('image', imageUrl, { shouldValidate: true, shouldDirty: true })
    }, [uploadedImages, form])

    const onSubmit = async (data: BlogFormValues) => {
        try {
            if (initialData) {
                await updateBlog({
                    variables: {
                        id: initialData._id,
                        input: data
                    }
                })
            } else {
                await createBlog({
                    variables: {
                        input: data
                    }
                })
            }
            onClose()
        } catch (error) {
            console.error("Failed to save blog:", error)
        }
    }

    // Auto-generate slug from title
    // const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const title = e.target.value
    //     field.onChange(title) // Update title field
    //     const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    //     form.setValue('slug', slug, { shouldValidate: true, shouldDirty: true })
    // }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title *</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        onChange={(e) => {
                                            field.onChange(e)
                                            const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                                            if (!initialData) {
                                                form.setValue('slug', slug, { shouldValidate: true })
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
                        name="slug"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Slug *</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="author"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Author *</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category *</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date *</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="MMM DD, YYYY" />
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
                                        value={field.value}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="image"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Blog Image</FormLabel>
                                <FormControl>
                                    <ImageUpload
                                        onImagesChange={handleImagesChange}
                                        initialImages={initialData?.image ? [{ url: initialData.image, alt: initialData.title }] : []}
                                        maxFiles={1}
                                        allowedFileTypes={['image/webp', 'image/gif', 'image/jpeg', 'image/png']}
                                        disableCompression={true}
                                    />
                                </FormControl>
                                <input type="hidden" {...field} value={field.value || ''} />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="col-span-2">
                        <FormField
                            control={form.control}
                            name="excerpt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Excerpt *</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} className="h-24" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-span-2">
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Content (HTML) *</FormLabel>
                                    <FormControl>
                                        <WysiwygEditor
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Write your blog content here..."
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

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
                    <Button type="submit">{initialData ? 'Update Blog' : 'Create Blog'}</Button>
                </div>
            </form>
        </Form>
    )
}
