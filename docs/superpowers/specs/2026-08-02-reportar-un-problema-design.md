# Sección "Reportar un problema"

Fecha: 2026-08-02

## Qué se construye

Una sección al cierre de la home que invita al visitante a reportar defectos
del propio sitio, y que en el mismo movimiento muestra qué se considera un
buen reporte.

El sitio ya se ofrece como caso QA — "el sitio que estás mirando está testeado
por mí, el código es público". Esta sección lleva esa afirmación un paso más:
pasa de exhibir la suite a invitar al escrutinio ajeno. Es una apuesta que solo
se puede hacer teniendo con qué respaldarla, y hoy se tiene: 870 pruebas E2E en
cuatro navegadores, `axe-core` y Lighthouse en integración continua.

## Decisiones tomadas, con su razón

**El reporte va a GitHub Issues, no a un formulario.** El proyecto ya decidió
por escrito no tener formulario de contacto: en un sitio estático exige un
servicio externo, puede fallar en silencio y suma superficie de spam. Los
Issues no agregan ninguna dependencia, y además dejan un artefacto público —
alguien puede entrar al repo y ver reportes reales triados. Esa trazabilidad es
la mitad del valor de la sección.

**La plantilla no se precarga con datos del visitante.** Se evaluó completar
navegador, viewport, URL y tema automáticamente en la URL del Issue. Se
descartó: son datos del visitante viajando en una URL para ahorrarle tres
renglones. La plantilla se abre vacía y la completa la persona.

**Doble salida: GitHub y portapapeles.** El botón primario abre el Issue; el
secundario copia la plantilla para quien no tiene cuenta de GitHub y prefiere
mandarla por mail o LinkedIn. La sección está escrita para dos audiencias a la
vez —quien la lee como señal y quien la usa de verdad— y ninguna de las dos
puede quedar sin camino.

**La plantilla se muestra, no se describe.** Va escrita en un bloque visible en
la página. Quien solo lee ya se lleva la señal sin tocar nada, y el botón de
copiar no copia algo invisible: copia exactamente lo que está a la vista. Es
también lo que hace que la sección degrade sin JavaScript sin ningún trabajo
extra.

**El acceso en el navbar es un ícono en desktop y texto en mobile.** Al revés
de lo que sugiere la intuición: en mobile el navbar ya es un panel `<details>`
en vertical, donde un ítem más no cuesta nada; la fila que se aprieta es la de
desktop. Poniendo el ícono en el grupo de la derecha, junto a idioma y tema, el
acceso deja de ser hermano de "Proyectos" —con el que no debe competir— y pasa
a leerse como lo que es: una acción, no un destino del recorrido.

**El ícono es un SVG inline, no una librería.** La regla del proyecto exige
justificar por escrito toda dependencia nueva. Un `<path>` no la justifica.

## Arquitectura

### Componentes nuevos

- `src/components/Reportar.astro` — la sección. Recibe `lang`, como el resto.
- `src/components/IconoBug.astro` — el SVG inline, para que el header y el panel
  mobile dibujen el mismo trazo sin copiarlo.

### Componentes que se tocan

- `src/components/HomeContent.astro` — monta la sección al cierre, con la clase
  `revelar` y `scroll-mt-24`, igual que las demás.
- `src/components/Header.astro` — agrega el enlace-ícono al `<div class="flex
  gap-2">` de la derecha. Lleva `data-seccion="reportar"`, y con eso el
  scroll-spy lo marca sin tocar el script: la consulta es `a[data-seccion]`
  global, no está atada a la lista de secciones.
- `src/components/NavMobile.astro` — agrega el ítem de texto al final del panel,
  separado del resto por una línea.
- `src/components/Footer.astro` — suma la sección a sus enlaces.
- `src/i18n/ui.ts` — claves nuevas en los dos idiomas.

### Deuda que se salda de paso

Copiar al portapapeles quedaría en tres lugares: el island `CopyEmail`, el
`ContactoInline` del hero y esta sección. Tres implementaciones de lo mismo es
donde nacen las diferencias de comportamiento que nadie decidió.

Se extrae la lógica vanilla a `src/scripts/copiar.ts`, usada por el hero y por
esta sección. El island de React queda como está: es otro modelo de ejecución y
forzarlo a compartir código con un script suelto complica las dos puntas sin
beneficio.

### Plantillas de Issue

`.github/ISSUE_TEMPLATE/bug-es.yml` y `.github/ISSUE_TEMPLATE/bug-en.yml`.
GitHub no tiene i18n en las plantillas, así que van dos archivos con los mismos
campos. Cada idioma del sitio enlaza directo al suyo con
`?template=bug-es.yml`, de modo que nadie pasa por el selector.

Campos: qué pasó, pasos para reproducir, qué esperabas, navegador y sistema,
tamaño de pantalla. La elección de qué **no** se pide —severidad, prioridad,
capturas obligatorias— es tan legible como la de qué sí, y es parte de lo que
la sección exhibe.

## Flujo

1. El visitante llega a la sección y lee la plantilla, que está a la vista.
2. Si tiene cuenta de GitHub: click en "Reportar en GitHub" → se abre un Issue
   nuevo con la plantilla de su idioma, vacía.
3. Si no: click en "Copiar la plantilla" → la plantilla queda en el
   portapapeles y la manda por donde quiera.
4. Sin JavaScript: el botón de GitHub funciona igual, y la plantilla se
   selecciona a mano del bloque visible.

## Manejo de errores

- **Sin JavaScript.** El enlace a GitHub es un `<a href>` normal. El botón de
  copiar no puede funcionar, pero no esconde nada: la plantilla ya está en la
  página.
- **Portapapeles ausente o rechazado.** Avisa. No dice "copiado" cuando no
  copió — mentir sobre el resultado es peor que no copiar, y es la misma regla
  que rige el atajo de email del hero.

## Testing

- El enlace apunta a la plantilla del idioma correcto, en ES y en EN.
- El acceso del navbar tiene nombre accesible **en desktop y en mobile**. No es
  un test de trámite: el toggle de tema se quedó sin nombre accesible en
  pantallas chicas y hubo que arreglarlo (commit `531d8dc`). Es la trampa
  propia de este patrón y entra cubierta desde el principio.
- La plantilla sigue visible con `javaScriptEnabled: false`.
- Copiar copia, y el fallo del portapapeles avisa en vez de fingir.
- `axe-core` sobre la sección.
- El scroll-spy marca el acceso al llegar a la sección.
- Se regenera la captura visual de `/es/`, que cambia.

**Qué no se prueba, y por qué.** Que el Issue se cree de verdad en GitHub. Eso
es probar GitHub, y ensuciaría el repo con issues de test en cada corrida.

Nota sobre la captura visual: el umbral de `maxDiffPixelRatio` es 0.002 sobre
captura de página completa. En la home, que es alta, eso tolera bastantes más
píxeles de los que el comentario del test sugiere — se comprobó al centrar la
bajada de Sobre mí, que pasó sin marcar diferencia. No es alcance de este
trabajo, pero conviene tenerlo presente al confiar en esa captura como gate.

## Fuera de alcance

- Precargar contexto del visitante en la URL del Issue.
- Cualquier servicio externo de formularios.
- Crear Issues desde el sitio por API.
- Mostrar en la página los Issues ya reportados. Es atractivo, pero exige
  llamar a la API de GitHub en build y ata la compilación a un servicio
  externo. Si más adelante se quiere, va en su propio tramo.
