import { z } from "zod"

export const blogFormSchema = z.object({
    slug: z.string().min(1, { message: "Slug is required" }),
    title: z.string().min(1, { message: "Title is required" }),
    excerpt: z.string().min(1, { message: "Excerpt is required" }),
    content: z.string().min(1, { message: "Content is required" }),
    image: z.string().optional(),
    date: z.string().min(1, { message: "Date is required" }),
    author: z.string().min(1, { message: "Author is required" }),
    category: z.string().min(1, { message: "Category is required" }),
    isActive: z.boolean(),
    position: z.coerce.number().min(0, { message: "Position must be 0 or greater" }),
})

export type BlogFormValues = z.infer<typeof blogFormSchema>
