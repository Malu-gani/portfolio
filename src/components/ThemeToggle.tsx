import { useEffect, useState } from 'react';

type Tema = 'light' | 'dark';

interface Props {
  etiqueta: string;
}

export default function ThemeToggle({ etiqueta }: Props) {
  const [tema, setTema] = useState<Tema | null>(null);

  useEffect(() => {
    setTema((document.documentElement.dataset.theme as Tema | undefined) ?? 'light');
  }, []);

  function alternar(): void {
    const nuevo: Tema = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nuevo;
    localStorage.setItem('theme', nuevo);
    setTema(nuevo);
  }

  return (
    <button
      type="button"
      data-testid="theme-toggle"
      aria-label={etiqueta}
      aria-pressed={tema === 'dark'}
      onClick={alternar}
      className="rounded-md border border-border p-2 text-text hover:bg-surface"
    >
      <span aria-hidden="true">{tema === 'dark' ? '☾' : '☀'}</span>
    </button>
  );
}
