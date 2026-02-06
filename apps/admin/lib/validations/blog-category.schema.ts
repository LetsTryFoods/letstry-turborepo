import { z } from 'zod';

export const blogCategoryFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required'),
    description: z.string().optional(),
    isActive: z.boolean().default(true),
    position: z.number().default(0),
});

export type BlogCategoryFormValues = z.infer<typeof blogCategoryFormSchema>;
