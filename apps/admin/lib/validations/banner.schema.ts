import { z } from "zod"

export const bannerFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  headline: z.string().min(1, { message: "Headline is required" }),
  subheadline: z.string().min(1, { message: "Subheadline is required" }),
  description: z.string().optional(),
  imageUrl: z.string().min(1, { message: "Image URL is required" }),
  mobileImageUrl: z.string().min(1, { message: "Mobile Image URL is required" }),
  thumbnailUrl: z.string().optional(),
  url: z.string().min(1, { message: "URL is required" }),
  ctaText: z.string().min(1, { message: "CTA Text is required" }),
  position: z.coerce.number().min(0, { message: "Position must be 0 or greater" }),
  isActive: z.boolean(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
})

export type BannerFormValues = z.infer<typeof bannerFormSchema>
