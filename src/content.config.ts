import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';


function toArr(x) {
  if (Array.isArray(x)) return x
  else if (x) return [x]
  else return x
}

function oneOrMore(x) {
  return z.union([x, z.array(x)]).transform(toArr)
}

function toDate(input: number | string | Date): {date: Date, display: string} {
  if (input === 'present') {
    return {date: new Date(), display: 'present'}
  } else if (input === 'long ago') {
    return {date: new Date('2000-09-23'), display: 'long ago'}
  } else if (input instanceof Date) {
    const dateFormat = {
      year: "numeric",
      month: "long",
      day: "numeric"
    }
    const display = input.toLocaleDateString("en-US", dateFormat)
    return {date: input, display}
  } else if (Number.isInteger(input)) {
    return toDate(input.toString())
  } else
  {
    const match = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(input);

    if (!match) {
      throw new Error("Invalid date format");
    }

    const year = Number(match[1]);
    const {month, day, dateFormat} = (() => {
      if (match[2]) {
        const month = Number(match[2]) - 1
        if (match[3]) {
          const day = Number(match[3])
          return {
            month,
            day,
            dateFormat: {
              year: "numeric",
              month: "long",
              day: "numeric"
            }}
        } else {
          return {
            month, 
            day: 1,
            dateFormat: {
              year: "numeric",
              month: "long",
            }}
        }
      } else {
        return {
          month: 0,
          day: 1,
          dateFormat: {
            year: "numeric",
          }
        }
      }
    })()

    const date = new Date(year, month, day)
    const display = date.toLocaleDateString("en-US", dateFormat)

    return {date, display}
  }
}

const imageOptions = z.union([
  z.string().transform((path) => [{path}]),
  z.array(z.object({path: z.string()}).passthrough())
])

const rows = z.union([
  z.string().transform((item) => [[item]]),
  z.array(z.union([
    z.string().transform((item) => [item]),
    z.array(z.string()),
  ]))
])

function toFirstRest(paths) {
  return {
    first: [],
    rest: paths
  }
}

const slides = z.union([
  z.string().transform((path) => toFirstRest([path])),
  z.array(z.string()).transform(toFirstRest),
  z.object({
    first: oneOrMore(z.string()),
    rest: oneOrMore(z.string()).default([]),
  })
]).transform(({first, rest}) => ({first, rest, all: [...first, ...rest]}))

const dateIsh = z.union([
  z.number(),
  z.date(),
  z.string()
])

const items = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.{md,mdx}',
    base: "./src/items",
    generateId: ({entry}) => entry.replace(/^[^/]+\//, '').replace(/\.[^.]+$/, '')
  }),
  schema: z.object({
    name: z.string(),
    title: z.ostring(),
    short: z.ostring(),
    
    description: z.ostring(),
    date: z.union([
      dateIsh.transform(toDate).transform((oneDate) => ({
        start: oneDate,
        end: oneDate,
      })),
      z.object({
        start: dateIsh.transform(toDate),
        end: dateIsh.transform(toDate),
      })
    ]).optional(),
    
    image: z.union([
      z.string().transform((path) => ({
        main: [{path}],
        preview: [{path}],
      })),
      z.object({
        main: imageOptions,
        preview: imageOptions.optional(),
      })
    ]).optional(),

    rows: rows.optional(),

    slides: slides.optional(),
    
    home: oneOrMore(z.enum(['work', 'tag'])).default([]),
    gallery: oneOrMore(z.enum(['work', 'tag'])).default([]),
    page: z.enum(['manual', 'auto', 'none']).optional(),
    autoPage: z.object({
      title: z.boolean().default(true),
      description: z.boolean().default(true),
      date: z.boolean().default(true),
    }).default({
      title: true,
      description: true,
      date: true,
    }),

    topImage: z.boolean().default(false),

    unlisted: z.boolean().default(false),
    draft: z.boolean().default(false),
    priority: z.number().default(Infinity),

    parameter: reference('parameters').optional(),

    quote: z.boolean().default(false),
    backlink: z.ostring(),

    tags: oneOrMore(reference('items')).default([]),
  }).transform((data) => ({
    ...data,
    title: data.title ?? data.name,
    short: data.short ?? data.name,

    mainImage: data?.image?.main[0].path ?? data?.rows?.[0][0] ?? data?.slides?.all[0],
    rows: (() => {
      if (data?.rows !== undefined) return data.rows
      else {
        const mainImage = data?.image?.main[0].path
        if (mainImage) return [[mainImage]]
        else return undefined
      }
    })()
  }))
})

const parameters = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/parameters" }),
  schema: z.object({
    name: z.string(),
    inherit: z.enum(['up', 'down', 'none']).default('none'),
    home: z.boolean(),
    gallery: z.boolean()
  })
})


export const collections = {
  items,
  parameters
};
