# Caso del gestor con la suite ejecutada — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que el caso QA y el proyecto dev del gestor de operaciones dejen de afirmar que la suite no existe, cuenten el arco completo (plan → ejecución → 10 defectos) y enlacen el repositorio y la app desplegada.

**Architecture:** Cuatro tareas. La 1 construye el enlace al demo, que hoy es un campo muerto del esquema, con su test — es la única que toca código. La 2 y la 3 reescriben contenido (caso QA y proyecto dev, en español e inglés). La 4 ajusta "Sobre mí" y cierra con la verificación completa. La tarea 1 va primera porque las 2 y 3 declaran `demo:` en el frontmatter y sin el layout ese campo no se dibujaría.

**Tech Stack:** Astro 7, TypeScript, Tailwind, Playwright (E2E), Vitest (unit), colecciones de contenido con esquema Zod.

## Global Constraints

- **Idiomas espejo.** Todo cambio de contenido se hace en `es/` y en `en/`. El sitio es bilingüe y hay tests que barren las rutas de ambos idiomas.
- **`resumen` está limitado a 200 caracteres** por el esquema (`src/content.config.ts`). Pasarse rompe el build.
- **`tags` solo acepta valores del enum**: `manual`, `automation`, `e2e`, `api`, `exploratorio`, `regresion`, `accesibilidad`, `performance`, `mobile`. Cualquier otro rompe el build.
- **Nada de marcas de generación por IA** en commits ni en cuerpos de PR: sin trailer `Co-Authored-By` y sin pie "Generated with Claude Code".
- **Ningún contenido con `ejemplo: true`.** `npm run check:listo` es un gate bloqueante del CI.
- **El enlace al repositorio no lleva `target="_blank"`.** El enlace al demo tampoco: se sigue el patrón existente.
- **Los datos son reales o no se escriben.** Si un número o un hecho no se puede verificar contra el repositorio del gestor, se omite; no se rellena.

**Datos verificados el 2026-07-30** (usar exactamente estos):

- Repositorio: `https://github.com/Malu-gani/Registro-de-Operaciones` — público.
- Demo: `https://registro-de-operaciones-chi.vercel.app` — responde 200, redirige a `/login`.
- 275 pruebas = 186 unitarias + 18 de componentes + 66 SQL + 5 E2E. Tras la verificación por email pasaron a 9 E2E.
- 10 defectos encontrados, 10 arreglados. Dos P0 (9.1 y 9.5). Migraciones 015, 016 y 017.
- `suite-sauce` y `python-qa-automation` siguen **privados**.

---

### Task 1: Enlace al demo en el layout de detalle

El campo `demo` está declarado en las dos colecciones del esquema y ninguna plantilla lo lee. Esta tarea lo hace visible, con las dos ramas cubiertas.

**Files:**
- Modify: `src/layouts/CaseLayout.astro:8-15` (Props) y `:36-39` (render)
- Modify: `src/i18n/ui.ts:25` (tipo), `:54` (es), `:82` (en)
- Test: `tests/e2e/dev.spec.ts:24-37`

**Interfaces:**
- Consumes: nada de tareas anteriores.
- Produces: `data-testid="caso-demo"` en el detalle de cualquier caso o proyecto cuyo frontmatter declare `demo`. Las tareas 2 y 3 dependen de que exista.

- [ ] **Step 1: Reapuntar el test de la rama "sin repositorio"**

Hoy usa `gestor-operaciones` como sujeto porque su repo era privado. En la tarea 3 ese proyecto declara `repo:`, así que el test empezaría a fallar. Se le cambia el sujeto a `suite-sauce`, cuyo repositorio sigue privado.

En `tests/e2e/dev.spec.ts`, reemplazar el bloque de las líneas 24 a 37 por:

