import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const tags = z.enum([
  'manual', 'automation', 'e2e', 'api', 'exploratorio',
  'regresion', 'accesibilidad', 'performance', 'mobile',
]);

const casosQa = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/casos-qa' }),
  schema: z.object({
    titulo: z.string().min(1),
    resumen: z.string().min(20).max(200),
    tags: z.array(tags).min(1),
    stack: z.array(z.string()).min(1),
    fecha: z.coerce.date(),
    destacado: z.boolean().default(false),
    estado: z.enum(['completo', 'en-progreso']),
    ejemplo: z.boolean().default(false),
    repo: z.url().optional(),
    demo: z.url().optional(),
  }),
});

const proyectos = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/proyectos' }),
  schema: z.object({
    titulo: z.string().min(1),
    resumen: z.string().min(20).max(200),
    stack: z.array(z.string()).min(1),
    fecha: z.coerce.date(),
    destacado: z.boolean().default(false),
    ejemplo: z.boolean().default(false),
    repo: z.url().optional(),
    demo: z.url().optional(),
  }),
});

export const collections = { 'casos-qa': casosQa, proyectos };
