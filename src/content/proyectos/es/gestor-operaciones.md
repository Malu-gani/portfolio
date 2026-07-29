---
titulo: "Diario de trading y gestor de riesgo"
resumen: "Aplicación web para registrar operaciones de cripto y acciones, con saldos por cuenta y control de riesgo antes de entrar."
stack: [Next.js, TypeScript, Supabase, PostgreSQL, Tailwind]
fecha: 2026-07-29
destacado: true
ejemplo: false
---

## Descripción

Una aplicación para llevar el registro de operaciones de trading y, sobre todo, para decidir el tamaño de cada posición antes de abrirla. Permite manejar varios portafolios, con el capital separado en cuentas por divisa y mercado (ARS, USD, USDT spot y USDT futuros) que nunca se mezclan ni se convierten entre sí.

Para cada operación calcula el tamaño de posición, la pérdida máxima proyectada y el ratio riesgo/beneficio, y clasifica el riesgo con umbrales distintos según la clase de activo: lo que es riesgo bajo en acciones es riesgo crítico en futuros apalancados.

## Motivación

La construí porque llevaba el registro en planillas y el problema no era anotar las operaciones, era calcular el riesgo antes de entrar. Hacer esa cuenta a mano, con apalancamiento de por medio y en el momento en que hay que decidir rápido, es exactamente el escenario donde uno se equivoca.

También me interesaba que las reglas de negocio no vivieran solo en el código. La lógica financiera está documentada aparte, con las fórmulas escritas en prosa, y el código apunta a ese documento como fuente de verdad. Esa decisión resultó ser la que después hizo posible escribir el plan de pruebas.

## Decisiones técnicas

Las escrituras que mueven capital no se hacen con `insert` o `update` desde el cliente: pasan por funciones transaccionales de PostgreSQL. Abrir una operación valida los fondos, inserta el registro y debita el saldo dentro de una sola transacción, así que no puede quedar a medias. Antes de eso había una escritura doble no atómica al cerrar operaciones, que es justo el tipo de cosa que descuadra un saldo sin dejar rastro.

El aislamiento entre usuarios está en la base de datos, con Row Level Security en cada tabla, y no en la capa de aplicación. Es una garantía del motor: aunque el cliente pidiera datos ajenos, no los recibe.

## Estado actual

En desarrollo activo. Los flujos de operaciones, saldos por cuenta, multi-portafolio y plazos fijos están implementados; el módulo de alertas está en el modelo de datos pero todavía no construido.

**Todavía no tiene suite de pruebas automatizada** — el plan de pruebas está escrito y publicado en el carril de QA de este portfolio, pero la ejecución está pendiente. El repositorio es privado por ahora; lo voy a enlazar acá cuando termine la suite y lo haga público.
