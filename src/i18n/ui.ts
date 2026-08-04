export const languages = { es: 'Español', en: 'English' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'es';

export type ClaveUI =
  | 'nav.inicio'
  | 'nav.proyectos'
  | 'nav.sobre'
  | 'nav.stack'
  | 'nav.contacto'
  | 'nav.principal'
  | 'tema.cambiar'
  | 'tema.claro'
  | 'tema.oscuro'
  | 'idioma.cambiar'
  | 'home.rol'
  | 'home.disponible'
  | 'home.posicionamiento'
  | 'home.fotoAlt'
  | 'home.stack'
  | 'stack.qaTesting'
  | 'stack.desarrolloDatos'
  | 'stack.devopsHerramientas'
  | 'stack.nivel.avanzado'
  | 'stack.nivel.intermedio'
  | 'stack.nivel.aprendiendo'
  | 'stack.filtro.etiqueta'
  | 'stack.filtro.todos'
  | 'stack.filtro.avanzado'
  | 'stack.filtro.intermedio'
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
  | 'ejemplo.aviso'
  | 'nav.formacion'
  | 'formacion.titulo'
  | 'formacion.bajada'
  | 'formacion.bootcamp.titulo'
  | 'formacion.bootcamp.institucion'
  | 'formacion.bootcamp.detalle'
  | 'formacion.istqb.titulo'
  | 'formacion.istqb.institucion'
  | 'formacion.istqb.detalle'
  | 'formacion.utn.titulo'
  | 'formacion.utn.institucion'
  | 'formacion.utn.detalle'
  | 'formacion.ingles.titulo'
  | 'formacion.ingles.institucion'
  | 'formacion.ingles.detalle'
  | 'formacion.estado.completado'
  | 'formacion.estado.examenPendiente'
  | 'formacion.estado.sinCompletar'
  | 'formacion.estado.intermedio'
  | 'nav.reportar'
  | 'reportar.abrir'
  | 'reportar.titulo'
  | 'reportar.bajada'
  | 'reportar.plantillaTitulo'
  | 'reportar.enGithub'
  | 'reportar.copiar'
  | 'reportar.copiado'
  | 'reportar.errorCopiar'
  | 'reportar.despues'
  | 'footer.volverArriba'
  | 'volverArriba.aria';

type Diccionario = Record<ClaveUI, string>;

const es = {
  'nav.inicio': 'Inicio',
  'nav.proyectos': 'Projects',
  'nav.sobre': 'Sobre mí',
  'nav.stack': 'Stack',
  'nav.contacto': 'Contacto',
  'nav.principal': 'Navegación principal',
  'tema.cambiar': 'Cambiar tema',
  'tema.claro': 'Claro',
  'tema.oscuro': 'Oscuro',
  'idioma.cambiar': 'Ver en inglés',
  'home.rol': 'QA Engineer · Manual & Automation',
  'home.disponible': 'Disponible para trabajar',
  'home.posicionamiento': 'Testing manual y automatización con Playwright. Busco mi primer puesto full-time en QA.',
  'home.fotoAlt': 'Retrato de Juan Manuel Malugani',
  'home.stack': 'Stack',
  'stack.qaTesting': 'QA & Testing Automation',
  'stack.desarrolloDatos': 'Desarrollo & Bases de Datos',
  'stack.devopsHerramientas': 'DevOps & Herramientas',
  'stack.nivel.avanzado': 'Avanzado',
  'stack.nivel.intermedio': 'Intermedio',
  'stack.nivel.aprendiendo': 'Aprendiendo',
  'stack.filtro.etiqueta': 'Filtrar por nivel',
  'stack.filtro.todos': 'Todos',
  'stack.filtro.avanzado': 'Avanzado',
  'stack.filtro.intermedio': 'Intermedio',
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
  'nav.formacion': 'Formación',
  'formacion.titulo': 'Formación',
  'formacion.bajada': 'Dónde aprendí lo que aplico, y qué terminé de cada cosa.',
  'formacion.bootcamp.titulo': 'The Complete 2026 Software Testing Bootcamp',
  'formacion.bootcamp.institucion': 'Tarek Roshdy · Nezam Academy',
  'formacion.bootcamp.detalle': '43,5 horas · 372 lecciones',
  'formacion.istqb.titulo': 'ISTQB Foundation Level V4.0',
  'formacion.istqb.institucion': 'Tarek Roshdy · Nezam Academy',
  'formacion.istqb.detalle': '35 h 50 min · 340 lecciones',
  'formacion.utn.titulo': 'Operador de Mercados Financieros',
  'formacion.utn.institucion': 'UTN FRBA',
  'formacion.utn.detalle': '94 horas · 12 unidades · 2022',
  'formacion.ingles.titulo': 'Inglés',
  'formacion.ingles.institucion': 'Autodidacta',
  'formacion.ingles.detalle': 'Lectura técnica y documentación',
  'formacion.estado.completado': 'Completado',
  'formacion.estado.examenPendiente': 'Curso completo · examen pendiente',
  'formacion.estado.sinCompletar': 'Cursado sin completar',
  'formacion.estado.intermedio': 'Intermedio',
  'nav.reportar': 'Reportar',
  'reportar.abrir': 'Reportar un problema del sitio',
  'reportar.titulo': 'Reportar un problema',
  'reportar.bajada': 'Este sitio es mi propio objeto de prueba. Si encontraste algo que no funciona como debería, contámelo: es la clase de ayuda que más agradezco.',
  'reportar.plantillaTitulo': 'Así pido un reporte',
  'reportar.enGithub': 'Reportar en GitHub',
  'reportar.copiar': 'Copiar la plantilla',
  'reportar.copiado': 'Plantilla copiada',
  'reportar.errorCopiar': 'No se pudo copiar. Seleccionala a mano.',
  'reportar.despues': 'Leo todo lo que llega. Lo que sea un defecto real se arregla; lo que no, te explico por qué.',
  'footer.volverArriba': 'Volver arriba ↑',
  'volverArriba.aria': 'Volver arriba',
} as const satisfies Diccionario;

const en = {
  'nav.inicio': 'Home',
  'nav.proyectos': 'Projects',
  'nav.sobre': 'About',
  'nav.stack': 'Stack',
  'nav.contacto': 'Contact',
  'nav.principal': 'Main navigation',
  'tema.cambiar': 'Toggle theme',
  'tema.claro': 'Light',
  'tema.oscuro': 'Dark',
  'idioma.cambiar': 'View in Spanish',
  'home.rol': 'QA Engineer · Manual & Automation',
  'home.disponible': 'Available for hire',
  'home.posicionamiento': 'Manual testing and automation with Playwright. Looking for my first full-time QA role.',
  'home.fotoAlt': 'Portrait of Juan Manuel Malugani',
  'home.stack': 'Stack',
  'stack.qaTesting': 'QA & Testing Automation',
  'stack.desarrolloDatos': 'Development & Databases',
  'stack.devopsHerramientas': 'DevOps & Tools',
  'stack.nivel.avanzado': 'Advanced',
  'stack.nivel.intermedio': 'Intermediate',
  'stack.nivel.aprendiendo': 'Learning',
  'stack.filtro.etiqueta': 'Filter by level',
  'stack.filtro.todos': 'All',
  'stack.filtro.avanzado': 'Advanced',
  'stack.filtro.intermedio': 'Intermediate',
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
  'nav.formacion': 'Training',
  'formacion.titulo': 'Training',
  'formacion.bajada': 'Where I learned what I apply, and what I actually finished.',
  'formacion.bootcamp.titulo': 'The Complete 2026 Software Testing Bootcamp',
  'formacion.bootcamp.institucion': 'Tarek Roshdy · Nezam Academy',
  'formacion.bootcamp.detalle': '43.5 hours · 372 lessons',
  'formacion.istqb.titulo': 'ISTQB Foundation Level V4.0',
  'formacion.istqb.institucion': 'Tarek Roshdy · Nezam Academy',
  'formacion.istqb.detalle': '35 h 50 min · 340 lessons',
  'formacion.utn.titulo': 'Financial Markets Operator',
  'formacion.utn.institucion': 'UTN FRBA',
  'formacion.utn.detalle': '94 hours · 12 units · 2022',
  'formacion.ingles.titulo': 'English',
  'formacion.ingles.institucion': 'Self-taught',
  'formacion.ingles.detalle': 'Technical reading and documentation',
  'formacion.estado.completado': 'Completed',
  'formacion.estado.examenPendiente': 'Course complete · exam pending',
  'formacion.estado.sinCompletar': 'Attended, not completed',
  'formacion.estado.intermedio': 'Intermediate',
  'nav.reportar': 'Report',
  'reportar.abrir': 'Report a problem with the site',
  'reportar.titulo': 'Report a problem',
  'reportar.bajada': "This site is my own test object. If you found something that doesn't work the way it should, tell me: it's the kind of help I appreciate most.",
  'reportar.plantillaTitulo': 'How I ask for a report',
  'reportar.enGithub': 'Report on GitHub',
  'reportar.copiar': 'Copy the template',
  'reportar.copiado': 'Template copied',
  'reportar.errorCopiar': "Couldn't copy. Select it manually.",
  'reportar.despues': "I read everything that comes in. Anything that's a real defect gets fixed; anything that isn't, I'll explain why.",
  'footer.volverArriba': 'Back to top ↑',
  'volverArriba.aria': 'Back to top',
} as const satisfies Diccionario;

export const ui = { es, en };
