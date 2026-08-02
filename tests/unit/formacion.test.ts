import { describe, it, expect } from 'vitest';
import { formacion, ESTADOS_FORMACION, type EstadoFormacion } from '../../src/data/formacion';
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

  it('todas las claves existen en los dos diccionarios', () => {
    for (const item of formacion) {
      for (const campo of CLAVES_POR_ITEM) {
        for (const lang of ['es', 'en'] as const) {
          expect(ui[lang][item[campo]], `falta ${item[campo]} en ${lang}`).toBeDefined();
        }
      }
    }
  });

  // La spec descartó explícitamente declarar un nivel CEFR de inglés hasta que
  // haya certificado con URL verificable, y descartó el rango
  // "intermedio/avanzado". Este test evita que vuelvan sin que alguien lo
  // decida a propósito.
  it('el ítem de inglés no promete un nivel que no está respaldado', () => {
    const ingles = formacion.find((f) => f.id === 'ingles');
    expect(ingles, 'falta el ítem de inglés').toBeDefined();
    for (const lang of ['es', 'en'] as const) {
      const texto = ui[lang][ingles!.estadoClave];
      expect(texto).not.toMatch(/\b[ABC][12]\b/);
      expect(texto).not.toMatch(/\//);
    }
  });
});
