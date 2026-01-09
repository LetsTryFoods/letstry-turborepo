import { z } from "zod";
import { seoBaseSchema } from "./seo-common.schema";

export const productSeoSchema = z.object({
  ...seoBaseSchema,
  productId: z.string().min(1, "Product ID is required"),
});

export type ProductSeoFormData = z.infer<typeof productSeoSchema>;
