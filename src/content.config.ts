import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';


const parameters = defineCollection({
  schema: z.object({
    name: z.string(),
    inherit: z.enum(['up', 'down', 'none']).default('none'),
    home: z.boolean(),
    gallery: z.boolean()
  })
})

function arr(x) {
  if (Array.isArray(x)) return x
  else if (x) return [x]
  else return []
}

function yarra(x) {
  return z.union([x(), z.array(x())]).transform(arr)
}

const a = z.union([z.string(), z.array(z.string())])

const items = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/items" }),
  schema: z.object({
    name: z.union([
      z.string(),
      z.object({
        main: z.string(),
        title: z.ostring(),
      })
    ]),

    description: z.ostring(),
    date: z.union([
      z.date(),
      z.object({
        start: z.date(),
        end: z.date()
      })
    ]).optional(),
    image: z.union([
      yarra(z.string),
      z.object({
        page: yarra(z.string).optional(),
        home: yarra(z.string).optional(),
        gallery: z.string().optional(),
        embed: z.string().optional()
      })
    ]).optional(),
    
    home: yarra(() => z.enum(['work', 'tag'])).default([]),
    gallery: z.enum(['work', 'tag']).optional().transform(arr),
    page: z.union([
      z.enum(['manual', 'auto', 'contextual', 'none']),
      z.object({
        title: z.boolean().default(true),
        description: z.boolean().default(true),
        date: z.boolean().default(true),
      })
    ]).default('contextual'),

    unlisted: z.boolean().default(false),
    draft: z.boolean().default(false),
    priority: z.number().default(Infinity),

    parameter: reference('parameters').optional(),

    tags: yarra(() => reference('items')).optional(),
  })
})


const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/projects" }),
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
  items,
};
