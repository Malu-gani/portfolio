import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://portfolio-lovat-five-65.vercel.app',
  output: 'static',
  integrations: [react(), sitemap(), mdx()],
  redirects: {
    '/es/qa': '/es/proyectos',
    '/es/dev': '/es/proyectos/dev',
    '/en/qa': '/en/projects',
    '/en/dev': '/en/projects/dev',
  },
  vite: { plugins: [tailwindcss()] },
});
