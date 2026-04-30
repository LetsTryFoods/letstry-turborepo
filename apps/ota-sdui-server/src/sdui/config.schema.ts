import { z } from 'zod';

export const AppConfigSchema = z.object({
  homeEventsHeroTopMargin: z.number().default(0),
  searchBarPlaceholder: z.string().default('Search for snacks, sweets...'),
  // Add other UI configurations here as needed
});

export type AppConfig = z.infer<typeof AppConfigSchema>;
