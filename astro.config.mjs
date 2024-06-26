import { defineConfig } from 'astro/config';

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: 'https://calder-rh.github.io/portfolio',
  redirects: {
    '/work/d16': '../links/d16-workshop'
  },
  integrations: [mdx()]
});