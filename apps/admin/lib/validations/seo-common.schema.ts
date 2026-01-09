import { z } from "zod";

export const seoBaseSchema = {
    metaTitle: z
        .string()
        .min(1, "Meta title is required")
        .max(70, "Meta title should be under 70 characters"),
    metaDescription: z
        .string()
        .min(1, "Meta description is required")
        .max(160, "Meta description should be under 160 characters"),
    metaKeywords: z.array(z.string()),
    canonicalUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    ogTitle: z.string().optional().or(z.literal("")),
    ogDescription: z.string().optional().or(z.literal("")),
    ogImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
};

export const baseSeoSchema = z.object(seoBaseSchema);

export type BaseSeoFormData = z.infer<typeof baseSeoSchema>;
