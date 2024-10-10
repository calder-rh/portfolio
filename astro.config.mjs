import { defineConfig } from 'astro/config';

// import mdx from "@astrojs/mdx";
import { collector } from './src/scripts/collector.js';

// https://astro.build/config
export default defineConfig({
  site: 'https://calder-rh.github.io/portfolio',
  redirects: {
    '/work/d16': '../links/d16-workshop'
  },
  // integrations: [mdx(), ],
  markdown: {
    remarkPlugins: [collector]
  }
});