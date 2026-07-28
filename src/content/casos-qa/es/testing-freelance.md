---
titulo: "Testing exploratorio para un cliente freelance"
resumen: "Testing exploratorio de una tienda online chica, sin equipo de QA, priorizado por riesgo de negocio en dos días."
tags: [manual, exploratorio]
stack: [Charter de sesión, Google Sheets, DevTools]
fecha: 2026-05-10
destacado: false
estado: completo
ejemplo: true
---

## Contexto

Un cliente freelance con una tienda online armada sobre una plantilla de terceros necesitaba una revisión antes de una campaña de lanzamiento. No tenía equipo de QA ni casos escritos, y el presupuesto alcanzaba para dos días de trabajo.

## Estrategia de prueba

Con tan poco tiempo, la prioridad no podía ser cobertura sino impacto en la venta:

- **Riesgo alto:** el checkout y el cálculo de envío, porque ahí se pierde la venta si falla.
- **Riesgo alto:** el formulario de pago, incluyendo casos de tarjeta rechazada y reintento.
- **Riesgo medio:** filtros y buscador del catálogo, porque afectan la conversión pero tienen alternativa (navegar por categoría).
- **Riesgo bajo, descartado:** la sección de blog y las páginas institucionales. Decidí no probarlas: no participan del flujo de compra y un error ahí no bloquea ninguna venta.

Usé testing exploratorio con charters de sesión de 45 minutos en vez de casos formales, porque el sitio cambiaba de contenido a diario y escribir casos detallados se habría vuelto obsoleto antes de terminarlos.

## Ejecución

Dos sesiones exploratorias por área de riesgo alto, una por área de riesgo medio, registrando cada sesión en una planilla con hallazgos, evidencia y severidad.

## Hallazgos

Reemplazar por los bugs reales encontrados durante las sesiones.

## Automatización

No se automatizó nada: el alcance y el plazo no lo justificaban. Fue una decisión consciente, no una omisión.

## Resultado y aprendizajes

Reemplazar al completar la implementación.
