import { z, defineCollection, reference } from 'astro:content';

const workCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.ostring(),
    tags: z.array(reference('tags')),
    start_date: z.date().optional(),
    date: z.union([z.date(), z.literal('present')]),
    priority: z.onumber(),
    draft: z.oboolean(),
    show_toc: z.oboolean()
  })
});

const tagCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    unlisted: z.boolean().default(false),
    parents: z.array(reference('tags')).optional()
  })
})

export const collections = {
  'work': workCollection,
  'tags': tagCollection
};
