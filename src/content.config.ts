import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { workLoader } from '@src/scripts/work-loader.js';


const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/work" }),
  schema: z.object({
    title: z.string(),
    description: z.ostring(),
    tags: z.array(reference('tags')),
    start_date: z.date().optional(),
    date: z.union([z.date(), z.literal('present')]),
    priority: z.number().default(Infinity),
    draft: z.oboolean(),
    show_toc: z.oboolean(),
    unlisted: z.boolean().default(false),
  })
});

const works = defineCollection({
  loader: workLoader,
  schema: z.object({
    title: z.string(),
  })
})

const tags = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/tags" }),
  schema: z.object({
    title: z.string(),
    'listed as': z.ostring(),
    unlisted: z.boolean().optional().default(false),
    'prioritize balance': z.boolean().default(false),
    'hide others': z.boolean().default(false),
    parents: z.array(reference('tags')).optional()
  })
});

export const collections = {
  projects,
  tags,
  works
};
