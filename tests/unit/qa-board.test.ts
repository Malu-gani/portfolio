import { describe, it, expect } from 'vitest';
import { mapKpis, mapFeed } from '../../src/lib/qa-board';
import type { NotionPage } from '../../src/lib/notion-client';
import { NOTION_PROYECTO_PORTFOLIO_ID } from '../../src/data/qa-board-links';

const OTRO_PROYECTO_ID = '11111111-1111-1111-1111-111111111111';

function bug(overrides: {
  titulo?: string;
  estado?: string;
  prioridad?: string;
  editadoEn?: string;
  proyectoId?: string;
}): NotionPage {
  return {
    properties: {
      'ID / Titutlo del Defecto': { title: [{ plain_text: overrides.titulo ?? 'BUG de prueba' }] },
      Estado: { select: { name: overrides.estado ?? 'Reportado' } },
      Prioridad: { select: { name: overrides.prioridad ?? 'Media' } },
      PROYECTO: { relation: [{ id: overrides.proyectoId ?? NOTION_PROYECTO_PORTFOLIO_ID }] },
    },
    last_edited_time: overrides.editadoEn ?? '2026-01-01T00:00:00.000Z',
  };
}

function tarea(overrides: {
  titulo?: string;
  estado?: string;
  prioridad?: string;
  editadoEn?: string;
  proyectoId?: string;
}): NotionPage {
  return {
    properties: {
      Título: { title: [{ plain_text: overrides.titulo ?? 'US de prueba' }] },
      Estado: { select: { name: overrides.estado ?? 'Reportado' } },
      Prioridad: { select: { name: overrides.prioridad ?? 'Media' } },
      PROYTECTO: { relation: [{ id: overrides.proyectoId ?? NOTION_PROYECTO_PORTFOLIO_ID }] },
    },
    last_edited_time: overrides.editadoEn ?? '2026-01-01T00:00:00.000Z',
  };
}

describe('mapKpis', () => {
  it('cuenta bugs reportados', () => {
    const kpis = mapKpis([bug({}), bug({})], []);
    expect(kpis.bugsReportados).toBe(2);
  });

  it('calcula el porcentaje de bugs resueltos, redondeado', () => {
    const kpis = mapKpis(
      [bug({ estado: 'Resuelto' }), bug({ estado: 'Resuelto' }), bug({ estado: 'Reportado' })],
      []
    );
    expect(kpis.bugsResueltosPct).toBe(67);
  });

  it('da 0% de bugs resueltos con cero bugs, no NaN', () => {
    const kpis = mapKpis([], []);
    expect(kpis.bugsResueltosPct).toBe(0);
  });

  it('cuenta US resueltas', () => {
    const kpis = mapKpis([], [tarea({ estado: 'Resuelto' }), tarea({ estado: 'En Progreso' })]);
    expect(kpis.usResueltas).toBe(1);
  });

  it('enProgreso suma bugs + tareas con Estado distinto de Resuelto', () => {
    const kpis = mapKpis(
      [bug({ estado: 'Reportado' }), bug({ estado: 'Resuelto' })],
      [tarea({ estado: 'En Progreso' }), tarea({ estado: 'Resuelto' })]
    );
    expect(kpis.enProgreso).toBe(2);
  });
});

describe('mapFeed', () => {
  it('mezcla bugs y tareas, recorta a 4 y ordena desc por editadoEn', () => {
    const bugs = [
      bug({ titulo: 'Bug viejo', editadoEn: '2026-01-01T00:00:00.000Z' }),
      bug({ titulo: 'Bug nuevo', editadoEn: '2026-01-05T00:00:00.000Z' }),
    ];
    const tareas = [
      tarea({ titulo: 'US media', editadoEn: '2026-01-03T00:00:00.000Z' }),
      tarea({ titulo: 'US vieja', editadoEn: '2026-01-02T00:00:00.000Z' }),
      tarea({ titulo: 'US descartada', editadoEn: '2026-01-01T12:00:00.000Z' }),
    ];

    const feed = mapFeed(bugs, tareas);

    expect(feed).toHaveLength(4);
    expect(feed.map((i) => i.titulo)).toEqual(['Bug nuevo', 'US media', 'US vieja', 'US descartada']);
  });

  it('respeta el límite pasado por parámetro', () => {
    const bugs = [bug({}), bug({}), bug({})];
    const feed = mapFeed(bugs, [], 2);
    expect(feed).toHaveLength(2);
  });

  it('extrae tipo, estado, prioridad y editadoEn de cada ítem', () => {
    const feed = mapFeed([bug({ estado: 'En Progreso', prioridad: 'Alta' })], []);
    expect(feed[0]).toMatchObject({ tipo: 'bug', estado: 'En Progreso', prioridad: 'Alta' });
  });
});

describe('filtro por proyecto (vía mapKpis/mapFeed)', () => {
  it('una página de otro proyecto no debería llegar a mapKpis/mapFeed si ya se filtró antes', () => {
    // Este test documenta el contrato: mapKpis/mapFeed NO filtran por proyecto,
    // eso es responsabilidad de esDePortfolio() dentro de fetchQaBoardData().
    // Acá solo confirmamos que si les llega una página de otro proyecto (por un
    // filtrado incorrecto en la capa de arriba), igual la cuentan — así un test
    // de integración futuro sabe dónde buscar el bug si el filtro real falla.
    const kpis = mapKpis([bug({ proyectoId: OTRO_PROYECTO_ID })], []);
    expect(kpis.bugsReportados).toBe(1);
  });
});