```ts
  // El campo `repo` es opcional en el esquema y CaseLayout lo renderiza
  // condicionalmente. Se cubren las dos ramas, cada una donde hoy aplica de
  // verdad: el caso de suite-sauce no lo declara (ese repositorio sigue siendo
  // privado), y el de este portfolio sí.
  test('el detalle no muestra enlace al repositorio si el contenido no lo declara', async ({ page }) => {
    await page.goto('/es/qa/suite-sauce');
    await expect(page.getByTestId('caso-detalle')).toBeVisible();
    await expect(page.getByTestId('caso-repo')).toHaveCount(0);
  });

  test('el detalle enlaza al repositorio cuando el contenido lo declara', async ({ page }) => {
    await page.goto('/es/qa/suite-e2e-portfolio');
    await expect(page.getByTestId('caso-repo')).toHaveAttribute('href', /github\.com/);
  });

  // Mismo par de ramas para `demo`, que hasta ahora estaba declarado en el
  // esquema pero no lo renderizaba ninguna plantilla.
  test('el detalle no muestra enlace al demo si el contenido no lo declara', async ({ page }) => {
    await page.goto('/es/qa/suite-sauce');
    await expect(page.getByTestId('caso-detalle')).toBeVisible();
    await expect(page.getByTestId('caso-demo')).toHaveCount(0);
  });

  test('el detalle enlaza al demo cuando el contenido lo declara', async ({ page }) => {
    await page.goto('/es/dev/gestor-operaciones');
    await expect(page.getByTestId('caso-demo'))
      .toHaveAttribute('href', 'https://registro-de-operaciones-chi.vercel.app');
  });
```

- [ ] **Step 2: Correr los tests y verificar que fallan por la razón correcta**

```bash
npm run build && npx playwright test tests/e2e/dev.spec.ts --project=chromium
```

Esperado: los dos tests de `demo` fallan. El de "no muestra enlace al demo" **debería pasar** trivialmente (el testid no existe en ningún lado todavía) — eso es esperable y no valida nada aún; el que importa es "enlaza al demo cuando el contenido lo declara", que debe fallar porque `caso-demo` no existe.

Correr `npm run build` explícito antes: `reuseExistingServer` no reconstruye y se puede estar probando un build viejo.

- [ ] **Step 3: Agregar la clave de traducción**

En `src/i18n/ui.ts`, sumar `| 'caso.verDemo'` a la unión de tipos junto a `'caso.verRepo'` (línea 25), y la entrada en los dos diccionarios:

```ts
  // en el diccionario es, junto a 'caso.verRepo'
  'caso.verDemo': 'Ver la app',
```

```ts
  // en el diccionario en, junto a 'caso.verRepo'
  'caso.verDemo': 'View the app',
```

- [ ] **Step 4: Declarar `demo` en el Props del layout**

En `src/layouts/CaseLayout.astro`, en la interfaz `Props`, agregar `demo` junto a `repo`:

```ts
    fecha: Date; estado?: 'completo' | 'en-progreso'; ejemplo: boolean;
    repo?: string;
    demo?: string;
```

- [ ] **Step 5: Renderizar el enlace**

En `src/layouts/CaseLayout.astro`, reemplazar el bloque de las líneas 36 a 39 por:

```astro
      {(datos.repo || datos.demo) && (
        <div class="mt-4 flex flex-wrap gap-4">
          {datos.repo && (
            <a href={datos.repo} data-testid="caso-repo"
              class="inline-block text-accent hover:underline">{t('caso.verRepo')} →</a>
          )}
          {datos.demo && (
            <a href={datos.demo} data-testid="caso-demo"
              class="inline-block text-accent hover:underline">{t('caso.verDemo')} →</a>
          )}
        </div>
      )}
```

El `mt-4` se mueve del enlace al contenedor para que el margen no se duplique cuando aparecen los dos.

- [ ] **Step 6: Verificar que la rama negativa puede fallar**

El test "no muestra enlace al demo" pasa aunque el layout esté roto, porque afirma ausencia. Para comprobar que sabe fallar, agregar temporalmente `demo: "https://example.com"` al frontmatter de `src/content/casos-qa/es/suite-sauce.mdx`, reconstruir, correr ese test y confirmar que **falla**. Después revertir el frontmatter.

```bash
npm run build && npx playwright test tests/e2e/dev.spec.ts --project=chromium -g "no muestra enlace al demo"
```

Esperado: FAIL mientras el `demo:` temporal esté puesto. Si pasa, el test no sirve.

- [ ] **Step 7: Correr los tests y verificar que pasan**

Con el frontmatter ya revertido:

```bash
npm run build && npx playwright test tests/e2e/dev.spec.ts --project=chromium
```

Esperado: los cuatro tests en verde. El de "enlaza al demo" sigue fallando hasta la tarea 3, que es la que declara `demo:` en el proyecto dev — **esto es esperado**: dejarlo rojo entre tareas es correcto, y la tarea 3 lo cierra.

