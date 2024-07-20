import { z, defineCollection } from 'astro:content';

const workCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.ostring(),
    tags: z.array(z.string()),
    start_date: z.date().optional(),
    date: z.union([z.date(), z.literal('present')]),
    priority: z.onumber(),
    draft: z.oboolean()
  })
});

export const collections = {
  'work': workCollection,
};