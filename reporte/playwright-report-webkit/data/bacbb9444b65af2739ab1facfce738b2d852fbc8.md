# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: proyectos.spec.ts >> ninguna ruta muestra el aviso de contenido de ejemplo
- Location: tests/e2e/proyectos.spec.ts:182:1

# Error details

```
Error: page.goto: WebKit encountered an internal error
Call log:
  - navigating to "http://127.0.0.1:4321/en/qa/suite-e2e-portfolio", waiting until "load"

```

# Page snapshot

```yaml
- generic [active] [ref=f8e1]:
  - link "Skip to content" [ref=f8e2]:
    - /url: "#contenido"
  - banner [ref=f8e3]:
    - navigation "Main navigation" [ref=f8e4]:
      - list [ref=f8e5]:
        - listitem [ref=f8e6]:
          - link "Home" [ref=f8e7]:
            - /url: /en/#inicio
        - listitem [ref=f8e8]:
          - link "About" [ref=f8e9]:
            - /url: /en/#sobre-mi
        - listitem [ref=f8e10]:
          - link "Projects" [ref=f8e11]:
            - /url: /en/#proyectos
        - listitem [ref=f8e12]:
          - link "Stack" [ref=f8e13]:
            - /url: /en/#stack
        - listitem [ref=f8e14]:
          - link "Training" [ref=f8e15]:
            - /url: /en/#formacion
        - listitem [ref=f8e16]:
          - link "Contact" [ref=f8e17]:
            - /url: /en/#contacto
      - generic [ref=f8e18]:
        - link "Report a problem with the site" [ref=f8e19]:
          - /url: /en/#reportar
        - link "View in Spanish" [ref=f8e24]:
          - /url: /es/qa/python-qa-automation
          - text: ES
        - group "Toggle theme" [ref=f8e26]:
          - button "Light" [pressed] [ref=f8e27]
          - button "Dark" [ref=f8e32]
  - main [ref=f8e36]:
    - article [ref=f8e37]:
      - generic [ref=f8e38]:
        - heading "Python automation over an HR system" [level=1] [ref=f8e39]
        - paragraph [ref=f8e40]:
          - text: In progress ·
          - time [ref=f8e41]: 7/5/2026
        - paragraph [ref=f8e42]: "Cases designed before automating, with automatic evidence on failure, over OrangeHRM: employee creation, attachments and report downloads."
        - generic [ref=f8e43]:
          - generic [ref=f8e44]: automation
          - generic [ref=f8e45]: e2e
          - generic [ref=f8e46]: manual
          - generic [ref=f8e47]: Python
          - generic [ref=f8e48]: pytest
          - generic [ref=f8e49]: Playwright
          - generic [ref=f8e50]: assertpy
      - generic [ref=f8e51]:
        - heading "Context" [level=2] [ref=f8e52]
        - paragraph [ref=f8e53]: "OrangeHRM is a human resources system with a public demo. Unlike a practice store, it has stateful administrative flows: you create an employee, attach documents to them, generate exportable reports. That makes it much closer to a real internal system, and also much more awkward to automate — which was exactly the point."
        - paragraph [ref=f8e54]: I built it in Python with pytest so as not to be stuck with a single automation language. My other suites are in JavaScript and TypeScript, and most junior QA openings ask for Python or JavaScript without you knowing which in advance.
        - heading "Test strategy" [level=2] [ref=f8e55]
        - paragraph [ref=f8e56]: "What I wanted to exercise here wasn’t coverage so much as three things I hadn’t practiced:"
        - list [ref=f8e57]:
          - listitem [ref=f8e58]:
            - strong [ref=f8e59]: Designing the cases before automating them.
            - text: Every test carries its case identifier (
            - code [ref=f8e60]: OH-TC-02
            - text: ","
            - code [ref=f8e61]: OH-TC-03
            - text: ","
            - code [ref=f8e62]: OH-TC-05
            - text: ","
            - code [ref=f8e63]: OH-TC-10
            - text: ) and a docstring with its objective. The case existed first as a design and then as code, not the other way around.
          - listitem [ref=f8e64]:
            - strong [ref=f8e65]: Automating stateful flows
            - text: ", not read-only queries: create an employee, attach a file, generate and download a report. Those are the ones that leave a trace and the ones that break most."
          - listitem [ref=f8e66]:
            - strong [ref=f8e67]: Capturing evidence without intervention
            - text: ", because a failure that leaves no proof forces you to reproduce it by hand to understand it."
        - paragraph [ref=f8e68]:
          - strong [ref=f8e69]: "High risk:"
          - text: employee creation and file uploads, because they write data.
          - strong [ref=f8e70]: "Medium risk:"
          - text: search by ID and report export.
          - strong [ref=f8e71]: "Low risk, not automated:"
          - text: the administrative configuration modules, which are barely touched.
        - heading "Execution" [level=2] [ref=f8e72]
        - paragraph [ref=f8e73]: "13 tests using pytest and Playwright for Python, spread across three fronts: the HR system, a practice store and a forms site. Locators live in separate page classes, one per module."
        - paragraph [ref=f8e74]:
          - text: Verifications combine Playwright’s own — which wait for the element on their own — with
          - code [ref=f8e75]: assertpy
          - text: "for data comparisons, which reads almost like a sentence:"
          - code [ref=f8e76]: assert_that(result_id).is_equal_to("0312")
          - text: .
        - paragraph [ref=f8e77]:
          - text: The piece that served me best is a hook in
          - code [ref=f8e78]: conftest.py
          - text: "that attaches to each test’s report: if one fails during execution, it takes a screenshot with a name and timestamp, saves it to disk and embeds it in the HTML report. Nothing to remember, no code to add per test; the evidence shows up on its own and only when needed."
        - generic [ref=f8e79]:
          - generic [ref=f8e80]:
            - term [ref=f8e81]: Tests
            - definition [ref=f8e82]: "13"
          - generic [ref=f8e83]:
            - term [ref=f8e84]: Modules
            - definition [ref=f8e85]: "3"
          - generic [ref=f8e86]:
            - term [ref=f8e87]: Case design
            - definition [ref=f8e88]: Upfront
          - generic [ref=f8e89]:
            - term [ref=f8e90]: Evidence
            - definition [ref=f8e91]: Auto
        - heading "Findings" [level=2] [ref=f8e92]
        - paragraph [ref=f8e93]:
          - text: The findings from this work are about my own suite, and they’re the reason this case is marked
          - strong [ref=f8e94]: in progress
          - text: rather than complete. I’d rather show them than present the repository as if it were finished.
        - paragraph [ref=f8e95]:
          - strong [ref=f8e96]: The tests aren’t independent of each other.
          - text: The one that uploads an attachment looks for employee
          - code [ref=f8e97]: "412222"
          - text: ", which a different test creates. Run them in another order, or run only the attachment one, and it fails for a reason unrelated to what it means to verify. It’s one of the first rules you learn — every test sets up its own scenario — and I broke it without noticing, because writing them in order it worked."
        - paragraph [ref=f8e98]:
          - strong [ref=f8e99]: Employee creation uses a fixed ID.
          - text: Since it’s a unique value in the system, the second run collides with the first. A test that only passes the first time isn’t a regression test.
        - paragraph [ref=f8e100]:
          - strong [ref=f8e101]: One verification is tied to data from a public demo
          - text: "that resets periodically: it expects employee"
          - code [ref=f8e102]: "0312"
          - text: to have a particular name. The day that data changes, the test will fail with no defect present.
        - paragraph [ref=f8e103]:
          - strong [ref=f8e104]: Four modules are scaffolded but empty
          - text: "(admin, leave, performance and recruitment): the file and its page class exist, with no tests inside. I keep them in the repository because they mark the plan, but they don’t count as coverage and I don’t want them to look like it."
        - paragraph [ref=f8e105]:
          - strong [ref=f8e106]: Three files in the root directory aren’t tests
          - text: ", despite being named"
          - code [ref=f8e107]: test_*
          - text: ": they’re scripts recorded with the code generator, with"
          - code [ref=f8e108]: run_*
          - text: functions that pytest doesn’t collect. They served to explore the tool and stayed there.
        - heading "Automation" [level=2] [ref=f8e109]
        - paragraph [ref=f8e110]: What did come out well is the separation between what a test wants to verify and how it gets there. Locators and navigation steps live in the page classes; the tests read as a sequence of intentions. When OrangeHRM changed how you search for a report, the adjustment happened in one place.
        - paragraph [ref=f8e111]: Resolving evidence once, in the hook, rather than in each test also worked well. It’s the difference between a convention you have to remember and a guarantee that holds on its own.
        - heading "Outcome and takeaways" [level=2] [ref=f8e112]
        - paragraph [ref=f8e113]: "The central lesson is that test independence doesn’t show while you’re writing them: writing them in order, one after another, the suite passes end to end and everything looks fine. It shows when someone runs a single one, or when the order changes, or when the system keeps state from the previous run. By then the problem is already spread across several files."
        - paragraph [ref=f8e114]: "Next up in this repository, in order: each test generating its own data — an ID derived from execution time instead of a fixed number — and the attachment test creating its own employee rather than depending on another. Only after that does adding the empty modules make sense: adding coverage on top of a base that isn’t independent multiplies the problem rather than reducing it."
        - paragraph [ref=f8e115]: Compared with my JavaScript suite, the difference that surprised me most wasn’t the language but how much stateful flows change things. In a practice store every test starts from zero effortlessly; in a system that stores data, achieving that is a design decision you have to make deliberately from the start.
  - contentinfo [ref=f8e116]:
    - generic [ref=f8e117]:
      - generic [ref=f8e118]:
        - paragraph [ref=f8e119]: Juan Manuel Malugani
        - paragraph [ref=f8e120]: QA Engineer · Manual & Automation
      - list [ref=f8e121]:
        - listitem [ref=f8e122]:
          - link "Projects" [ref=f8e123]:
            - /url: /en/#proyectos
        - listitem [ref=f8e124]:
          - link "Training" [ref=f8e125]:
            - /url: /en/#formacion
        - listitem [ref=f8e126]:
          - link "Contact" [ref=f8e127]:
            - /url: /en/#contacto
        - listitem [ref=f8e128]:
          - link "Report" [ref=f8e129]:
            - /url: /en/#reportar
        - listitem [ref=f8e130]:
          - link "Back to top ↑" [ref=f8e131]:
            - /url: /en/#inicio
      - list [ref=f8e132]:
        - listitem [ref=f8e133]:
          - link "GitHub" [ref=f8e134]:
            - /url: https://github.com/Malu-gani
        - listitem [ref=f8e135]:
          - link "LinkedIn" [ref=f8e136]:
            - /url: https://www.linkedin.com/in/juanmanuelmalugani
    - generic [ref=f8e137]: © 2026 Juan Manuel Malugani
  - link "Back to top":
    - /url: /en/#inicio
```

