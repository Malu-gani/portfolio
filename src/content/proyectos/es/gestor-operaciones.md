---
titulo: "Diario de trading y gestor de riesgo"
resumen: "Aplicación web para registrar operaciones de cripto y acciones, con saldos por cuenta y control de riesgo antes de entrar."
stack: [Next.js, TypeScript, Supabase, PostgreSQL, Tailwind]
fecha: 2026-07-30
destacado: true
ejemplo: false
repo: "https://github.com/Malu-gani/Registro-de-Operaciones"
demo: "https://registro-de-operaciones-chi.vercel.app"
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

Tiene suite de pruebas automatizada y corre en integración continua. El diseño de esa suite, los defectos que encontró y qué se decidió no probar están en el caso del carril de QA de este portfolio.

## Despliegue y operación

Está desplegada y en uso, con un costo total de cero. El hosting es Vercel en su plan gratuito: el entorno de producción sigue la rama principal, así que cada cambio integrado se publica solo, y cada pull request recibe su propia URL de vista previa. La base de datos y la autenticación corren en la capa gratuita de Supabase, y los mails de confirmación salen por SMTP de Gmail.

La decisión de arquitectura que más trabajo dio fue la confirmación por email. El flujo estándar guarda un verificador en una cookie del navegador donde arrancó el registro, así que registrarse en la computadora y abrir el mail en el celular fallaba — que es exactamente lo que hace cualquiera. Cambiarlo por un flujo basado en un token que viaja en el propio enlace eliminó esa dependencia, a cambio de tener que escribir las plantillas de mail y un manejador de ruta propio para la confirmación.
