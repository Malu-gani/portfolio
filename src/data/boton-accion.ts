/**
 * Fuente única de las clases y los íconos del botón de acción tipo pill que
 * usa todo el sitio. Vive como `.ts` plano (no un componente `.astro`) para
 * poder importarse también desde `CopyEmail.tsx`, el único caso en React.
 *
 * El color (borde/texto acento vs. neutro) no vive acá: no todos los
 * botones tienen la misma jerarquía visual, así que lo agrega cada call
 * site por encima de estas clases base.
 */

export const claseAccionBoton = {
  grande:
    'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors',
  chica:
    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
} as const;

export type VarianteAccion = 'ir' | 'descargar' | 'copiar' | 'bajar';

/** Trazo, no relleno: no hay marca que representar, son pictogramas propios. */
export const iconosAccion: Record<VarianteAccion, string> = {
  ir: '<path d="M7 17L17 7M17 7H10M17 7V14" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>',
  descargar:
    '<path d="M12 3v12m0 0l-5-5m5 5l5-5M4 20h16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>',
  copiar:
    '<rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.75"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>',
  /* Distinta de "descargar": sin la barra de bandeja, es un scroll a otra
     sección de la misma página, no una descarga de archivo. */
  bajar: '<path d="M12 5v14m0 0l-6-6m6 6l6-6" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>',
};
