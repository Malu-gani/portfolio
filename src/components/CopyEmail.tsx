import { useState } from 'react';
import { claseAccionBoton } from '../data/boton-accion';

// Ícono de copiar como JSX fijo: es el único caso en React del sitio y no
// vale un dangerouslySetInnerHTML por un pictograma estático. Mismo trazo
// que `iconosAccion.copiar` en boton-accion.ts.
function IconoCopiar() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
        className={`${claseAccionBoton.chica} border-border text-muted hover:border-accent hover:text-accent`}
      >
        <IconoCopiar />
        <span>{textoBoton}</span>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {estado !== 'inicial' ? textoBoton : ''}
      </span>
    </div>
  );
}