- [ ] **Step 8: Verificar que no se rompió nada más**

```bash
npm run check && npm run test:unit
```

Esperado: sin errores de tipos, tests unitarios en verde.

- [ ] **Step 9: Commit**

```bash
git add src/layouts/CaseLayout.astro src/i18n/ui.ts tests/e2e/dev.spec.ts
git commit -m "feat: renderiza el enlace al demo, que estaba en el esquema sin usar"
```

---

### Task 2: Reescribir el caso QA

**Files:**
- Modify: `src/content/casos-qa/es/gestor-operaciones.md`
- Modify: `src/content/casos-qa/en/gestor-operaciones.md`
- Test: `tests/e2e/casos.spec.ts` (no se modifica; se corre para confirmar que sigue en verde)

**Interfaces:**
- Consumes: `data-testid="caso-demo"` de la tarea 1.
- Produces: el caso con `estado: completo` y `repo`/`demo` declarados.

- [ ] **Step 1: Reemplazar el frontmatter en español**

En `src/content/casos-qa/es/gestor-operaciones.md`:

```yaml
---
titulo: "Suite de pruebas de una app financiera propia"
resumen: "275 pruebas sobre un diario de trading que construí. Encontró 10 defectos: dos permitían que cualquier usuario logueado creara dinero salteándose el formulario."
tags: [manual, automation, e2e, api]
stack: [Vitest, Playwright, Testing Library, PostgreSQL, Supabase, TypeScript, Docker, GitHub Actions]
fecha: 2026-07-30
destacado: true
estado: completo
ejemplo: false
repo: "https://github.com/Malu-gani/Registro-de-Operaciones"
demo: "https://registro-de-operaciones-chi.vercel.app"
---
```

- [ ] **Step 2: Reescribir el cuerpo en español**

Mantener los seis encabezados `##` existentes, en el mismo orden: Contexto, Estrategia de prueba, Ejecución, Hallazgos, Automatización, Resultado y aprendizajes. Los otros tres casos comparten esa estructura y no se rompe.

Qué cambia en cada uno:

- **Contexto** — se conserva casi entero. **Borrar el párrafo** que empieza con "**Este caso documenta el plan de pruebas, no su ejecución.**": era la advertencia de cuando no había suite. En su lugar, una línea que diga que la suite existe, corre en CI y que el repositorio es público.
- **Estrategia de prueba** — reemplazar la prosa de "riesgo crítico / alto / medio" por la tabla P0–P3 real:

| Nivel | Consecuencia |
|---|---|
| P0 | Se crea, se destruye o se contabiliza mal el dinero. Un usuario ve datos de otro. |
| P1 | Un número mal calculado informa una decisión de trading real. |
| P2 | La UI muestra mal algo correcto, o deja cargar algo inválido. |
| P3 | Cosmético. Fuera de alcance automatizado. |

  Sumar la regla operativa ("ningún test P2 se escribe mientras quede un camino P0 sin cubrir") y **pgTAP descartado con argumento**: prueba las funciones desde adentro de Postgres con permisos elevados, con lo que RLS no se ejercita, que es justamente la capa que había que verificar. Reemplazar las tres exclusiones actuales por las reales, que están en `docs/testing.md` del repositorio del gestor.

- **Ejecución** — deja de ser futuro. Cubrir: los 275 tests repartidos en 186 unitarios, 18 de componentes, 66 SQL y 5 E2E (hoy 9); el aislamiento por RLS con un usuario de email único por test en vez de truncate, que permite correr en paralelo; la condición de corte de `CryptoForm`, que no se testeó como componente porque depende de cuatro contextos y sale a la red al renderizar —sus tres aserciones útiles se movieron a E2E—; y el diagnóstico de la intermitencia en Windows: un test al azar fallaba con tres o más archivos, la causa era la CLI de Supabase escribiendo `~/.supabase/telemetry.json` con temporal+rename mientras los workers competían por ese rename, y el arreglo fue un `globalSetup` que la consulta una sola vez.

