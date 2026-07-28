import { useState } from 'react';

interface Props {
  email: string;
  textoCopiar: string;
  textoCopiado: string;
  textoError: string;
}

type Estado = 'inicial' | 'copiado' | 'error';

export default function CopyEmail({ email, textoCopiar, textoCopiado, textoError }: Props) {
  const [estado, setEstado] = useState<Estado>('inicial');

  async function copiar(): Promise<void> {
    try {
      await navigator.clipboard.writeText(email);
      setEstado('copiado');
    } catch {
      setEstado('error');
    }
    setTimeout(() => setEstado('inicial'), 2000);
  }

  const textoBoton = estado === 'copiado' ? textoCopiado : estado === 'error' ? textoError : textoCopiar;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href={`mailto:${email}`}
        data-testid="email-texto"
        className="font-mono text-lg text-accent hover:underline"
      >
        {email}
      </a>
      <button
        type="button"
        data-testid="email-copiar"
        onClick={copiar}
        className="rounded-md border border-border px-3 py-1 text-sm hover:bg-surface"
      >
        {textoBoton}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {estado !== 'inicial' ? textoBoton : ''}
      </span>
    </div>
  );
}
