import { z } from 'zod'

export const categoryTileSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  blurb: z.string().optional(),
  imageUrl: z.string().optional(),
  shopNowUrl: z.string().min(1, { message: 'Shop Now URL is required' }),
  position: z.coerce.number().min(0).optional(),
})

export const categoryFaqSchema = z.object({
  question: z.string().min(1, { message: 'Question is required' }),
  answer: z.string().min(1, { message: 'Answer is required' }),
  position: z.coerce.number().min(0).optional(),
})

export const categoryLandingPageSeoSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.array(z.string()).optional(),
  canonicalUrl: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
})

export const categoryLandingPageFormSchema = z.object({
  slug: z.string().min(1, { message: 'Slug is required' }),
  pageTitle: z.string().min(1, { message: 'Page title is required' }),
  description: z.string().optional(),
  tilesHeading: z.string().optional(),
  faqHeading: z.string().optional(),
  tiles: z.array(categoryTileSchema).optional(),
  faqs: z.array(categoryFaqSchema).optional(),
  seo: categoryLandingPageSeoSchema.optional(),
  isActive: z.boolean(),
})

export type CategoryLandingPageFormValues = z.infer<typeof categoryLandingPageFormSchema>
export type CategoryTileValues = z.infer<typeof categoryTileSchema>
export type CategoryFaqValues = z.infer<typeof categoryFaqSchema>
