import { expect, type Locator } from '@playwright/test';

/**
 * Guarda contra una regresión futura a `rounded-md`, mismo espíritu que el
 * test que protege contra el retorno del scroll-snap. Se afirma sobre la
 * relación real entre el radio y la altura (mitad de la altura = pill),
 * no sobre un valor de píxeles puntual: así no importa si Tailwind emite
 * `9999px` o el `calc(infinity * 1px)` de la v4.
 */
export async function esPill(locator: Locator): Promise<void> {
  const { radio, altura } = await locator.evaluate((el) => {
    const style = getComputedStyle(el);
    const radioStr = style.borderTopLeftRadius;
    const radio = radioStr.includes('%') ? Infinity : parseFloat(radioStr);
    return { radio, altura: el.getBoundingClientRect().height };
  });
  expect(radio, `radio insuficiente para ser pill (altura ${altura}px)`).toBeGreaterThanOrEqual(altura / 2 - 1);
}
