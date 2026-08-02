import type { Lang } from '../i18n/ui';

/**
 * Los campos que se piden en un reporte de defecto, y los que no.
 *
 * No se piden severidad ni prioridad: las estima quien tría, no quien reporta
 * — pedirlas invita a discutir la etiqueta en vez de describir el problema. No
 * se pide captura obligatoria: sube la fricción y la mayoría de los defectos
 * de este sitio se describen mejor en texto.
 */
export const camposReporte: Record<Lang, string[]> = {
  es: [
    'Qué pasó',
    'Pasos para reproducir',
    'Qué esperaba que pasara',
    'Qué pasó en cambio',
    'Navegador y sistema operativo',
    'Tamaño de pantalla',
  ],
  en: [
    'What happened',
    'Steps to reproduce',
    'What you expected',
    'What happened instead',
    'Browser and operating system',
    'Screen size',
  ],
};

/** La plantilla en texto plano, lista para pegar donde sea. */
export function plantillaReporte(lang: Lang): string {
  return camposReporte[lang].map((campo) => `**${campo}**\n\n`).join('\n');
}
