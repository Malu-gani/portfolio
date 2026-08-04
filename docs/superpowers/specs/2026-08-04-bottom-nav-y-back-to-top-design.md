# Bottom Nav Bar + Back to Top — diseño

Cubre `PORT-US-06`/`PORT-BUG-06` (Bottom Navigation Bar) y `PORT-US-03`/`PORT-BUG-03`
(botón flotante "Back to Top" + link en el Footer), gestionados en la Notion
de seguimiento del portfolio. Los dos se diseñaron juntos porque comparten el
mismo corte de viewport y se pisan si no se coordinan.

## Alcance y decisiones

- **Breakpoint único: 640px** (Tailwind `sm`), el mismo que ya usa el resto
  del sitio (`NavMobile`, navbar desktop). Las fichas de Notion pedían 768px;
  se descarta para no introducir un segundo corte responsive que no existe en
  ningún otro lado del sitio.
- **Sin React** en ninguno de los dos componentes. Las "sub-tareas sugeridas"
  de ambas historias fueron redactadas sin ver la arquitectura real del
  proyecto (mencionan `ScrollToTop.tsx`, propio de una app React que este
  portfolio no es) — se resuelven en Astro + vanilla, mismo patrón que el
  scroll-spy de `Header.astro` y `copiar.ts`.
- **Back to Top no aparece en mobile** (`<640px`): ahí ya está la Bottom Nav
  para volver a "Inicio" con el pulgar: un botón flotante encima sería
  redundante y competiría por el mismo rincón de pantalla.
- **`NavMobile.astro` se borra**, no se oculta condicionalmente: una vez que
  la Bottom Nav cubre `<640px` y el navbar desktop cubre `≥640px`, el drawer
  hamburguesa no tiene ningún rango de viewport que le quede por servir.
- **El ícono de "Reportar" pasa a estar siempre visible** en el header
  (hoy es `sm:flex`, oculto en mobile porque vivía como entrada del drawer).
  Sin el drawer, sacarle esa restricción es la única forma de no perder el
  acceso directo en mobile.

## Componentes

### `BottomNav.astro` (nuevo, reemplaza a `NavMobile.astro`)

- `<nav>` fijo (`position: fixed; bottom: 0; left: 0; right: 0; z-index: 50`),
  visible solo `<640px` (clase `sm:hidden`).
- Los 6 ítems que ya arma `Header.astro` en su array `secciones` (Inicio,
  Sobre mí, Proyectos, Stack, Formación, Contacto) — se le pasa el mismo
  array por prop, no se duplica.
- Cada ítem: SVG inline (`stroke="currentColor" stroke-width="2"`, mismo
  estilo que el ícono de hamburguesa que se retira) + texto reducido debajo.
  Área táctil mínima 44×44px.
- `overflow-x: auto`, `scroll-snap-type: x mandatory`,
  `scrollbar-width: none` (+ equivalente `-webkit` para ocultar el scrollbar).
- Cada link lleva `data-seccion={id}`, igual que los del navbar desktop. El
  scroll-spy existente en `Header.astro` selecciona genéricamente todo
  `a[data-seccion]`, así que resaltar el ítem activo no requiere tocar ese
  script.
- Se retira del script de `Header.astro` el bloque que cierra el `<details>`
  de `NavMobile` al hacer click (`querySelector('[data-testid="nav-mobile"]')`),
  porque ese elemento deja de existir.

### Back to Top

- Un `<a href="#inicio">` (o `${home}#inicio` fuera de la home) estilizado
  como botón flotante, esquina inferior derecha.
- Oculto por defecto; un script vanilla chico (mismo patrón que `copiar.ts`)
  agrega/saca una clase según `window.scrollY` (umbral 300px), con
  transición de opacidad en CSS para la aparición/desaparición.
- El scroll suave no necesita JS propio: `scroll-behavior: smooth` ya está
  seteado globalmente en `global.css` (con `prefers-reduced-motion` cayendo a
  `auto`), así que un link nativo a `#inicio` ya scrollea suave.
- Oculto en mobile (`hidden sm:flex`, mismo corte de 640px).
- `aria-label="Volver arriba"` para lectores de pantalla.

### Footer

- Se agrega un ítem "Volver arriba ↑" al array `secciones` de `Footer.astro`,
  apuntando a `#inicio` (o `${home}#inicio`). Visible en todos los viewports,
  no solo desktop — es la vía de respaldo también en mobile.

## Testing

- e2e: Bottom Nav visible/oculta según viewport; sus ítems navegan y quedan
  resaltados por el scroll-spy; Back to Top aparece pasado el umbral de
  scroll y lleva a `#inicio`; el link nuevo del Footer está presente y
  navega. Actualizar `home.spec.ts` y regenerar capturas de `visual.spec.ts`
  en viewport mobile donde corresponda.
- `astro check` y `test:unit` en verde antes de cerrar.
