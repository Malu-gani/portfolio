import type { NotionPage } from './notion-client';
import { queryNotionDatabase } from './notion-client';
import { NOTION_DB_BUGS_ID, NOTION_DB_TAREAS_ID, NOTION_PROYECTO_PORTFOLIO_ID } from '../data/qa-board-links';

export type TipoItem = 'bug' | 'us';
export type EstadoQaBoard = 'Reportado' | 'En Progreso' | 'Resuelto';

export interface QaBoardKpis {
  bugsReportados: number;
  bugsResueltosPct: number;
  usResueltas: number;
  enProgreso: number;
}

export interface QaBoardFeedItem {
  tipo: TipoItem;
  titulo: string;
  estado: EstadoQaBoard;
  prioridad: string;
  editadoEn: string;
}

export interface QaBoardData {
  kpis: QaBoardKpis;
  feed: QaBoardFeedItem[];
}

function esDePortfolio(pagina: NotionPage, propiedadRelacion: string): boolean {
  const relacion = pagina.properties[propiedadRelacion]?.relation ?? [];
  return relacion.some((r: { id: string }) => r.id === NOTION_PROYECTO_PORTFOLIO_ID);
}

function extraerTitulo(pagina: NotionPage, propiedadTitulo: string): string {
  return pagina.properties[propiedadTitulo]?.title?.[0]?.plain_text ?? '';
}

function extraerSelect(pagina: NotionPage, propiedad: string): string {
  return pagina.properties[propiedad]?.select?.name ?? '';
}

export function mapKpis(bugsPortfolio: NotionPage[], tareasPortfolio: NotionPage[]): QaBoardKpis {
  const bugsReportados = bugsPortfolio.length;
  const bugsResueltos = bugsPortfolio.filter((b) => extraerSelect(b, 'Estado') === 'Resuelto').length;
  const bugsResueltosPct = bugsReportados === 0 ? 0 : Math.round((bugsResueltos / bugsReportados) * 100);
  const usResueltas = tareasPortfolio.filter((t) => extraerSelect(t, 'Estado') === 'Resuelto').length;
  const enProgreso =
    bugsPortfolio.filter((b) => extraerSelect(b, 'Estado') !== 'Resuelto').length +
    tareasPortfolio.filter((t) => extraerSelect(t, 'Estado') !== 'Resuelto').length;

  return { bugsReportados, bugsResueltosPct, usResueltas, enProgreso };
}

export function mapFeed(bugsPortfolio: NotionPage[], tareasPortfolio: NotionPage[], limite = 4): QaBoardFeedItem[] {
  const items: QaBoardFeedItem[] = [
    ...bugsPortfolio.map((b) => ({
      tipo: 'bug' as const,
      titulo: extraerTitulo(b, 'ID / Titutlo del Defecto'),
      estado: extraerSelect(b, 'Estado') as EstadoQaBoard,
      prioridad: extraerSelect(b, 'Prioridad'),
      editadoEn: b.last_edited_time,
    })),
    ...tareasPortfolio.map((t) => ({
      tipo: 'us' as const,
      titulo: extraerTitulo(t, 'Título'),
      estado: extraerSelect(t, 'Estado') as EstadoQaBoard,
      prioridad: extraerSelect(t, 'Prioridad'),
      editadoEn: t.last_edited_time,
    })),
  ];
  return items.sort((a, b) => b.editadoEn.localeCompare(a.editadoEn)).slice(0, limite);
}

let cache: Promise<QaBoardData> | null = null;

/** Memoizado a nivel de módulo: /es/ y /en/ comparten una sola consulta a Notion por build. */
export function fetchQaBoardData(): Promise<QaBoardData> {
  if (!cache) {
    cache = (async () => {
      const [bugs, tareas] = await Promise.all([
        queryNotionDatabase(NOTION_DB_BUGS_ID),
        queryNotionDatabase(NOTION_DB_TAREAS_ID),
      ]);
      const bugsPortfolio = bugs.filter((b) => esDePortfolio(b, 'PROYECTO'));
      const tareasPortfolio = tareas.filter((t) => esDePortfolio(t, 'PROYTECTO'));
      return {
        kpis: mapKpis(bugsPortfolio, tareasPortfolio),
        feed: mapFeed(bugsPortfolio, tareasPortfolio),
      };
    })();
  }
  return cache;
}
