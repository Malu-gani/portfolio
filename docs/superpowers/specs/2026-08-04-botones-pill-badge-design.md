# Botones de acción a formato Pill/Badge — diseño

Cubre `PORT-US-05`/`PORT-BUG-05` (Notion): unificar todos los botones de
acción bordeados del sitio a un estilo pill (`rounded-full`) con ícono
semántico, en vez del `rounded-md` actual.

## Alcance y decisiones

- **La premisa del ticket es falsa en un punto clave**: dice que hay que
  converger al estilo pill que "ya usan" los botones del Header/Footer
  ("GitHub", "LinkedIn", "Email", "Descargar CV"). En el código real, esos
  botones son `rounded-md`, no `rounded-full` — no existe hoy ningún botón de
  acción tipo CTA en pill. La única forma real de resolver la inconsistencia
  que el ticket describe es **definir un pill nuevo como estándar**, no
  copiar uno existente.
- **La "Contexto Técnico" del ticket** (`AboutMe.tsx`, `ProjectCard.tsx`,
  `ProjectDetail.tsx`, `<Button variant="badge" />`) no existe — es Astro, no
  React. Se trata como pista, no como hecho, mismo patrón ya documentado
  para tickets redactados sin ver el código real.
- **Alcance ampliado a "todo el Portfolio"** (título del ticket), no solo los
  3 elementos que menciona el bug: se relevaron todos los botones bordeados
  tipo CTA del sitio y quedaron 7 lugares (10 elementos, algunos comparten
  archivo). Decisión explícita del usuario tras encontrar en el camino que
  `Reportar.astro` (2 botones) y `CopyEmail.tsx` (botón de copiar de la
  sección Contacto completa) comparten la misma familia visual y quedarían
  inconsistentes si se dejaban afuera.
- **Ícono semántico por tipo de acción**, no una única flecha genérica: `ir`
  (↗, navegación externa/interna), `descargar` (↓, el CV), `copiar`
  (portapapeles). Pedido explícito del usuario, cumple el criterio de
  aceptación 3 del ticket ("ícono o flecha SVG estilizada") con precisión
  semántica en vez de una sola flecha repetida sin sentido en un botón de
  copiar.
- **Sin librerías de terceros ni React nuevo**: los 3 íconos son SVG
  dibujados a mano (no hay marca que representar, a diferencia del Stack).
  El único componente React tocado (`CopyEmail.tsx`) ya existía; no se agrega
  hidratación nueva.
- **Ningún `data-testid` cambia**: los e2e existentes siguen pasando sin
  tocarlos (`link-sobre-completo`, `card-repo`, `card-demo`, `cv-descargar`,
  `hero-github`, `hero-linkedin`, `hero-email`, `reportar-github`,
  `reportar-copiar`, `email-copiar`).
- **Ningún texto ni clave i18n cambia**: los 7 textos ya existen, solo cambia
  el marcado y las clases alrededor.

## Módulo compartido (`src/data/boton-accion.ts`, nuevo)

`Record` de texto plano con las clases Tailwind del pill (dos tamaños) y los
3 `path` SVG de ícono, mismo patrón que `stack-iconos.ts`. Se elige `.ts`
plano y no un componente `.astro` porque tiene que ser importable también
desde `CopyEmail.tsx` (React).

```ts
export const claseAccionBoton = {
  grande: 'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors',
  chica: 'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
};
export const iconosAccion: Record<'ir' | 'descargar' | 'copiar', string> = { ... };
```

El color (borde/texto acento vs. neutro) sigue viniendo de cada call site,
no del módulo: no todos los botones tienen la misma jerarquía visual hoy
(CV y "Reportar en GitHub" son acento; el resto son neutros) y eso no
cambia.

## `AccionBoton.astro` (nuevo)

