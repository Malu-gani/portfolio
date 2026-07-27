import { useState } from 'react';

interface Props {
  email: string;
  textoCopiar: string;
  textoCopiado: string;
}

export default function CopyEmail({ email, textoCopiar, textoCopiado }: Props) {
  const [copiado, setCopiado] = useState(false);

  async function copiar(): Promise<void> {
    await navigator.clipboard.writeText(email);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

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
        {copiado ? textoCopiado : textoCopiar}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copiado ? textoCopiado : ''}
      </span>
    </div>
  );
}
