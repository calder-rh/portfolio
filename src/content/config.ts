import { z, defineCollection } from 'astro:content';

const workCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    header: z.object({
      image: z.string(),
      fullwidth: z.boolean().optional(),
      collect: z.boolean().optional()
    }).optional()
  })
});

export const collections = {
  'work': workCollection,
};