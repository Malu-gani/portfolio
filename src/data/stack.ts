/**
 * El stack vive acá y no dentro de `StackGrid.astro` para que se pueda
 * verificar desde un test unitario que ninguna tecnología quede sin categoría
 * o con un nivel inválido. Antes estaba hardcodeado en el componente y no
 * había forma de afirmarlo.
 *
 * El nivel es una declaración sobre la evidencia disponible, no una
 * autoevaluación de habilidad:
 *   avanzado    — proyecto real, defendible en una entrevista técnica
 *   intermedio  — uso puntual o proyectos más chicos
 *   aprendiendo — en estudio
 */

export type Categoria = 'lenguajes' | 'testing' | 'frameworks' | 'datos' | 'herramientas';
export type Nivel = 'avanzado' | 'intermedio' | 'aprendiendo';

export interface Tecnologia {
  nombre: string;
  categoria: Categoria;
  nivel: Nivel;
}

/** Orden de aparición de las categorías en la grilla. */
export const ordenCategorias: Categoria[] = [
  'lenguajes',
  'testing',
  'frameworks',
  'datos',
  'herramientas',
];

export const stack: Tecnologia[] = [
  { nombre: 'JavaScript', categoria: 'lenguajes', nivel: 'avanzado' },
  { nombre: 'TypeScript', categoria: 'lenguajes', nivel: 'avanzado' },
  { nombre: 'SQL', categoria: 'lenguajes', nivel: 'avanzado' },
  { nombre: 'HTML', categoria: 'lenguajes', nivel: 'avanzado' },
  { nombre: 'CSS', categoria: 'lenguajes', nivel: 'avanzado' },
  { nombre: 'Python', categoria: 'lenguajes', nivel: 'intermedio' },
  { nombre: 'PHP', categoria: 'lenguajes', nivel: 'intermedio' },

  { nombre: 'Playwright', categoria: 'testing', nivel: 'avanzado' },
  { nombre: 'Vitest', categoria: 'testing', nivel: 'avanzado' },
  { nombre: 'Testing Library', categoria: 'testing', nivel: 'avanzado' },
  { nombre: 'pytest', categoria: 'testing', nivel: 'intermedio' },
  { nombre: 'Postman', categoria: 'testing', nivel: 'intermedio' },
  { nombre: 'axe-core', categoria: 'testing', nivel: 'intermedio' },
  { nombre: 'Lighthouse CI', categoria: 'testing', nivel: 'intermedio' },
  // Newman está en 'aprendiendo' y no en 'intermedio' a propósito: hay un
  // video visto y una colección lista para correr (TRELLOW), pero nunca se
  // ejecutó en un pipeline. Cuando eso pase, sube de nivel.
  { nombre: 'Newman', categoria: 'testing', nivel: 'aprendiendo' },
  { nombre: 'REST Assured', categoria: 'testing', nivel: 'aprendiendo' },

  { nombre: 'React', categoria: 'frameworks', nivel: 'avanzado' },
  { nombre: 'Next.js', categoria: 'frameworks', nivel: 'avanzado' },
  { nombre: 'Astro', categoria: 'frameworks', nivel: 'avanzado' },
  { nombre: 'Tailwind CSS', categoria: 'frameworks', nivel: 'avanzado' },
  { nombre: 'Bootstrap', categoria: 'frameworks', nivel: 'intermedio' },
  { nombre: 'jQuery', categoria: 'frameworks', nivel: 'intermedio' },

  { nombre: 'PostgreSQL', categoria: 'datos', nivel: 'avanzado' },
  { nombre: 'Supabase', categoria: 'datos', nivel: 'avanzado' },

  { nombre: 'Git', categoria: 'herramientas', nivel: 'avanzado' },
  { nombre: 'GitHub Actions', categoria: 'herramientas', nivel: 'avanzado' },
  { nombre: 'Vercel', categoria: 'herramientas', nivel: 'avanzado' },
  { nombre: 'Docker', categoria: 'herramientas', nivel: 'intermedio' },
  { nombre: 'ESLint', categoria: 'herramientas', nivel: 'intermedio' },
  // Jira y Zephyr Scale van juntos y en avanzado: los casos de
  // `python-qa-automation` se diseñaron dentro de Zephyr Scale antes de
  // automatizarse, no es solo la convención de nombres copiada.
  { nombre: 'Jira', categoria: 'herramientas', nivel: 'avanzado' },
  { nombre: 'Zephyr Scale', categoria: 'herramientas', nivel: 'avanzado' },
  { nombre: 'Trello', categoria: 'herramientas', nivel: 'intermedio' },
  { nombre: 'Notion', categoria: 'herramientas', nivel: 'intermedio' },
];
