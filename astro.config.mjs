import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://portfolio.vercel.app',
  output: 'static',
  integrations: [react(), sitemap(), mdx()],
  vite: { plugins: [tailwindcss()] },
});
