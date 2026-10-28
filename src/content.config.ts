import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { topicIds } from './config/site';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    topic: z.enum(topicIds),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    author: z.string().optional(),
  }),
});

export const collections = { articles };
