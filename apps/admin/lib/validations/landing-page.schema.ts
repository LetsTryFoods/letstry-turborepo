import { z } from 'zod'

export const sectionPlatformLinkSchema = z.object({
  platform: z.string().min(1, { message: 'Platform is required' }),
  url: z.string().url({ message: 'Must be a valid URL' }),
})

export const landingPageSectionSchema = z.object({
  type: z.string().min(1, { message: 'Type is required' }),
  title: z.string().min(1, { message: 'Title is required' }),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  buttonText: z.string().optional(),
  buttonLink: z.string().optional(),
  productSlugs: z.array(z.string()).optional(),
  platformLinks: z.array(sectionPlatformLinkSchema).optional(),
  backgroundColor: z.string().optional(),
  position: z.coerce.number().min(0).optional(),
  isActive: z.boolean().optional(),
})

export const landingPageSeoSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.array(z.string()).optional(),
  canonicalUrl: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
})

export const landingPageFormSchema = z.object({
  slug: z.string().min(1, { message: 'Slug is required' }),
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  sections: z.array(landingPageSectionSchema).optional(),
  seo: landingPageSeoSchema.optional(),
  isActive: z.boolean(),
  position: z.coerce.number().min(0),
})

export type LandingPageFormValues = z.infer<typeof landingPageFormSchema>
export type LandingPageSectionValues = z.infer<typeof landingPageSectionSchema>
export type SectionPlatformLinkValues = z.infer<typeof sectionPlatformLinkSchema>
