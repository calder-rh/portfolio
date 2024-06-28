import { z, defineCollection } from 'astro:content';

const workCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    things: z.array(z.string()),
  })
});

export const collections = {
  'work': workCollection,
};