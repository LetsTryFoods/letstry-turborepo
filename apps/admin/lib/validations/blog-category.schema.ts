import { z } from 'zod';

export const blogCategoryFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required'),
    description: z.string().optional(),
    isActive: z.boolean(),
    position: z.number(),
});

export type BlogCategoryFormValues = z.infer<typeof blogCategoryFormSchema>;
