import { z } from "zod"

export const addressFormSchema = z.object({
  batchCode: z.string().min(1, { message: "Batch Code is required" }).max(10, { message: "Batch Code must be 10 characters or less" }),
  addressHeading: z.string().min(1, { message: "Company Name is required" }),
  subAddressHeading: z.string().min(1, { message: "Full Address is required" }),
  fssaiLicenseNumber: z.string().min(1, { message: "FSSAI License Number is required" }),
  isActive: z.boolean(),
})

export type AddressFormValues = z.infer<typeof addressFormSchema>
