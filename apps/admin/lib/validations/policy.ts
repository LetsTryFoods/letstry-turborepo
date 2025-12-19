import { z } from "zod"

export const policyFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  content: z.string().min(10, {
    message: "Content must be at least 10 characters.",
  }),
  type: z.string().optional(),
})

export type PolicyFormValues = z.infer<typeof policyFormSchema>