# Test source

```ts
  84  | 
  85  |     await expect(page).toHaveURL(/\/es\/proyectos\/dev$/);
  86  |     expect(await p.filtroActivo()).toBe('dev');
  87  |     await expect(p.cardsDeTipo('qa')).toHaveCount(0);
  88  |     await expect(p.lista,
  89  |       'la página navegó: el script no interceptó el click').toHaveAttribute('data-marca', 'viva');
  90  |   });
  91  | });
  92  | 
  93  | test.describe('El filtro funciona sin JavaScript', () => {
  94  |   test.use({ javaScriptEnabled: false });
  95  | 
  96  |   test('cada ruta sirve su propio estado desde el servidor', async ({ page }) => {
  97  |     const p = new ProyectosPage(page);
  98  | 
  99  |     await page.goto('/es/proyectos');
  100 |     await expect(p.cardsDeTipo('dev')).toHaveCount(0);
  101 |     await expect(p.cardsDeTipo('qa').first()).toBeVisible();
  102 | 
  103 |     await page.goto('/es/proyectos/dev');
  104 |     await expect(p.cardsDeTipo('qa')).toHaveCount(0);
  105 |     await expect(p.cardsDeTipo('dev').first()).toBeVisible();
  106 | 
  107 |     await page.goto('/es/proyectos/todos');
  108 |     await expect(p.cardsDeTipo('qa').first()).toBeVisible();
  109 |     await expect(p.cardsDeTipo('dev').first()).toBeVisible();
  110 |   });
  111 | });
  112 | 
  113 | test.describe('Las rutas viejas siguen respondiendo', () => {
  114 |   for (const [vieja, destino] of [
  115 |     ['/es/qa', '/es/proyectos'],
  116 |     ['/es/dev', '/es/proyectos/dev'],
  117 |     ['/en/qa', '/en/projects'],
  118 |     ['/en/dev', '/en/projects/dev'],
  119 |   ] as const) {
  120 |     test(`${vieja} lleva a ${destino}`, async ({ page }) => {
  121 |       await page.goto(vieja);
  122 |       await expect(page).toHaveURL(new RegExp(`${destino.replace(/\//g, '\\/')}$`));
  123 |     });
  124 |   }
  125 | });
  126 | 
  127 | test.describe('Detalle', () => {
  128 |   test('el detalle muestra el título y los seis bloques', async ({ page }) => {
  129 |     const caso = new CasoPage(page);
  130 |     await caso.abrir('es', 'suite-e2e-portfolio');
  131 |     await expect(caso.titulo).toBeVisible();
  132 |     for (const bloque of ['Contexto', 'Estrategia de prueba', 'Ejecución',
  133 |                           'Hallazgos', 'Automatización', 'Resultado y aprendizajes']) {
  134 |       await expect(page.getByRole('heading', { name: bloque })).toBeVisible();
  135 |     }
  136 |   });
  137 | 
  138 |   test('el cambio de idioma preserva el caso abierto', async ({ page }) => {
  139 |     const caso = new CasoPage(page);
  140 |     await caso.abrir('es', 'suite-e2e-portfolio');
  141 |     await caso.langToggle.click();
  142 |     await expect(page).toHaveURL(/\/en\/qa\/suite-e2e-portfolio$/);
  143 |     await expect(page.getByTestId('caso-detalle')).toBeVisible();
  144 |   });
  145 | 
  146 |   // El campo `repo` es opcional en el esquema y CaseLayout lo renderiza
  147 |   // condicionalmente. Se cubren las dos ramas, cada una donde hoy aplica de
  148 |   // verdad: el caso de suite-sauce no lo declara (ese repositorio sigue siendo
  149 |   // privado), y el de este portfolio sí.
  150 |   test('el detalle no muestra enlace al repositorio si el contenido no lo declara', async ({ page }) => {
  151 |     await page.goto('/es/qa/suite-sauce');
  152 |     await expect(page.getByTestId('caso-detalle')).toBeVisible();
  153 |     await expect(page.getByTestId('caso-repo')).toHaveCount(0);
  154 |   });
  155 | 
  156 |   test('el detalle enlaza al repositorio cuando el contenido lo declara', async ({ page }) => {
  157 |     await page.goto('/es/qa/suite-e2e-portfolio');
  158 |     await expect(page.getByTestId('caso-repo')).toHaveAttribute('href', /github\.com/);
  159 |   });
  160 | 
  161 |   // Mismo par de ramas para `demo`, que hasta ahora estaba declarado en el
  162 |   // esquema pero no lo renderizaba ninguna plantilla.
  163 |   test('el detalle no muestra enlace al demo si el contenido no lo declara', async ({ page }) => {
  164 |     await page.goto('/es/qa/suite-sauce');
  165 |     await expect(page.getByTestId('caso-detalle')).toBeVisible();
  166 |     await expect(page.getByTestId('caso-demo')).toHaveCount(0);
  167 |   });
  168 | 
  169 |   test('el detalle enlaza al demo cuando el contenido lo declara', async ({ page }) => {
  170 |     await page.goto('/es/dev/gestor-operaciones');
  171 |     await expect(page.getByTestId('caso-demo'))
  172 |       .toHaveAttribute('href', 'https://registro-de-operaciones-chi.vercel.app');
  173 |   });
  174 | });
  175 | 
  176 | // Ya no queda contenido con `ejemplo: true`, así que no hay dónde ejercitar
  177 | // el banner encendido: el test que lo hacía se invirtió en el invariante que
  178 | // ahora importa, que es que el sitio no muestre ese aviso en ninguna ruta.
  179 | // Es el equivalente en la suite E2E de `npm run check:listo`, que valida lo
  180 | // mismo sobre el frontmatter. Falsable: poner `ejemplo: true` en cualquier
  181 | // caso o proyecto hace fallar este test.
  182 | test('ninguna ruta muestra el aviso de contenido de ejemplo', async ({ page }) => {
  183 |   for (const ruta of rutasDelSitio()) {
> 184 |     await page.goto(ruta);
      |                ^ Error: page.goto: WebKit encountered an internal error
  185 |     await expect(page.getByTestId('banner-ejemplo'),
  186 |       `${ruta} todavía muestra el aviso de contenido de ejemplo`).toHaveCount(0);
  187 |   }
  188 | });
  189 | 
  190 | // El listado se embebe en la home además de servir /es/proyectos. Estas dos
  191 | // props son lo que hace posible lo segundo sin romper lo primero.
  192 | test.describe('El listado es embebible', () => {
  193 |   test('en su propia página el título es h1', async ({ page }) => {
  194 |     await page.goto('/es/proyectos');
  195 |     await expect(page.getByRole('heading', { level: 1, name: 'Proyectos' })).toHaveCount(1);
  196 |   });
  197 | 
  198 |   test('en su propia página el filtro sigue actualizando la URL', async ({ page }) => {
  199 |     const p = new ProyectosPage(page);
  200 |     await page.goto('/es/proyectos');
  201 |     await p.botonFiltro('dev').click();
  202 |     await expect(page).toHaveURL(/\/es\/proyectos\/dev$/);
  203 |   });
  204 | 
  205 |   // `contexto="home"` es lo que evita que, embebido en la home, el filtro deje
  206 |   // la URL en /es/proyectos/dev mostrando la home: recargar daría otra página.
  207 |   test('el atributo de contexto viaja al DOM', async ({ page }) => {
  208 |     const p = new ProyectosPage(page);
  209 |     await page.goto('/es/proyectos');
  210 |     await expect(p.lista).toHaveAttribute('data-contexto', 'pagina');
  211 |   });
  212 | });
  213 | 
```