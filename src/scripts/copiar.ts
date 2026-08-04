/**
 * Copiar al portapapeles en vanilla, compartido por el atajo de email del hero
 * y por la sección de reportar. El island de React `CopyEmail` no lo usa: es
 * otro modelo de ejecución y forzarlo a compartir código complica las dos
 * puntas sin beneficio.
 *
 * El enganche es por delegación en `document` para sobrevivir a las view
 * transitions, que reemplazan los nodos.
 */
export interface OpcionesCopiar {
  /** Selector del elemento que dispara la copia. */
  selectorDisparador: string;
  /** Qué texto copiar, dado el disparador. */
  texto: (disparador: HTMLElement) => string;
  alCopiar: (disparador: HTMLElement) => void;
  /**
   * Qué hacer si el portapapeles existía pero rechazó la escritura. No puede
   * quedarse callado ni decir que copió: mentir sobre el resultado es peor que
   * no copiar.
   */
  alFallar: (disparador: HTMLElement) => void;
  /**
   * Qué hacer si el portapapeles no existe (contexto no seguro, o navegador
   * viejo). Si no se pasa, no se intercepta el clic y el elemento hace su
   * acción por defecto -que en el hero es abrir el cliente de correo desde el
   * `mailto:`-. Un disparador sin acción por defecto propia, como un
   * `<button>`, tiene que pasarlo: si no, el clic no hace nada y no avisa
   * nada, que es peor que fallar con un mensaje.
   */
  sinPortapapeles?: (disparador: HTMLElement) => void;
}

export function engancharCopiar(opciones: OpcionesCopiar): void {
  document.addEventListener('click', async (evento) => {
    const objetivo = evento.target as Element | null;
    const disparador = objetivo?.closest<HTMLElement>(opciones.selectorDisparador);
    if (!disparador) return;
    if (!navigator.clipboard) {
      if (!opciones.sinPortapapeles) return;
      evento.preventDefault();
      opciones.sinPortapapeles(disparador);
      return;
    }

    evento.preventDefault();
    try {
      await navigator.clipboard.writeText(opciones.texto(disparador));
    } catch {
      opciones.alFallar(disparador);
      return;
    }
    opciones.alCopiar(disparador);
  });
}
