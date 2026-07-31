import { test, expect } from '@playwright/test';
import { ProyectosPage } from './pages/ProyectosPage';
import { CasoPage } from './pages/CasoPage';
import { rutasDelSitio } from './utils/rutas';

// Reemplaza a casos.spec.ts y dev.spec.ts: los dos listados separados
// (/es/qa y /es/dev) se unificaron en /es/proyectos con filtro en rutas
// reales. Los tests de contenido y de las ramas repo/demo se conservan
// desde esos specs, adaptando las rutas.

test.describe('Listado unificado', () => {
  for (const lang of ['es', 'en'] as const) {
    test(`la ruta por defecto lista los cuatro casos QA en ${lang}`, async ({ page }) => {
      const p = new ProyectosPage(page);
      await p.abrir(lang);
      await expect(p.cardsDeTipo('qa')).toHaveCount(4);
    });

    test(`la ruta de desarrollo lista el proyecto en ${lang}`, async ({ page }) => {
      const p = new ProyectosPage(page);
      await p.abrir(lang, 'dev');
      await expect(p.cardsDeTipo('dev')).toHaveCount(1);
    });
  }

  test('se navega del listado al detalle de un caso', async ({ page }) => {
    const p = new ProyectosPage(page);
    await p.abrir('es');
    await p.cardsDeTipo('qa').first().getByRole('link').first().click();
    await expect(page.getByTestId('caso-detalle')).toBeVisible();
  });

  test('se navega del listado al detalle del proyecto', async ({ page }) => {
    // WebKit crasheaba el proceso de render en la transición cliente-a-cliente
    // del <ClientRouter/> de Astro específicamente entre el listado y
    // /es/dev/gestor-operaciones (detalle) — ver docs/cross-browser-diagnostico.md.
    // Se mitigó con `data-astro-reload` en el enlace de ProyectoCard.astro, que
    // fuerza navegación de página completa para ese link puntual, evitando la
    // transición nativa donde WebKit tiene un bug documentado
    // (withastro/astro#15727). Ya no hace falta test.skip en webkit.
    const p = new ProyectosPage(page);
    await p.abrir('es', 'dev');
    await p.cardsDeTipo('dev').first().getByRole('link').first().click();
    await expect(page.getByTestId('proyecto-detalle')).toBeVisible();
  });
});

test.describe('Filtro de proyectos', () => {
  test('la ruta por defecto muestra solo QA', async ({ page }) => {
    const p = new ProyectosPage(page);
    await page.goto('/es/proyectos');
    expect(await p.filtroActivo()).toBe('qa');
    await expect(p.cardsDeTipo('qa').first()).toBeVisible();
    await expect(p.cardsDeTipo('dev')).toHaveCount(0);
  });

  test('la ruta de desarrollo muestra solo dev', async ({ page }) => {
    const p = new ProyectosPage(page);
    await page.goto('/es/proyectos/dev');
    await expect(p.cardsDeTipo('dev').first()).toBeVisible();
    await expect(p.cardsDeTipo('qa')).toHaveCount(0);
  });

  test('la ruta de todos muestra ambos carriles', async ({ page }) => {
    const p = new ProyectosPage(page);
    await page.goto('/es/proyectos/todos');
    await expect(p.cardsDeTipo('qa').first()).toBeVisible();
    await expect(p.cardsDeTipo('dev').first()).toBeVisible();
  });

  test('clickear un filtro cambia la lista y la URL sin navegar', async ({ page }) => {
    const p = new ProyectosPage(page);
    await page.goto('/es/proyectos');

    // La marca va sobre el elemento de la lista, no sobre `window`: el sitio
    // monta el <ClientRouter/> de Astro, así que una navegación de verdad
    // podría ser un swap de view transitions, que preserva `window` y dejaría
    // pasar el test aunque el script no hubiera interceptado nada. El <div>
    // del listado, en cambio, se reemplaza tanto en una recarga completa como
    // en un swap: si sobrevive, no hubo navegación de ningún tipo.
    await p.lista.evaluate((el) => { (el as HTMLElement).dataset.marca = 'viva'; });

    await p.botonFiltro('dev').click();

    await expect(page).toHaveURL(/\/es\/proyectos\/dev$/);
    expect(await p.filtroActivo()).toBe('dev');
    await expect(p.cardsDeTipo('qa')).toHaveCount(0);
    await expect(p.lista,
      'la página navegó: el script no interceptó el click').toHaveAttribute('data-marca', 'viva');
  });
});

test.describe('El filtro funciona sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('cada ruta sirve su propio estado desde el servidor', async ({ page }) => {
    const p = new ProyectosPage(page);

    await page.goto('/es/proyectos');
    await expect(p.cardsDeTipo('dev')).toHaveCount(0);
    await expect(p.cardsDeTipo('qa').first()).toBeVisible();

    await page.goto('/es/proyectos/dev');
    await expect(p.cardsDeTipo('qa')).toHaveCount(0);
    await expect(p.cardsDeTipo('dev').first()).toBeVisible();

    await page.goto('/es/proyectos/todos');
    await expect(p.cardsDeTipo('qa').first()).toBeVisible();
    await expect(p.cardsDeTipo('dev').first()).toBeVisible();
  });
});

test.describe('Las rutas viejas siguen respondiendo', () => {
  for (const [vieja, destino] of [
    ['/es/qa', '/es/proyectos'],
    ['/es/dev', '/es/proyectos/dev'],
    ['/en/qa', '/en/projects'],
    ['/en/dev', '/en/projects/dev'],
  ] as const) {
    test(`${vieja} lleva a ${destino}`, async ({ page }) => {
      await page.goto(vieja);
      await expect(page).toHaveURL(new RegExp(`${destino.replace(/\//g, '\\/')}$`));
    });
  }
});

test.describe('Detalle', () => {
  test('el detalle muestra el título y los seis bloques', async ({ page }) => {
    const caso = new CasoPage(page);
    await caso.abrir('es', 'suite-e2e-portfolio');
    await expect(caso.titulo).toBeVisible();
    for (const bloque of ['Contexto', 'Estrategia de prueba', 'Ejecución',
                          'Hallazgos', 'Automatización', 'Resultado y aprendizajes']) {
      await expect(page.getByRole('heading', { name: bloque })).toBeVisible();
    }
  });

  test('el cambio de idioma preserva el caso abierto', async ({ page }) => {
    const caso = new CasoPage(page);
    await caso.abrir('es', 'suite-e2e-portfolio');
    await caso.langToggle.click();
    await expect(page).toHaveURL(/\/en\/qa\/suite-e2e-portfolio$/);
    await expect(page.getByTestId('caso-detalle')).toBeVisible();
  });

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
});

// Ya no queda contenido con `ejemplo: true`, así que no hay dónde ejercitar
// el banner encendido: el test que lo hacía se invirtió en el invariante que
// ahora importa, que es que el sitio no muestre ese aviso en ninguna ruta.
// Es el equivalente en la suite E2E de `npm run check:listo`, que valida lo
// mismo sobre el frontmatter. Falsable: poner `ejemplo: true` en cualquier
// caso o proyecto hace fallar este test.
test('ninguna ruta muestra el aviso de contenido de ejemplo', async ({ page }) => {
  for (const ruta of rutasDelSitio()) {
    await page.goto(ruta);
    await expect(page.getByTestId('banner-ejemplo'),
      `${ruta} todavía muestra el aviso de contenido de ejemplo`).toHaveCount(0);
  }
});
