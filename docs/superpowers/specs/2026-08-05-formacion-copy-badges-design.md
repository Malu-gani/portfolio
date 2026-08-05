# Formación — copy honesto, corrección de datos UTN y badges — diseño

Cubre `PORT-US-07`/`PORT-BUG-07` (Notion): redacción y estados ambiguos en
las tarjetas de la sección Formación.

## Alcance y decisiones

- **La "Contexto Técnico" del ticket** (`educationData.ts`) no existe — el
  archivo real es `src/data/formacion.ts`. Mismo patrón ya documentado para
  tickets redactados sin ver el código real.
- **El texto sugerido por el ticket para Inglés** ("Intermedio / Lectura
  Técnica") no se usa tal cual: viola un test existente
  ([formacion.test.ts:41](../../../tests/unit/formacion.test.ts#L41)) que
  prohíbe explícitamente `/` y códigos CEFR en los cuatro campos del ítem de
  inglés, puesto ahí a propósito para blindar la decisión de "Intermedio sin
  rango" de un tramo anterior. Se resuelve dándole tratamiento visual de
  badge sin tocar el texto.
- **Se corrige un dato incorrecto encontrado en el camino**: el curso de UTN
  figuraba como "Operador de Mercados Financieros" con "94 horas · 12
  unidades · 2022". El título real, verificado en la página oficial de UTN
  FRBA (`sceu.frba.utn.edu.ar`), es **"Experto Universitario en Mercado de
  Capitales"**, con **4 módulos · 22 unidades · 165 horas** de carga
  horaria total. Cubre acciones, bonos, opciones, monedas, commodities y
  ETFs (no criptomonedas). El usuario cursó el programa completo pero no
  rindió el examen final, así que el estado pasa de "Cursado sin completar"
  a **"Cursado"** a secas.
- **Se agrega una línea de descripción nueva** a las tarjetas de Bootcamp,
  ISTQB y UTN (no a Inglés, ya cubierto por su `detalle`), a pedido
  explícito del usuario durante el brainstorming: qué te aporta cada
  formación al perfil de QA. Grounded en fuentes verificables: el temario
  real del bootcamp (que el usuario pegó completo) y la página oficial de
  UTN para el curso de mercado de capitales; ISTQB usa la currícula pública
  y estándar de ISTQB Foundation Level.
- **Ningún `estado` (el valor del tipo `EstadoFormacion`) cambia** —
  `completado` / `examen-pendiente` / `sin-completar` / `nivel` siguen
  siendo los mismos cuatro, solo cambia el texto que los declara y, para
  UTN, el título/detalle.

## Copy final

### `src/data/formacion.ts` — cambios en el ítem `utn`

```ts
{
  id: 'utn',
  tituloClave: 'formacion.utn.titulo',        // sin cambios de clave
  institucionClave: 'formacion.utn.institucion', // sin cambios
  detalleClave: 'formacion.utn.detalle',       // sin cambios de clave
  descripcionClave: 'formacion.utn.descripcion', // nuevo
  estadoClave: 'formacion.estado.sinCompletar', // sin cambios de clave
  estado: 'sin-completar',                      // sin cambios
}
```

Los otros tres ítems (`bootcamp`, `istqb`, `ingles`) suman `descripcionClave`
donde corresponde (no en `ingles`), sin tocar ningún otro campo.

### `src/i18n/ui.ts` — ES

| Clave | Hoy | Nuevo |
|---|---|---|
| `formacion.estado.examenPendiente` | Curso completo · examen pendiente | Syllabus V4.0 completo · examen pendiente |
| `formacion.estado.sinCompletar` | Cursado sin completar | Cursado |
| `formacion.utn.titulo` | Operador de Mercados Financieros | Experto Universitario en Mercado de Capitales |
| `formacion.utn.detalle` | 94 horas · 12 unidades · 2022 | 165 horas · 22 unidades · 2022 |
| `formacion.bootcamp.descripcion` (nueva) | — | Fundamentos de testing manual y automatizado: diseño de casos, Agile/Scrum, API testing con Postman, y nociones de Selenium, JMeter y SQL. |
| `formacion.istqb.descripcion` (nueva) | — | Fundamentos de testing según el estándar ISTQB: ciclo de vida, técnicas de diseño de casos, tipos de prueba. |
| `formacion.utn.descripcion` (nueva) | — | Operar en bolsa y administrar carteras: acciones, bonos, opciones, monedas, commodities y ETFs, con análisis fundamental y técnico. |

### `src/i18n/ui.ts` — EN

| Clave | Hoy | Nuevo |
|---|---|---|
| `formacion.estado.examenPendiente` | Course complete · exam pending | Syllabus V4.0 complete · exam pending |
| `formacion.estado.sinCompletar` | Attended, not completed | Attended |
| `formacion.utn.titulo` | Financial Markets Operator | University Expert in Capital Markets |
| `formacion.utn.detalle` | 94 hours · 12 units · 2022 | 165 hours · 22 units · 2022 |
| `formacion.bootcamp.descripcion` (nueva) | — | Manual and automated testing fundamentals: test case design, Agile/Scrum, API testing with Postman, and basics of Selenium, JMeter and SQL. |
| `formacion.istqb.descripcion` (nueva) | — | Testing fundamentals per the ISTQB standard: software lifecycle, test design techniques, test types. |
| `formacion.utn.descripcion` (nueva) | — | Trading and portfolio management: stocks, bonds, options, currencies, commodities and ETFs, with fundamental and technical analysis. |

`formacion.utn.institucion` ("UTN FRBA" / "UTN FRBA") y todas las claves de
`bootcamp`/`istqb`/`ingles` no listadas arriba no cambian.

## `src/data/formacion.ts` — tipos

```ts
export interface ItemFormacion {
  id: string;
  tituloClave: ClaveUI;
  institucionClave: ClaveUI;
  detalleClave: ClaveUI;
  descripcionClave?: ClaveUI; // nuevo, opcional
  estadoClave: ClaveUI;
  estado: EstadoFormacion;
}
```

## `src/components/Formacion.astro`

Dos cambios:

1. **Badge pill en vez de texto plano**, reutilizando el patrón que ya existe
   en `Hero.astro` (borde + texto del mismo color semántico, sin relleno) en
   vez de inventar uno nuevo:

   ```ts
   const colorEstado: Record<EstadoFormacion, string> = {
     completado: 'border-est-paso text-est-paso',
     'examen-pendiente': 'border-sev-medio text-sev-medio',
     'sin-completar': 'border-border text-muted',
     nivel: 'border-border text-muted',
   };
   ```

   ```html
   <span data-testid="formacion-estado"
     class={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorEstado[item.estado]}`}>
     {t(item.estadoClave)}
   </span>
   ```

   `sin-completar` y `nivel` comparten el borde neutro que ya usa
   `Tag.astro` para las tecnologías del Stack — las 4 tarjetas quedan
   homogéneas sin un color nuevo.

2. **Línea de descripción condicional**, debajo de institución/detalle:

   ```html
   {item.descripcionClave && (
     <p class="mt-1 text-sm text-muted">{t(item.descripcionClave)}</p>
   )}
   ```

   Sin `data-testid` propio: no hay ningún test que necesite apuntarle
   directamente, a diferencia de `formacion-estado`.

## Testing

- **Unitario** (`tests/unit/formacion.test.ts`): se agrega un test que, para
  todo ítem con `descripcionClave`, exige texto no vacío en `es` y `en` —
  mismo patrón que ya existe para `estadoClave`. El test que prohíbe `/` y
  CEFR en el ítem de inglés no se toca (inglés no suma `descripcionClave`,
  sigue limpio).
- **E2E** (`tests/e2e/home.spec.ts`): el test "ningún ítem promete más de lo
  que hay" ([línea 198](../../../tests/e2e/home.spec.ts#L198)) hoy afirma
  `'Cursado sin completar'` — pasa a `'Cursado'`. El resto del archivo
  (conteo de 4 ítems, estado no vacío) sigue pasando sin cambios.
- **Capturas visuales**: se regeneran al final — cambian textos, aparece una
  línea nueva por tarjeta y el badge pasa de texto plano a pill (altura y
  layout de la sección Formación se mueven).

## Fuera de alcance

- No se toca `AboutContent.astro`: ya está anotado como pendiente aparte en
  memoria (contradice la sección Formación de la home desde antes de este
  ticket) — mezclarlo acá amplía el alcance sin necesidad.
- No se agrega nivel CEFR ni rango a Inglés: sigue vigente la decisión de
  "Intermedio" sin respaldo verificable.
- No se cambia ningún `data-testid` existente.
