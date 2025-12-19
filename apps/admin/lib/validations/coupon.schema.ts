import { z } from 'zod'

export const couponFormSchema = z.object({
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
  endDate: z.string().min(1, 'End date is required'),
  isActive: z.boolean(),
//   eligibilityType: z.enum(['ALL', 'FIRST_ORDER', 'SPECIFIC_USERS'], {
//     required_error: 'Eligibility type is required',
//   }),
//   applicationScope: z.enum(['ALL_PRODUCTS', 'SPECIFIC_CATEGORIES', 'SPECIFIC_PRODUCTS'], {
//     required_error: 'Application scope is required',
//   }),
//   usageLimit: z.coerce.number().int().min(0, 'Usage limit cannot be negative').optional(),
}).refine((data) => {
  const start = new Date(data.startDate)
  const end = new Date(data.endDate)
  return end > start
}, {
  message: 'End date must be after start date',
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

export type CouponFormValues = z.infer<typeof couponFormSchema>
