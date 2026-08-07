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
  | 'home.verProyectos'
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
  | 'formacion.bootcamp.descripcion'
  | 'formacion.istqb.titulo'
  | 'formacion.istqb.institucion'
  | 'formacion.istqb.detalle'
  | 'formacion.istqb.descripcion'
  | 'formacion.utn.titulo'
  | 'formacion.utn.institucion'
  | 'formacion.utn.detalle'
  | 'formacion.utn.descripcion'
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
  | 'volverArriba.aria'
  | 'qaBoard.titulo'
  | 'qaBoard.bajada'
  | 'qaBoard.kpi.bugsReportados'
  | 'qaBoard.kpi.bugsResueltosPct'
  | 'qaBoard.kpi.usResueltas'
  | 'qaBoard.kpi.enProgreso'
  | 'qaBoard.filtro.etiqueta'
  | 'qaBoard.filtro.todos'
  | 'qaBoard.filtro.bug'
  | 'qaBoard.filtro.us'
  | 'qaBoard.cta.bugs'
  | 'qaBoard.cta.tareas';

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
  'home.posicionamiento': 'Manual, automatizado y API testing — Playwright, Postman. Construyo suites de pruebas en todos mis proyectos, con criterio sobre qué automatizar y qué no. Busco mi primer puesto full-time en QA.',
  'home.verProyectos': 'Ver proyectos',
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
  'sobre.resumen': 'Aprendo construyendo: cada proyecto que hago termina con su propia suite de pruebas documentada, con lo que salió bien y lo que no. Hoy trabajo en monitoreo de alarmas y dedico el resto del tiempo a QA — manual, automatizado y testing de API.',
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
  'formacion.bootcamp.descripcion': 'Fundamentos de testing manual y automatizado: diseño de casos, Agile/Scrum, API testing con Postman, y nociones de Selenium, JMeter y SQL.',
  'formacion.istqb.titulo': 'ISTQB Foundation Level V4.0',
  'formacion.istqb.institucion': 'Tarek Roshdy · Nezam Academy',
  'formacion.istqb.detalle': '35 h 50 min · 340 lecciones',
  'formacion.istqb.descripcion': 'Fundamentos de testing según el estándar ISTQB: ciclo de vida, técnicas de diseño de casos, tipos de prueba.',
  'formacion.utn.titulo': 'Experto Universitario en Mercado de Capitales',
  'formacion.utn.institucion': 'UTN FRBA',
  'formacion.utn.detalle': '165 horas · 22 unidades · 2022',
  'formacion.utn.descripcion': 'Operar en bolsa y administrar carteras: acciones, bonos, opciones, monedas, commodities y ETFs, con análisis fundamental y técnico.',
  'formacion.ingles.titulo': 'Inglés',
  'formacion.ingles.institucion': 'Autodidacta',
  'formacion.ingles.detalle': 'Lectura técnica y documentación',
  'formacion.estado.completado': 'Completado',
  'formacion.estado.examenPendiente': 'Syllabus V4.0 completo · examen pendiente',
  'formacion.estado.sinCompletar': 'Cursado',
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
  'qaBoard.titulo': 'Tablero QA y Backlog en Vivo',
  'qaBoard.bajada': 'Métricas y actividad reciente de mi propio proceso de gestión de calidad (ISTQB v4.0) — actualizado en cada despliegue, con acceso directo al tablero real en Notion.',
  'qaBoard.kpi.bugsReportados': 'Bugs reportados',
  'qaBoard.kpi.bugsResueltosPct': '% de bugs resueltos',
  'qaBoard.kpi.usResueltas': 'User Stories resueltas',
  'qaBoard.kpi.enProgreso': 'Ítems en progreso',
  'qaBoard.filtro.etiqueta': 'Filtrar actividad reciente',
  'qaBoard.filtro.todos': 'Todos',
  'qaBoard.filtro.bug': 'Bugs',
  'qaBoard.filtro.us': 'User Stories',
  'qaBoard.cta.bugs': 'Ver Bug Reports en Notion',
  'qaBoard.cta.tareas': 'Ver Tareas y US en Notion',
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
  'home.posicionamiento': 'Manual, automated, and API testing — Playwright, Postman. I build test suites for every project I take on, with judgment on what to automate and what not to. Looking for my first full-time QA role.',
  'home.verProyectos': 'See projects',
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
  'sobre.resumen': 'I learn by building: every project I take on ends up with its own documented test suite, including what worked and what did not. I currently work in alarm monitoring and spend the rest of my time on QA — manual, automation, and API testing.',
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
  'formacion.bootcamp.descripcion': 'Manual and automated testing fundamentals: test case design, Agile/Scrum, API testing with Postman, and basics of Selenium, JMeter and SQL.',
  'formacion.istqb.titulo': 'ISTQB Foundation Level V4.0',
  'formacion.istqb.institucion': 'Tarek Roshdy · Nezam Academy',
  'formacion.istqb.detalle': '35 h 50 min · 340 lessons',
  'formacion.istqb.descripcion': 'Testing fundamentals per the ISTQB standard: software lifecycle, test design techniques, test types.',
  'formacion.utn.titulo': 'University Expert in Capital Markets',
  'formacion.utn.institucion': 'UTN FRBA',
  'formacion.utn.detalle': '165 hours · 22 units · 2022',
  'formacion.utn.descripcion': 'Trading and portfolio management: stocks, bonds, options, currencies, commodities and ETFs, with fundamental and technical analysis.',
  'formacion.ingles.titulo': 'English',
  'formacion.ingles.institucion': 'Self-taught',
  'formacion.ingles.detalle': 'Technical reading and documentation',
  'formacion.estado.completado': 'Completed',
  'formacion.estado.examenPendiente': 'Syllabus V4.0 complete · exam pending',
  'formacion.estado.sinCompletar': 'Attended',
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
  'qaBoard.titulo': 'QA Board & Backlog Live',
  'qaBoard.bajada': 'Metrics and recent activity from my own quality-management process (ISTQB v4.0) — updated on every deploy, with a direct link to the real board on Notion.',
  'qaBoard.kpi.bugsReportados': 'Bugs reported',
  'qaBoard.kpi.bugsResueltosPct': '% bugs resolved',
  'qaBoard.kpi.usResueltas': 'User Stories resolved',
  'qaBoard.kpi.enProgreso': 'Items in progress',
  'qaBoard.filtro.etiqueta': 'Filter recent activity',
  'qaBoard.filtro.todos': 'All',
  'qaBoard.filtro.bug': 'Bugs',
  'qaBoard.filtro.us': 'User Stories',
  'qaBoard.cta.bugs': 'View Bug Reports on Notion',
  'qaBoard.cta.tareas': 'View Tasks & US on Notion',
} as const satisfies Diccionario;

export const ui = { es, en };
