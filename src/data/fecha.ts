import type { Lang } from '../i18n/ui';

/**
 * Las fechas del contenido (`fecha: 2026-07-30`) se leen como medianoche UTC,
 * así que se muestran también en UTC: sin fijar la zona, un build al oeste de
 * Greenwich mostraba el día anterior.
 */
export function formatearFecha(fecha: Date, lang: Lang): string {
  return fecha.toLocaleDateString(lang === 'es' ? 'es-AR' : 'en-US', { timeZone: 'UTC' });
}