- **Hallazgos** — la sección que más cambia. Hoy dice "Ninguno todavía". Pasa a:
  1. Los dos P0 al frente, con el detalle de por qué importan: las RPC son `security definer` y están otorgadas a `authenticated`, así que cualquier usuario logueado podía llamarlas con `supabase.rpc()` directo, salteándose el formulario. La validación del cliente no era una segunda capa, era la única. En 9.1, con cantidad negativa el costo daba negativo, la guarda `if disponible < costo` pasaba siempre y la resta sumaba: 1.000 USD a 101.000 en una llamada. En 9.5, precio de salida negativo inflaba el P&L en un short y dejaba el disponible en −6.000 en un long.
  2. Los otros ocho, en una tabla breve: huso horario en el vencimiento de plazos fijos, fecha de salida anterior a la de entrada, separador de miles por locale, fechas inexistentes como `2026-02-31`, dos fórmulas de riesgo que se contradecían, el `0` tratado como "sin stop loss", el error crudo de Postgres filtrado a la interfaz, y los `grant` faltantes.
  3. **La comparación.** La tabla actual de "casos que espero que duelan" **no se borra**: se reencuadra como lo estimado leyendo el código, y al lado va lo que la ejecución corrigió — 9.2 bajó de P0 a P3 porque un `check` de columna ya lo frenaba, 9.5 resultó peor de lo previsto, y 9.10 no se podía ver leyendo: apareció al recrear la base desde cero.
  4. El bug de la confirmación por email: las cookies se escribían en el store de `next/headers` y no sobrevivían al `NextResponse.redirect`, y el redirect usaba el `origin` de `request.url`, que `next start` reporta como `localhost`. Ningún usuario podría haberlo reportado, porque el afectado nunca lograba entrar.

- **Automatización** — sumar el CI con dos jobs separados por costo: `rapido` (typecheck, lint y unitarios) en cada push, y `completo` (SQL y E2E, que levantan Supabase con Docker en el runner) solo en pull requests. Y la decisión sobre cobertura: se reporta pero no es umbral bloqueante, porque un mínimo de cobertura premia tests de relleno y el criterio real es la priorización.

- **Resultado y aprendizajes** — el cierre: los 10 defectos se dedujeron leyendo el código, y ejecutarlos contra una base real cambió tres severidades. El análisis estático acierta el *dónde* y falla el *cuánto*. Sumar la defensa en profundidad: además de validar en las RPC se agregaron `check` de columna en `operaciones`, replicando lo que `plazos_fijos` ya tenía y que fue lo que evitó que 9.2 fuera grave.

**No incluir** (decidido en el spec, sección 3.3): despliegue, fases de costo cero, gotchas de Vercel, gotchas de git, el detalle de instalar Docker, el desglose por PR, ni el lint de 161 a 0.

- [ ] **Step 3: Traducir al inglés**

Recién con el español cerrado, reescribir `src/content/casos-qa/en/gestor-operaciones.md` en espejo. El frontmatter lleva `titulo` y `resumen` traducidos; `tags`, `stack`, `fecha`, `estado`, `repo` y `demo` son idénticos.

Traducción del título: `"Test suite for a financial app I built"`.

- [ ] **Step 4: Verificar el build y los gates**

```bash
npm run check && npm run check:listo && npm run build
```

Esperado: sin errores. Si `resumen` pasa de 200 caracteres, el build falla con un error de Zod — ahí hay que acortarlo.

- [ ] **Step 5: Correr los E2E de casos y de dev**

```bash
npx playwright test tests/e2e/casos.spec.ts tests/e2e/dev.spec.ts --project=chromium
```

Esperado: todo en verde, incluido "el detalle enlaza al demo cuando el contenido lo declara" si la tarea 3 ya corrió; si todavía no, ese sigue rojo.

- [ ] **Step 6: Commit**

```bash
git add src/content/casos-qa/es/gestor-operaciones.md src/content/casos-qa/en/gestor-operaciones.md
git commit -m "content: el caso del gestor pasa de plan a suite ejecutada"
```

---

### Task 3: Reescribir el proyecto dev

**Files:**
- Modify: `src/content/proyectos/es/gestor-operaciones.md`
- Modify: `src/content/proyectos/en/gestor-operaciones.md`

**Interfaces:**
- Consumes: `data-testid="caso-demo"` de la tarea 1.
- Produces: cierra el test "el detalle enlaza al demo cuando el contenido lo declara", que apunta a `/es/dev/gestor-operaciones`.

- [ ] **Step 1: Actualizar el frontmatter en español**

En `src/content/proyectos/es/gestor-operaciones.md`, mantener todo y agregar las dos claves nuevas, más la fecha:

