import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ui } from '../../src/i18n/ui';

/**
 * El CV se escribe a mano en `scripts/cv/*.html`, fuera de las colecciones y de
 * `ui.ts`, así que nada lo obligaba a decir lo mismo que el sitio: llegó a
 * publicar un nombre viejo del curso de la UTN y una cantidad de pruebas vieja.
 * Estos tests atan las dos fuentes.
 */
const IDIOMAS = ['es', 'en'] as const;
type Idioma = (typeof IDIOMAS)[number];

const leer = (...partes: string[]) => readFileSync(join(...partes), 'utf8');
const htmlCv = (lang: Idioma) => leer('scripts', 'cv', `cv-${lang}.html`);
const casoQa = (lang: Idioma) => leer('src', 'content', 'casos-qa', lang, 'gestor-operaciones.md');
// Con nombre, apellido y puesto: es lo que queda en las descargas de quien lo recibe.
const nombrePdf = (lang: Idioma) => `Juan-Manuel-Malugani-QA-Engineer-CV-${lang.toUpperCase()}.pdf`;

/** El texto que lee una persona: sin estilos, sin etiquetas, espacios colapsados. */
const textoCv = (lang: Idioma) =>
  htmlCv(lang)
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');

const sitio = leer('astro.config.mjs').match(/site:\s*'([^']+)'/)![1];
const linkedin = leer('src', 'components', 'ContactContent.astro').match(
  /https:\/\/www\.linkedin\.com\/in\/[a-z0-9-]+/,
)![0];

const enlacesDelEncabezado = (lang: Idioma) => [linkedin, `${sitio}/${lang}`];

describe.each(IDIOMAS)('CV en %s', (lang) => {
  it('nombra el curso de la UTN igual que el sitio', () => {
    expect(textoCv(lang)).toContain(ui[lang]['formacion.utn.titulo']);
  });

  it('declara la UTN como cursada y no completada, sin contradecirse', () => {
    const estado = { es: '(cursado, sin completar)', en: '(attended, not completed)' }[lang];
    expect(textoCv(lang)).toContain(`UTN FRBA ${estado}`);
  });

  it('publica la misma cantidad de pruebas que el caso de QA', () => {
    const cifra = casoQa(lang).match(/etiqueta: (?:pruebas|tests)\s+valor: "(\d+)\+?"/)![1];
    const menciones = [...textoCv(lang).matchAll(/(\d{3,})\+?[ -](?:pruebas|tests?)\b/g)].map(
      (m) => m[1],
    );
    // Dos menciones: el perfil y el proyecto.
    expect(menciones).toEqual([cifra, cifra]);
  });

  it('no declara despliegue continuo, solo integración continua', () => {
    expect(textoCv(lang)).not.toContain('CI/CD');
  });

  it('enlaza LinkedIn y el portfolio en su idioma', () => {
    for (const url of enlacesDelEncabezado(lang)) {
      expect(htmlCv(lang)).toContain(`href="${url}"`);
    }
  });

  it('se publica solo con nombre, apellido y puesto en el archivo', () => {
    expect(existsSync(join('public', 'cv', nombrePdf(lang)))).toBe(true);
    expect(existsSync(join('public', 'cv', `cv-${lang}.pdf`))).toBe(false);
  });

  // La dirección anterior ya circuló en enlaces compartidos.
  it('la dirección anterior redirige al archivo nuevo', () => {
    const { redirects } = JSON.parse(leer('vercel.json'));
    expect(redirects).toContainEqual({
      source: `/cv/cv-${lang}.pdf`,
      destination: `/cv/${nombrePdf(lang)}`,
      permanent: true,
    });
  });

  // El PDF es un binario versionado: editar el HTML no lo cambia hasta correr
  // `node scripts/gen-cv-pdfs.cjs`. Las anotaciones de enlace quedan sin
  // comprimir, así que sirven de testigo de que se regeneró.
  it('el PDF publicado lleva esos enlaces', () => {
    const pdf = readFileSync(join('public', 'cv', nombrePdf(lang)), 'latin1');
    for (const url of enlacesDelEncabezado(lang)) {
      expect(pdf).toContain(`/URI (${url})`);
    }
  });
});

describe.each(IDIOMAS)('caso de QA de FolioTracker en %s', (lang) => {
  it('anuncia más de 400 pruebas en el resumen y en la métrica', () => {
    const texto = casoQa(lang);
    expect(texto).toMatch(/etiqueta: (?:pruebas|tests)\s+valor: "400\+"/);
    expect(texto.match(/^resumen: "(.*)"$/m)![1]).toContain('400');
  });

  // Cifras de la corrida completa de CI de FolioTracker del 25/11/2026. Las 275
  // quedan en el relato como lo que fueron: el cierre de julio.
  it('explica en el detalle la cifra actual y su composición', () => {
    const detalle = casoQa(lang).split(/^---$/m)[2];
    for (const cifra of ['275', '428', '258', '161']) {
      expect(detalle).toContain(cifra);
    }
  });
});
