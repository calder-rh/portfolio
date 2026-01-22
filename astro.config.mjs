import { defineConfig } from 'astro/config';

// import mdx from "@astrojs/mdx";
import { collector } from './src/scripts/collector.js';

import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://calder-rh.github.io/portfolio',

  redirects: {
    '/mas-portfolio': '/?unlisted-tag=mas-portfolio&tag=mas-portfolio',
    '/itp-portfolio': '/?unlisted-tag=itp-portfolio&tag=itp-portfolio'
  },

  markdown: {
    remarkPlugins: [collector]
  },

  integrations: [mdx({
    smartypants: false,
  }),],
});