---
titulo: "QA de un gestor de operaciones internas"
resumen: "Casos manuales y automatización de API para un gestor de operaciones aún en desarrollo, con foco en flujos críticos."
tags: [manual, automation, api]
stack: [Postman, Playwright, TypeScript, PostgreSQL]
fecha: 2026-07-20
destacado: true
estado: en-progreso
ejemplo: true
---

## Contexto

Aplicación interna para gestionar turnos, inventario y reportes de un pequeño equipo de operaciones. Se desarrolla en paralelo con su propia suite de pruebas, así que este caso se actualiza a medida que avanza el producto.

## Estrategia de prueba

Con el producto todavía en construcción, la matriz de riesgo se define por dónde duele más un dato incorrecto:

- **Riesgo alto:** la asignación de turnos, porque un solapamiento no detectado se traduce en un puesto sin cubrir.
- **Riesgo alto:** el descuento de stock al cerrar una operación, porque un desfasaje ahí contamina los reportes financieros.
- **Riesgo medio:** la generación de reportes, porque los errores son visibles y se pueden corregir antes de que impacten a un tercero.
- **Riesgo bajo, descartado por ahora:** la personalización de la interfaz (temas, orden de columnas). No se prueba en esta etapa porque el módulo todavía no está congelado y volver a probarlo en cada cambio de diseño sería desperdiciar esfuerzo.

## Ejecución

Casos manuales sobre los flujos de riesgo alto y medio antes de cada entrega, ejecutados contra un ambiente de staging con datos de prueba representativos.

## Hallazgos

Reemplazar por los bugs reales encontrados durante el desarrollo.

## Automatización

Se está automatizando la API de turnos e inventario con Playwright a nivel de request, porque son los endpoints que más cambian y los que un cambio de contrato rompe sin avisar en la interfaz.

## Resultado y aprendizajes

Reemplazar al completar la implementación.
