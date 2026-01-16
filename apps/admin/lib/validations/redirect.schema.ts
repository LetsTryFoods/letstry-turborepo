import { z } from 'zod'

export const redirectFormSchema = z.object({
  fromPath: z.string()
    .min(1, 'From path is required')
    .refine(
      (path) => path.startsWith('/'),
      'Path must start with /'
    ),
  toPath: z.string()
    .min(1, 'To path is required')
    .refine(
      (path) => path.startsWith('/') || path.startsWith('http'),
      'Path must start with / or be a full URL'
    ),
  statusCode: z.number().int().min(300).max(399).optional(),
  description: z.string().optional(),
  source: z.string().optional(),
  isActive: z.boolean().optional(),
})
