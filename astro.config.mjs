import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://calder-rh.github.io',
  redirects: {
    '/work/d16': '/links/d16-workshop'
  }
});
