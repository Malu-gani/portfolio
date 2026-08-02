import type { ClaveUI } from '../i18n/ui';

/**
 * La formación vive acá y no dentro de `Formacion.astro` para que se pueda
 * verificar desde un test unitario que ningún ítem quede sin estado o con un
 * estado inválido. Es el mismo patrón que `src/data/stack.ts`.
 *
 * Cada texto es una clave de i18n y no un string suelto: la sección se
 * renderiza en los dos idiomas, y el test unitario puede afirmar que ninguna
 * clave falta en ninguno de los dos diccionarios.
 *
 * El estado se declara en texto, nunca solo por color:
 *   completado        — terminado, sin nada pendiente
 *   examen-pendiente  — el curso está completo, la certificación no
 *   sin-completar     — se cursó y no se terminó; se dice así y nada más
 *   nivel             — no hay nada que completar, se declara un nivel
 */

export type EstadoFormacion = 'completado' | 'examen-pendiente' | 'sin-completar' | 'nivel';

export const ESTADOS_FORMACION: EstadoFormacion[] = [
  'completado',
  'examen-pendiente',
  'sin-completar',
  'nivel',
];

export interface ItemFormacion {
  id: string;
  tituloClave: ClaveUI;
  institucionClave: ClaveUI;
  detalleClave: ClaveUI;
  estadoClave: ClaveUI;
  estado: EstadoFormacion;
}

export const formacion: ItemFormacion[] = [
  {
    id: 'bootcamp',
    tituloClave: 'formacion.bootcamp.titulo',
    institucionClave: 'formacion.bootcamp.institucion',
    detalleClave: 'formacion.bootcamp.detalle',
    estadoClave: 'formacion.estado.completado',
    estado: 'completado',
  },
  {
    id: 'istqb',
    tituloClave: 'formacion.istqb.titulo',
    institucionClave: 'formacion.istqb.institucion',
    detalleClave: 'formacion.istqb.detalle',
    estadoClave: 'formacion.estado.examenPendiente',
    estado: 'examen-pendiente',
  },
  // El curso de la UTN entra porque la pieza destacada del portfolio es una
  // aplicación financiera: 94 horas de mercado de capitales explican por qué se
  // pudo modelar y testear ese dominio. Se declara "cursado sin completar" y
  // nada más; estar en condiciones de rendir el examen de idóneo es una
  // afirmación a futuro, repreguntable, y no aporta a un puesto de QA.
  {
    id: 'utn',
    tituloClave: 'formacion.utn.titulo',
    institucionClave: 'formacion.utn.institucion',
    detalleClave: 'formacion.utn.detalle',
    estadoClave: 'formacion.estado.sinCompletar',
    estado: 'sin-completar',
  },
  // "Intermedio", sin rango y sin CEFR. Es lo que sostiene la evidencia
  // disponible al 02/08/2026: recepción sólida, producción sin determinar. Un
  // rango no es un nivel, y "avanzado" tendría un costo inmediato y concreto en
  // la primera entrevista en inglés.
  {
    id: 'ingles',
    tituloClave: 'formacion.ingles.titulo',
    institucionClave: 'formacion.ingles.institucion',
    detalleClave: 'formacion.ingles.detalle',
    estadoClave: 'formacion.estado.intermedio',
    estado: 'nivel',
  },
];
