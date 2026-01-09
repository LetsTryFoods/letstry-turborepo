import { z } from "zod";

export const categorySeoSchema = z.object({
    categoryId: z.string().min(1, "Category ID is required"),
    metaTitle: z
        .string()
        .min(1, "Meta title is required")
        .max(70, "Meta title should be under 70 characters"),
    metaDescription: z
        .string()
        .min(1, "Meta description is required")
        .max(160, "Meta description should be under 160 characters"),
    metaKeywords: z.array(z.string()),
    canonicalUrl: z.string().optional(),
    ogTitle: z.string(),
    ogDescription: z.string(),
    ogImage: z.string().optional(),
});

export type CategorySeoFormData = z.infer<typeof categorySeoSchema>;
