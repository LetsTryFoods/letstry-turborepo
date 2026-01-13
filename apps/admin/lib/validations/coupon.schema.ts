import { z } from 'zod'

const baseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  code: z.string().min(1, 'Code is required').regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase alphanumeric with dashes or underscores'),
  discountType: z.enum(['PERCENTAGE', 'FIXED'], {
    required_error: 'Discount type is required',
  }),
  discountValue: z.coerce.number().min(0.01, 'Discount value must be greater than 0'),
  minCartValue: z.coerce.number().min(0, 'Minimum cart value cannot be negative').optional(),
  maxDiscountAmount: z.coerce.number().min(0, 'Maximum discount cannot be negative').optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  hasInfiniteValidity: z.boolean(),
  platform: z.enum(['MOBILE', 'DESKTOP', 'BOTH']),
  isActive: z.boolean(),
})

export const couponFormSchema = baseSchema.refine((data) => {
  if (!data.hasInfiniteValidity && data.endDate) {
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    return end > start
  }
  return true
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
}).refine((data) => {
  if (!data.hasInfiniteValidity && !data.endDate) {
    return false
  }
  return true
}, {
  message: 'End date is required when infinite validity is disabled',
  path: ['endDate'],
}).refine((data) => {
  if (data.discountType === 'PERCENTAGE') {
    return data.discountValue <= 100
  }
  return true
}, {
  message: 'Percentage discount cannot exceed 100%',
  path: ['discountValue'],
})

export type CouponFormValues = z.infer<typeof baseSchema>
