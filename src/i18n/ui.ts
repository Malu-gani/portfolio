export const languages = { es: 'Español', en: 'English' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'es';

export type ClaveUI =
  | 'nav.inicio'
  | 'nav.qa'
  | 'nav.dev'
  | 'nav.sobre'
  | 'nav.stack'
  | 'nav.contacto'
  | 'nav.principal'
  | 'nav.abrir'
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
  | 'home.qa.ver'
  | 'home.dev.ver'
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
  | 'proyectos.titulo'
  | 'proyectos.bajada'
  | 'filtro.qa'
  | 'filtro.dev'
  | 'filtro.todos'
  | 'filtro.etiqueta'
  | 'card.qa'
  | 'card.dev'
  | 'caso.enProgreso'
  | 'caso.completo'
  | 'caso.verRepo'
  | 'caso.verDemo'
  | 'cv.descargar'
  | 'sobre.titulo'
  | 'sobre.resumen'
  | 'sobre.ver'
  | 'contacto.enlaces'
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
  'nav.stack': 'Stack',
  'nav.contacto': 'Contacto',
  'nav.principal': 'Navegación principal',
  'nav.abrir': 'Abrir menú',
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
  'home.qa.ver': 'Ver todos los casos de QA',
  'home.dev.ver': 'Ver todos los proyectos de desarrollo',
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
  'proyectos.titulo': 'Proyectos',
  'proyectos.bajada': 'Casos de QA y proyectos de desarrollo. Cada uno documenta el contexto, lo que hice y qué aprendí.',
  'filtro.qa': 'QA · Automation',
  'filtro.dev': 'Desarrollo',
  'filtro.todos': 'Todos',
  'filtro.etiqueta': 'Filtrar proyectos',
  'card.qa': 'QA',
  'card.dev': 'Desarrollo',
  'caso.enProgreso': 'En progreso',
  'caso.completo': 'Completo',
  'caso.verRepo': 'Ver repositorio',
  'caso.verDemo': 'Ver la app',
  'cv.descargar': 'Descargar CV',
  'sobre.titulo': 'Sobre mí',
  'sobre.resumen': 'Hoy trabajo en monitoreo de alarmas y dedico el resto del tiempo a QA. Aprendo construyendo: cada proyecto que hago termina documentado, con lo que salió bien y lo que no.',
  'sobre.ver': 'Leer el recorrido completo',
  'contacto.enlaces': 'Enlaces de contacto',
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
  'nav.stack': 'Stack',
  'nav.contacto': 'Contact',
  'nav.principal': 'Main navigation',
  'nav.abrir': 'Open menu',
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
  'home.qa.ver': 'See all QA cases',
  'home.dev.ver': 'See all development projects',
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
  'proyectos.titulo': 'Projects',
  'proyectos.bajada': 'QA cases and development projects. Each one documents the context, what I did, and what I learned.',
  'filtro.qa': 'QA · Automation',
  'filtro.dev': 'Development',
  'filtro.todos': 'All',
  'filtro.etiqueta': 'Filter projects',
  'card.qa': 'QA',
  'card.dev': 'Development',
  'caso.enProgreso': 'In progress',
  'caso.completo': 'Complete',
  'caso.verRepo': 'View repository',
  'caso.verDemo': 'View the app',
  'cv.descargar': 'Download CV',
  'sobre.titulo': 'About me',
  'sobre.resumen': 'I currently work in alarm monitoring and spend the rest of my time on QA. I learn by building: every project I take on ends up documented, including what worked and what did not.',
  'sobre.ver': 'Read the full story',
  'contacto.enlaces': 'Contact links',
  'contacto.copiar': 'Copy email',
  'contacto.copiado': 'Copied',
  'contacto.errorCopiar': "Couldn't copy. Copy it manually.",
  'ejemplo.aviso': 'Sample content — pending replacement.',
} as const satisfies Diccionario;

export const ui = { es, en };
