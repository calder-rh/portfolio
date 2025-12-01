import { defineConfig } from 'astro/config';

// import mdx from "@astrojs/mdx";
import { collector } from './src/scripts/collector.js';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://calder-rh.github.io/portfolio',

  redirects: {
    '/mas-portfolio': '/work/?unlisted-tag=mas-portfolio&tag=mas-portfolio',
    '/itp-portfolio': '/work/?unlisted-tag=itp-portfolio&tag=itp-portfolio'
  },

  // integrations: [mdx(), ],
  markdown: {
    remarkPlugins: [collector]
  },
  

  integrations: [mdx({
    smartypants: false,
  }),],
});