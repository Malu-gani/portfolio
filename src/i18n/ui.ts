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
  | 'idioma.cambiar'
  | 'home.rol'
  | 'home.disponible'
  | 'home.posicionamiento'
  | 'home.qa.titulo'
  | 'home.dev.titulo'
  | 'home.dev.bajada'
  | 'home.stack'
  | 'qa.titulo'
  | 'dev.titulo'
  | 'caso.enProgreso'
  | 'caso.completo'
  | 'caso.verRepo'
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
  'idioma.cambiar': 'Ver en inglés',
  'home.rol': 'QA Engineer · Manual & Automation',
  'home.disponible': 'Disponible para trabajar',
  'home.posicionamiento': 'Testing manual y automatización con Playwright. Busco mi primer puesto full-time en QA.',
  'home.qa.titulo': 'Trabajo en QA',
  'home.dev.titulo': 'También escribo código',
  'home.dev.bajada': 'Escribo código, y eso me hace mejor testeando.',
  'home.stack': 'Stack',
  'qa.titulo': 'Casos de QA',
  'dev.titulo': 'Proyectos de desarrollo',
  'caso.enProgreso': 'En progreso',
  'caso.completo': 'Completo',
  'caso.verRepo': 'Ver repositorio',
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
  'idioma.cambiar': 'View in Spanish',
  'home.rol': 'QA Engineer · Manual & Automation',
  'home.disponible': 'Available for hire',
  'home.posicionamiento': 'Manual testing and automation with Playwright. Looking for my first full-time QA role.',
  'home.qa.titulo': 'QA work',
  'home.dev.titulo': 'I also write code',
  'home.dev.bajada': 'I write code, and that makes me a better tester.',
  'home.stack': 'Stack',
  'qa.titulo': 'QA case studies',
  'dev.titulo': 'Development projects',
  'caso.enProgreso': 'In progress',
  'caso.completo': 'Complete',
  'caso.verRepo': 'View repository',
  'cv.descargar': 'Download CV',
  'contacto.copiar': 'Copy email',
  'contacto.copiado': 'Copied',
  'contacto.errorCopiar': "Couldn't copy. Copy it manually.",
  'ejemplo.aviso': 'Sample content — pending replacement.',
} as const satisfies Diccionario;

export const ui = { es, en };
