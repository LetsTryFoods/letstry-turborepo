import { z } from "zod"

export const socialMediaLinkSchema = z.object({
  platform: z.string().min(1, { message: "Platform name is required" }),
  url: z.string().url({ message: "Invalid URL" }),
  iconUrl: z.string().url({ message: "Invalid icon URL" }),
})

export const footerFormSchema = z.object({
  logoUrl: z.string().url({ message: "Invalid URL" }).optional().or(z.literal("")),
  companyName: z.string().min(1, { message: "Company Name is required" }),
  cin: z.string().min(1, { message: "CIN is required" }),
  address: z.string().min(1, { message: "Address is required" }),
  email: z.string().min(1, { message: "Email is required" }).email({ message: "Invalid email address" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  exportEmail: z.string().email({ message: "Invalid email address" }).optional().or(z.literal("")),
  socialMediaTitle: z.string().optional().or(z.literal("")),
  socialMediaLinks: z.array(socialMediaLinkSchema).optional(),
  isActive: z.boolean(),
})

export type SocialMediaLinkValues = z.infer<typeof socialMediaLinkSchema>
export type FooterFormValues = z.infer<typeof footerFormSchema>
