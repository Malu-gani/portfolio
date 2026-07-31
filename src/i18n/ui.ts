export const languages = { es: 'Español', en: 'English' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'es';

export type ClaveUI =
  | 'nav.inicio'
  | 'nav.qa'
  | 'nav.dev'
  | 'nav.sobre'
  | 'nav.contacto'
  | 'nav.principal'
  | 'tema.cambiar'
  | 'tema.claro'
  | 'tema.oscuro'
  | 'idioma.cambiar'
  | 'home.rol'
  | 'home.disponible'
  | 'home.posicionamiento'
  | 'home.qa.titulo'
  | 'home.dev.titulo'
  | 'home.dev.bajada'
  | 'home.stack'
  | 'stack.lenguajes'
  | 'stack.testing'
  | 'stack.frameworks'
  | 'stack.datos'
  | 'stack.herramientas'
  | 'stack.nivel.avanzado'
  | 'stack.nivel.intermedio'
  | 'stack.nivel.aprendiendo'
  | 'qa.titulo'
  | 'dev.titulo'
  | 'card.qa'
  | 'card.dev'
  | 'caso.enProgreso'
  | 'caso.completo'
  | 'caso.verRepo'
  | 'caso.verDemo'
  | 'cv.descargar'
  | 'contacto.copiar'
  | 'contacto.copiado'
  | 'contacto.errorCopiar'
  | 'ejemplo.aviso';

type Diccionario = Record<ClaveUI, string>;

const es = {
  'nav.inicio': 'Inicio',
  'nav.qa': 'QA',
  'nav.dev': 'Desarrollo',
  'nav.sobre': 'Sobre mí',
  'nav.contacto': 'Contacto',
  'nav.principal': 'Navegación principal',
  'tema.cambiar': 'Cambiar tema',
  'tema.claro': 'Claro',
  'tema.oscuro': 'Oscuro',
  'idioma.cambiar': 'Ver en inglés',
  'home.rol': 'QA Engineer · Manual & Automation',
  'home.disponible': 'Disponible para trabajar',
  'home.posicionamiento': 'Testing manual y automatización con Playwright. Busco mi primer puesto full-time en QA.',
  'home.qa.titulo': 'Trabajo en QA',
  'home.dev.titulo': 'También escribo código',
  'home.dev.bajada': 'Escribo código, y eso me hace mejor testeando.',
  'home.stack': 'Stack',
  'stack.lenguajes': 'Lenguajes',
  'stack.testing': 'Testing y automatización',
  'stack.frameworks': 'Frameworks y librerías',
  'stack.datos': 'Bases de datos',
  'stack.herramientas': 'Herramientas y plataformas',
  'stack.nivel.avanzado': 'Avanzado',
  'stack.nivel.intermedio': 'Intermedio',
  'stack.nivel.aprendiendo': 'Aprendiendo',
  'qa.titulo': 'Casos de QA',
  'dev.titulo': 'Proyectos de desarrollo',
  'card.qa': 'QA',
  'card.dev': 'Desarrollo',
  'caso.enProgreso': 'En progreso',
  'caso.completo': 'Completo',
  'caso.verRepo': 'Ver repositorio',
  'caso.verDemo': 'Ver la app',
  'cv.descargar': 'Descargar CV',
  'contacto.copiar': 'Copiar email',
  'contacto.copiado': 'Copiado',
  'contacto.errorCopiar': 'No se pudo copiar. Copialo a mano.',
  'ejemplo.aviso': 'Contenido de ejemplo — pendiente de reemplazo.',
} as const satisfies Diccionario;

const en = {
  'nav.inicio': 'Home',
  'nav.qa': 'QA',
  'nav.dev': 'Development',
  'nav.sobre': 'About',
  'nav.contacto': 'Contact',
  'nav.principal': 'Main navigation',
  'tema.cambiar': 'Toggle theme',
  'tema.claro': 'Light',
  'tema.oscuro': 'Dark',
  'idioma.cambiar': 'View in Spanish',
  'home.rol': 'QA Engineer · Manual & Automation',
  'home.disponible': 'Available for hire',
  'home.posicionamiento': 'Manual testing and automation with Playwright. Looking for my first full-time QA role.',
  'home.qa.titulo': 'QA work',
  'home.dev.titulo': 'I also write code',
  'home.dev.bajada': 'I write code, and that makes me a better tester.',
  'home.stack': 'Stack',
  'stack.lenguajes': 'Languages',
  'stack.testing': 'Testing & automation',
  'stack.frameworks': 'Frameworks & libraries',
  'stack.datos': 'Databases',
  'stack.herramientas': 'Tools & platforms',
  'stack.nivel.avanzado': 'Advanced',
  'stack.nivel.intermedio': 'Intermediate',
  'stack.nivel.aprendiendo': 'Learning',
  'qa.titulo': 'QA case studies',
  'dev.titulo': 'Development projects',
  'card.qa': 'QA',
  'card.dev': 'Development',
  'caso.enProgreso': 'In progress',
  'caso.completo': 'Complete',
  'caso.verRepo': 'View repository',
  'caso.verDemo': 'View the app',
  'cv.descargar': 'Download CV',
  'contacto.copiar': 'Copy email',
  'contacto.copiado': 'Copied',
  'contacto.errorCopiar': "Couldn't copy. Copy it manually.",
  'ejemplo.aviso': 'Sample content — pending replacement.',
} as const satisfies Diccionario;

export const ui = { es, en };
