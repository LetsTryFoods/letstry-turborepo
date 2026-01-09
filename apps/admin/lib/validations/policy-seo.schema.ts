import { z } from "zod";
import { seoBaseSchema } from "./seo-common.schema";

export const policySeoSchema = z.object({
    ...seoBaseSchema,
    policyId: z.string().min(1, "Policy ID is required"),
});

export type PolicySeoFormData = z.infer<typeof policySeoSchema>;