```yaml
fecha: 2026-07-30
repo: "https://github.com/Malu-gani/Registro-de-Operaciones"
demo: "https://registro-de-operaciones-chi.vercel.app"
```

`destacado: true` y `ejemplo: false` no cambian. `stack` tampoco: describe el producto, no la suite.

- [ ] **Step 2: Actualizar el cuerpo en español**

- En **Estado actual**, borrar las dos frases que quedaron falsas: "**Todavía no tiene suite de pruebas automatizada**" y "El repositorio es privado por ahora; lo voy a enlazar acá cuando termine la suite y lo haga público". En su lugar, una línea corta que diga que tiene suite y remita al caso del carril QA para el detalle, sin repetirlo.
- Agregar una sección `## Despliegue y operación` al final, con: Vercel plan Hobby, entorno de producción siguiendo `main` —cada merge redeploya y cada PR recibe su propia URL de preview—, Supabase en capa gratuita, Gmail como SMTP, costo total cero. Y la decisión de arquitectura de `verifyOtp` con `token_hash` sobre PKCE, con su razón real: PKCE guarda el `code_verifier` en una cookie del navegador donde arrancó el flujo, así que registrarse en la computadora y abrir el mail en el celular fallaba.

- [ ] **Step 3: Traducir al inglés**

Espejo en `src/content/proyectos/en/gestor-operaciones.md`.

- [ ] **Step 4: Verificar**

```bash
npm run check && npm run check:listo && npm run build
npx playwright test tests/e2e/dev.spec.ts --project=chromium
```

Esperado: los cuatro tests de `dev.spec.ts` en verde, incluido el del demo, que hasta ahora estaba rojo.

- [ ] **Step 5: Commit**

```bash
git add src/content/proyectos/es/gestor-operaciones.md src/content/proyectos/en/gestor-operaciones.md
git commit -m "content: suma despliegue y enlaces al proyecto del gestor"
```

---

### Task 4: "Sobre mí" y verificación final

**Files:**
- Modify: `src/components/AboutContent.astro:18` (es) y `:35` (en)

**Interfaces:**
- Consumes: nada.
- Produces: nada que consuman otras tareas.

- [ ] **Step 1: Actualizar el cierre del recorrido**

En `src/components/AboutContent.astro`, el campo `recorrido` termina hoy en:

> "y hoy pruebo una aplicación financiera real que estoy construyendo en paralelo."

Reemplazarlo por el resultado concreto: que le armó la suite completa a esa aplicación y que encontró defectos críticos, incluidos dos que permitían crear dinero. Una frase, no un párrafo — el resto del texto no se toca.

Hacer lo mismo en el campo `recorrido` del diccionario `en`, que termina en:

> "and today I'm testing a real financial application I'm building in parallel."

- [ ] **Step 2: Verificar**

```bash
npm run check && npm run test:unit
npx playwright test tests/e2e --project=chromium
```

Esperado: toda la suite E2E de chromium en verde.

- [ ] **Step 3: Verificar los gates de contenido**

```bash
npm run check:listo && npm run build
```

Esperado: sin contenido de ejemplo pendiente, build exitoso.

- [ ] **Step 4: Confirmar a mano que los enlaces nuevos funcionan**

```bash
npm run preview
```

Abrir `/es/qa/gestor-operaciones` y `/es/dev/gestor-operaciones` y comprobar que los dos enlaces aparecen y llevan a donde deben. Los tests verifican el `href`, no que el destino responda: el test de enlaces externos se saltea en CI.

- [ ] **Step 5: Commit**

```bash
git add src/components/AboutContent.astro
git commit -m "content: actualiza el recorrido de Sobre mí con el resultado de la suite"
```

- [ ] **Step 6: Abrir el PR**

Sin marcas de generación por IA. En el cuerpo, dejar escrita la verificación ejecutada: qué comandos se corrieron y con qué resultado.

---

## Fuera de alcance

No se tocan en este plan, por decisión registrada en la sección 8 del spec:

- El diseño y el estilado del sitio.
- Los PDFs del CV, que siguen siendo placeholders. Cuando lleguen los reales se reemplazan **y** se refuerza el test de descarga para que verifique contenido y no solo el nombre del archivo.
- Las páginas de Inicio, Desarrollo y Contacto.
- Un caso de Postman/Zephyr/Jira.
