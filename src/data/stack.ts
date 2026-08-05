/**
 * El stack vive acá y no dentro de `StackGrid.astro` para que se pueda
 * verificar desde un test unitario que ninguna tecnología quede sin categoría,
 * sin ícono o con un nivel inválido. Antes estaba hardcodeado en el
 * componente y no había forma de afirmarlo.
 *
 * El nivel es una declaración sobre la evidencia disponible, no una
 * autoevaluación de habilidad:
 *   avanzado    — proyecto real, defendible en una entrevista técnica
 *   intermedio  — uso puntual o proyectos más chicos
 *   aprendiendo — en estudio
 *
 * El orden dentro de cada categoría no es alfabético: lo primero que ve un
 * reclutador QA debería ser lo más fuerte y más relevante al rol (nivel
 * avanzado primero), salvo Python, que se sube junto a los lenguajes
 * principales a pedido explícito aunque esté en intermedio.
 */

export type Categoria = 'qa-testing' | 'desarrollo-datos' | 'devops-herramientas';
export type Nivel = 'avanzado' | 'intermedio' | 'aprendiendo';

export interface Tecnologia {
  nombre: string;
  categoria: Categoria;
  nivel: Nivel;
  /** Slug en `stack-iconos.ts`. */
  icono: string;
}

/** Orden de aparición de las categorías en la grilla. */
export const ordenCategorias: Categoria[] = [
  'qa-testing',
  'desarrollo-datos',
  'devops-herramientas',
];

export const stack: Tecnologia[] = [
  { nombre: 'Playwright', categoria: 'qa-testing', nivel: 'avanzado', icono: 'playwright' },
  { nombre: 'Jira', categoria: 'qa-testing', nivel: 'avanzado', icono: 'jira' },
  { nombre: 'Zephyr Scale', categoria: 'qa-testing', nivel: 'avanzado', icono: 'zephyr' },
  { nombre: 'Vitest', categoria: 'qa-testing', nivel: 'avanzado', icono: 'vitest' },
  { nombre: 'Testing Library', categoria: 'qa-testing', nivel: 'avanzado', icono: 'testinglibrary' },
  { nombre: 'pytest', categoria: 'qa-testing', nivel: 'intermedio', icono: 'pytest' },
  { nombre: 'Postman', categoria: 'qa-testing', nivel: 'intermedio', icono: 'postman' },
  { nombre: 'axe-core', categoria: 'qa-testing', nivel: 'intermedio', icono: 'axe' },
  { nombre: 'Lighthouse CI', categoria: 'qa-testing', nivel: 'intermedio', icono: 'lighthouse' },
  // Newman está en 'aprendiendo' y no en 'intermedio' a propósito: hay un
  // video visto y una colección lista para correr, pero nunca se ejecutó en
  // un pipeline. Cuando eso pase, sube de nivel.
  { nombre: 'Newman', categoria: 'qa-testing', nivel: 'aprendiendo', icono: 'newman' },
  { nombre: 'REST Assured', categoria: 'qa-testing', nivel: 'aprendiendo', icono: 'restassured' },

  { nombre: 'JavaScript', categoria: 'desarrollo-datos', nivel: 'avanzado', icono: 'javascript' },
  { nombre: 'TypeScript', categoria: 'desarrollo-datos', nivel: 'avanzado', icono: 'typescript' },
  { nombre: 'Python', categoria: 'desarrollo-datos', nivel: 'intermedio', icono: 'python' },
  { nombre: 'SQL', categoria: 'desarrollo-datos', nivel: 'avanzado', icono: 'postgresql' },
  { nombre: 'HTML', categoria: 'desarrollo-datos', nivel: 'avanzado', icono: 'html5' },
  { nombre: 'CSS', categoria: 'desarrollo-datos', nivel: 'avanzado', icono: 'css3' },
  { nombre: 'React', categoria: 'desarrollo-datos', nivel: 'avanzado', icono: 'react' },
  { nombre: 'Next.js', categoria: 'desarrollo-datos', nivel: 'avanzado', icono: 'nextdotjs' },
  { nombre: 'Astro', categoria: 'desarrollo-datos', nivel: 'avanzado', icono: 'astro' },
  { nombre: 'Tailwind CSS', categoria: 'desarrollo-datos', nivel: 'avanzado', icono: 'tailwindcss' },
  { nombre: 'PostgreSQL', categoria: 'desarrollo-datos', nivel: 'avanzado', icono: 'postgresql' },
  { nombre: 'Supabase', categoria: 'desarrollo-datos', nivel: 'avanzado', icono: 'supabase' },
  { nombre: 'PHP', categoria: 'desarrollo-datos', nivel: 'intermedio', icono: 'php' },
  { nombre: 'Bootstrap', categoria: 'desarrollo-datos', nivel: 'intermedio', icono: 'bootstrap' },
  { nombre: 'jQuery', categoria: 'desarrollo-datos', nivel: 'intermedio', icono: 'jquery' },

  { nombre: 'Git', categoria: 'devops-herramientas', nivel: 'avanzado', icono: 'git' },
  { nombre: 'GitHub Actions', categoria: 'devops-herramientas', nivel: 'avanzado', icono: 'githubactions' },
  { nombre: 'Vercel', categoria: 'devops-herramientas', nivel: 'avanzado', icono: 'vercel' },
  { nombre: 'Docker', categoria: 'devops-herramientas', nivel: 'intermedio', icono: 'docker' },
  { nombre: 'ESLint', categoria: 'devops-herramientas', nivel: 'intermedio', icono: 'eslint' },
  // Notion se queda por ahora: va a tener su propia sección más adelante
  // (entre Proyectos y Stack), con un widget del gestor y accesos a las
  // tablas — se decide el criterio completo cuando llegue ese tramo.
  { nombre: 'Notion', categoria: 'devops-herramientas', nivel: 'intermedio', icono: 'notion' },
];