Cubre los usos que son `<a>` simple. Props: `href`, `variante: 'ir' |
'descargar'`, `tono: 'acento' | 'neutro'`, `tamano: 'grande' | 'chica'`,
`texto`, `testid`, y pasa `target`/`rel`/`download` cuando corresponda.
Renderiza el ícono con `set:html` desde `iconosAccion[variante]` (con
`aria-hidden="true"`) + `<span>{texto}</span>`.

## Los 3 casos que no usan `AccionBoton`

Tienen lógica propia de copiar-al-portapapeles que muta su texto en
runtime, así que se les aplican las clases y el ícono `copiar` directo,
sin pasar por el componente:

- **Email del hero** (`ContactoInline.astro`): sigue siendo el mismo `<a
  mailto>` con `engancharCopiar` ya existente.
- **"Copiar la plantilla"** (`Reportar.astro`): mismo enfoque sobre el
  `<button>` existente, sin tocar `engancharCopiar`.
- **"Copiar email"** (`CopyEmail.tsx`, React): importa `claseAccionBoton`
  del módulo compartido para las clases; el ícono se escribe una vez como
  JSX fijo en el componente (no vale un `dangerouslySetInnerHTML` por un
  ícono estático).

## Aplicación en cada lugar

| Lugar | Mecanismo | variante | tono | tamaño |
|---|---|---|---|---|
| Sobre mí — "Leer el recorrido completo" | `AccionBoton` | `ir` | neutro | chica |
| Ver repositorio | `AccionBoton` | `ir` | neutro | chica |
| Ver la app | `AccionBoton` | `ir` | neutro | chica |
| CV — "Descargar CV" | `AccionBoton` | `descargar` | acento | grande |
| GitHub (hero) | `AccionBoton` | `ir` | neutro | chica |
| LinkedIn (hero) | `AccionBoton` | `ir` | neutro | chica |
| Reportar en GitHub | `AccionBoton` | `ir` | acento | grande |
| Email (hero) | clases + ícono directo | `copiar` | neutro | chica |
| Copiar la plantilla | clases + ícono directo | `copiar` | neutro | grande |
| Copiar email (Contacto) | clases + ícono directo (React) | `copiar` | neutro | chica |

"Ver repositorio"/"Ver la app" hoy son texto plano sin borde ni fondo; con
`AccionBoton` pasan a tener el mismo peso visual que el resto — es
exactamente lo que pide el criterio de aceptación 2 del ticket.

## Accesibilidad

- Todo ícono SVG lleva `aria-hidden="true"`: el texto del botón ya es el
  nombre accesible, a diferencia del nivel de Stack acá no hace falta
  `aria-label` extra.
- El foco visible no se toca: sigue el tratamiento global del tema.
- `target="_blank" rel="noopener noreferrer"` se preserva donde ya existía
  (Ver repositorio/demo, GitHub, LinkedIn, Reportar en GitHub);
  `AccionBoton` los pasa a través sin filtrarlos.

## Testing

- **E2E**: se agrega un test que verifica que los 10 elementos (por sus
  `data-testid` existentes) tengan `border-radius` en rango pill, para
  atrapar una regresión futura a `rounded-md` — mismo espíritu que el test
  que guarda contra el retorno del `scroll-snap`. `a11y.spec.ts` corre igual
  sin cambios: si un ícono decorativo perdiera `aria-hidden`, aparece ahí.
- No hay dato nuevo verificable por unit test (no hay una tabla como en
  Stack); se confía en `astro check` para las props de `AccionBoton`.
- Capturas visuales (`visual.spec.ts`) se regeneran al final si el cambio de
  forma/ícono altera la altura o el layout de alguna página.

## Fuera de alcance

- Tamaño de fuente y color base de cada botón: no cambian, solo forma
  (`rounded-full`) e ícono.
- Unificar `ContactoInline` (vanilla) y `CopyEmail.tsx` (React) en una sola
  implementación de copiar-al-portapapeles: son dos mecanismos separados
  desde antes de este ticket, no lo pide.
