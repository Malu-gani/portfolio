export interface Ordenable {
  fecha: Date;
  datos: { destacado: boolean };
}

/**
 * `destacado` ya no decide quién entra —la home muestra todo— así que decide el
 * orden: los destacados primero, el resto por fecha descendente. Un campo
 * declarado en el esquema sin consumidor es el problema que ya tuvo `demo`, así
 * que o se le da uso o se saca.
 *
 * Vive acá y no dentro del componente para poder verificarlo desde un test
 * unitario con datos construidos: con el contenido real de hoy los dos
 * destacados además son los más recientes, así que el orden por fecha sola da
 * el mismo resultado y ninguna aserción sobre el listado renderizado podría
 * distinguir una implementación correcta de una que ignore `destacado`.
 */
export function ordenarPorDestacadoYFecha<T extends Ordenable>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.datos.destacado !== b.datos.destacado) return a.datos.destacado ? -1 : 1;
    return b.fecha.getTime() - a.fecha.getTime();
  });
}
