import { describe, it, expect } from 'vitest';
import { formacion, ESTADOS_FORMACION } from '../../src/data/formacion';
import { ui } from '../../src/i18n/ui';

const CLAVES_POR_ITEM = ['tituloClave', 'institucionClave', 'detalleClave', 'estadoClave'] as const;

describe('formacion', () => {
  it('declara los cuatro ítems', () => {
    expect(formacion).toHaveLength(4);
  });

  it('todo ítem tiene un estado válido', () => {
    for (const item of formacion) {
      expect(ESTADOS_FORMACION, `estado inválido en ${item.id}`).toContain(item.estado);
    }
  });

  it('no hay ids repetidos', () => {
    const ids = formacion.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // El estado se declara en texto, no solo por color: sin una clave de estado
  // el ítem quedaría comunicándose únicamente por el color de su badge, que es
  // exactamente lo que el resto del sitio no hace.
  it('todo ítem declara su estado en texto en los dos idiomas', () => {
    for (const item of formacion) {
      for (const lang of ['es', 'en'] as const) {
        const texto = ui[lang][item.estadoClave];
        expect(texto, `${item.id} no declara estado en ${lang}`).toBeTruthy();
        expect(texto.trim().length).toBeGreaterThan(0);
      }
    }
  });

  // La spec descartó explícitamente declarar un nivel CEFR de inglés hasta que
  // haya certificado con URL verificable, y descartó el rango
  // "intermedio/avanzado". Este test evita que vuelvan sin que alguien lo
  // decida a propósito. Recorre los cuatro campos porque un "B2" colado en
  // `detalleClave` es tan promesa como uno en `estadoClave`.
  it('el ítem de inglés no promete un nivel que no está respaldado', () => {
    const ingles = formacion.find((f) => f.id === 'ingles');
    expect(ingles, 'falta el ítem de inglés').toBeDefined();
    for (const campo of CLAVES_POR_ITEM) {
      for (const lang of ['es', 'en'] as const) {
        const texto = ui[lang][ingles![campo]];
        expect(texto).not.toMatch(/\b[ABC][12]\b/);
        expect(texto).not.toMatch(/\//);
      }
    }
  });

  // La descripción es opcional: bootcamp/istqb/utn explican qué aportan al
  // perfil de QA, inglés no la suma porque ya está cubierto por `detalle`.
  it('bootcamp, istqb y utn declaran una descripción con contenido en los dos idiomas', () => {
    for (const id of ['bootcamp', 'istqb', 'utn'] as const) {
      const item = formacion.find((f) => f.id === id);
      expect(item?.descripcionClave, `${id} sin descripcionClave`).toBeDefined();
      for (const lang of ['es', 'en'] as const) {
        const texto = ui[lang][item!.descripcionClave!];
        expect(texto?.trim().length, `${id} sin descripción en ${lang}`).toBeGreaterThan(0);
      }
    }
  });

  it('inglés no declara descripción (ya cubierta por el detalle)', () => {
    const ingles = formacion.find((f) => f.id === 'ingles');
    expect(ingles?.descripcionClave).toBeUndefined();
  });

  it('UTN muestra el título y la carga horaria reales del programa', () => {
    expect(ui.es['formacion.utn.titulo']).toBe('Experto Universitario en Mercado de Capitales');
    expect(ui.en['formacion.utn.titulo']).toBe('University Expert in Capital Markets');
    expect(ui.es['formacion.utn.detalle']).toBe('165 horas · 22 unidades · 2022');
    expect(ui.en['formacion.utn.detalle']).toBe('165 hours · 22 units · 2022');
  });

  it('los estados de ISTQB y UTN no suenan negativos ni prometen de más', () => {
    expect(ui.es['formacion.estado.examenPendiente']).toBe('Syllabus V4.0 completo · examen pendiente');
    expect(ui.en['formacion.estado.examenPendiente']).toBe('Syllabus V4.0 complete · exam pending');
    expect(ui.es['formacion.estado.sinCompletar']).toBe('Cursado');
    expect(ui.en['formacion.estado.sinCompletar']).toBe('Attended');
  });
});
