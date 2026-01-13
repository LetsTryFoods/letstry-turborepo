import { z } from "zod"

export const categoryFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  slug: z.string().optional(),
  description: z.string().optional(),
  parentId: z.string().optional(),
  imageUrl: z.string().optional(),
  codeValue: z.string().optional(),
  inCodeSet: z.string().optional(),
  favourite: z.boolean().optional(),
  isArchived: z.boolean(),
})

export type CategoryFormValues = z.infer<typeof categoryFormSchema>
