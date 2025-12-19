import { z } from "zod";

export const seoContentSchema = z.object({
  pageName: z
    .string()
    .min(1, "Page name is required")
    .max(100, "Page name must be less than 100 characters"),
  pageSlug: z
    .string()
    .min(1, "Page slug is required")
    .max(100, "Page slug must be less than 100 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  metaTitle: z
    .string()
    .min(1, "Meta title is required")
    .max(70, "Meta title should be less than 70 characters for best SEO"),
  metaDescription: z
    .string()
    .min(1, "Meta description is required")
    .max(160, "Meta description should be less than 160 characters for best SEO"),
  metaKeywords: z
    .string()
    .max(500, "Keywords must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  canonicalUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  ogTitle: z
    .string()
    .max(95, "Social title should be less than 95 characters")
    .optional()
    .or(z.literal("")),
  ogDescription: z
    .string()
    .max(200, "Social description should be less than 200 characters")
    .optional()
    .or(z.literal("")),
  ogImage: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  isActive: z.boolean(),
});

export type SeoContentFormData = z.infer<typeof seoContentSchema>;
