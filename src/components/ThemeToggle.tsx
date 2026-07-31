import { useEffect, useState } from 'react';

type Tema = 'light' | 'dark';

interface Props {
  etiqueta: string;
  etiquetaClaro: string;
  etiquetaOscuro: string;
}

function IconoSol() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function IconoLuna() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/**
 * Control segmentado de dos píldoras (Claro | Oscuro), replicando el toggle del
 * pie del sidebar del gestor de operaciones. Ambas píldoras están siempre en el
 * DOM y solo cambian de clase: no se reemplaza texto por JS, así que la
 * traducción del navegador no puede romper el árbol de React.
 *
 * El texto se oculta por debajo de `sm` y quedan solo los íconos: con las cinco
 * entradas del menú más el toggle de idioma, el header no entra en el ancho de
 * un teléfono si las píldoras muestran su etiqueta.
 *
 * La preferencia del sistema (`prefers-color-scheme`) solo decide el tema
 * inicial, y la resuelve el script inline de BaseLayout antes de pintar. Al
 * elegir un lado acá se fija el tema explícito en localStorage y, desde
 * entonces, el del sistema deja de influir — misma semántica que el gestor,
 * donde 'auto' existe en el modelo pero tampoco se ofrece desde la UI.
 */
export default function ThemeToggle({ etiqueta, etiquetaClaro, etiquetaOscuro }: Props) {
  const [tema, setTema] = useState<Tema>('light');

  useEffect(() => {
    setTema((document.documentElement.dataset.theme as Tema | undefined) ?? 'light');
  }, []);

  function elegir(nuevo: Tema): void {
    if (nuevo === tema) return;
    document.documentElement.dataset.theme = nuevo;
    localStorage.setItem('theme', nuevo);
    setTema(nuevo);
  }

  const pildora =
    'flex items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors';
  const activa = 'bg-bg text-text';
  const inactiva = 'text-muted hover:text-text';

  return (
    <div
      role="group"
      aria-label={etiqueta}
      data-testid="theme-toggle"
      className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1"
    >
      <button
        type="button"
        data-testid="theme-claro"
        aria-pressed={tema === 'light'}
        onClick={() => elegir('light')}
        className={`${pildora} ${tema === 'light' ? activa : inactiva}`}
      >
        <IconoSol />
        <span className="hidden sm:inline">{etiquetaClaro}</span>
      </button>
      <button
        type="button"
        data-testid="theme-oscuro"
        aria-pressed={tema === 'dark'}
        onClick={() => elegir('dark')}
        className={`${pildora} ${tema === 'dark' ? activa : inactiva}`}
      >
        <IconoLuna />
        <span className="hidden sm:inline">{etiquetaOscuro}</span>
      </button>
    </div>
  );
}
