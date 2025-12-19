import { z } from 'zod'

export const chargesFormSchema = z.object({
  active: z.boolean(),
  handlingCharge: z.coerce.number().min(0, 'Handling charge cannot be negative'),
  gstPercentage: z.coerce.number().min(0, 'GST percentage cannot be negative').max(100, 'GST percentage cannot exceed 100%'),
  freeDeliveryThreshold: z.coerce.number().min(0, 'Free delivery threshold cannot be negative'),
  deliveryDelhiBelowThreshold: z.coerce.number().min(0, 'Delivery charge cannot be negative'),
  deliveryRestBelowThreshold: z.coerce.number().min(0, 'Delivery charge cannot be negative'),
})

export type ChargesFormValues = z.infer<typeof chargesFormSchema>
