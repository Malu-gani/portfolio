---
titulo: "Plan de pruebas de un diario de trading"
resumen: "Estrategia de prueba basada en riesgo para una app de registro de operaciones y gestión de riesgo, escrita antes de automatizar."
tags: [manual, automation, api]
stack: [Next.js, Supabase, PostgreSQL, TypeScript]
fecha: 2026-07-29
destacado: true
estado: en-progreso
ejemplo: false
---

## Contexto

Una aplicación web propia para registrar operaciones de trading (cripto y acciones) y controlar el riesgo antes de entrar a cada operación. Multi-portafolio, con saldos separados por cuenta (ARS, USD, USDT spot y USDT futuros), cálculo de ratio riesgo/beneficio y un semáforo que clasifica cada operación por nivel de riesgo.

Es una app financiera personal: no maneja dinero de terceros, pero sí calcula los números con los que después se decide operar. Un cálculo mal hecho que se muestra con confianza es peor que un error visible, porque nadie lo va a cuestionar.

**Este caso documenta el plan de pruebas, no su ejecución.** La app está en desarrollo activo y todavía no tiene suite automatizada; lo que sigue es la estrategia con la que voy a atacarla, publicada antes de escribir el primer test. Cuando la suite exista, este caso se actualiza con hallazgos y resultados reales.

## Estrategia de prueba

Prioricé por consecuencia de la falla, no por dificultad de implementación. En una app de riesgo el peor escenario no es que algo se rompa: es que devuelva un número plausible pero equivocado.

- **Riesgo crítico — cálculos de riesgo.** Las fórmulas de tamaño de posición, pérdida máxima y ratio riesgo/beneficio son el motivo de existir de la app. Un error acá se propaga a toda decisión que se tome mirando la pantalla, sin ninguna señal de que algo anda mal.
- **Riesgo crítico — atomicidad de los saldos.** Abrir y cerrar operaciones mueve el capital disponible de cada cuenta a través de funciones transaccionales de Postgres. Una escritura que quede a medias deja el saldo descuadrado sin dejar rastro de por qué.
- **Riesgo crítico — aislamiento entre usuarios.** El acceso a datos está restringido por Row Level Security. Una política mal escrita significa que un usuario vea las operaciones de otro; es la única falla del sistema con consecuencias fuera de la propia cuenta.
- **Riesgo alto — umbrales del semáforo.** Los cortes difieren por clase de activo y son inclusive en su límite superior. Es un problema de valores de borde de manual, y el tipo de cosa que un test mal escrito da por buena.
- **Riesgo medio — separación de divisas.** ARS, USD y USDT nunca se suman ni se convierten entre sí. Sumarlas produciría un total con apariencia de correcto y sin sentido económico.
- **Riesgo bajo — ciclo de vida de los plazos fijos.** El vencimiento se deriva comparando fechas en el cliente, sin proceso de servidor. Falla de forma visible y no arrastra dinero.

**Qué decidí no probar, y por qué:**

- **Las APIs de datos de mercado** (CoinGecko, Yahoo Finance): son de terceros, con límite de peticiones y valores que cambian por definición. Testearlas de verdad haría la suite lenta y no determinista. Lo que sí voy a probar es cómo reacciona la app cuando esa respuesta no llega o llega mal.
- **La tabla `alertas`**: está en el modelo de datos pero no implementada. No se prueba lo que no existe.
- **Detalles de presentación de las listas** (paginación, colapsar y expandir): son de bajo impacto y cambian seguido; automatizarlos ahora sería mantener tests que se rompen sin que haya nada roto.

## Ejecución

Todavía no ejecutada — es lo que hace que este caso esté en progreso y no completo.

El orden previsto arranca por lo de adentro hacia afuera, porque es donde la relación entre esfuerzo y riesgo cubierto es mejor:

1. **Pruebas unitarias sobre las funciones de cálculo de riesgo.** Son funciones puras, sin base de datos ni interfaz: se prueban rápido, corren en milisegundos y cubren el riesgo crítico número uno. Acá entran los valores de borde del semáforo y la validación direccional del stop loss.
2. **Pruebas de integración contra las funciones transaccionales de Postgres**, con una base de prueba: abrir sin fondos suficientes, cerrar parcialmente, liquidar dos veces el mismo plazo fijo.
3. **Pruebas de aislamiento entre usuarios**: dos usuarios distintos, verificar que ninguno alcanza los datos del otro.
4. **Un puñado de pruebas end-to-end** sobre los caminos completos que más se usan, no sobre todo. El E2E es el nivel más caro de mantener; lo reservo para los flujos donde el valor está en que las piezas funcionen juntas.

## Hallazgos

Ninguno todavía: no se ejecutaron pruebas. Prefiero publicar el plan vacío de hallazgos antes que llenarlo con bugs inventados.

Sí tengo identificados de antemano los casos que espero que duelan, por lectura del código y de la documentación de negocio:

| Caso | Por qué lo espero |
|---|---|
| Precio de entrada igual al stop loss | El riesgo por unidad da cero y el tamaño de posición tiende a infinito. La implementación dice lanzar un error controlado; hay que verificar que no se escape un `Infinity` o un `NaN` a la pantalla. |
| Stop loss del lado equivocado | Un "stop loss" por encima de la entrada en una operación long no es un stop loss: protege ganancia. Debe rechazarse antes de calcular nada. |
| 3.00% contra 3.01% en acciones | Los niveles del semáforo son inclusive en su límite superior. Un `<` en lugar de un `<=` mueve la frontera sin romper ningún test que no mire justo ahí. |
| Cierre parcial de una operación | Solo debe acreditarse la porción cerrada más su resultado. Es la operación con más aritmética y más estados intermedios. |
| Stop loss y take profit ausentes | Ambos son opcionales. Las métricas que dependen de ellos no deben calcularse ni mostrarse en cero. |

## Automatización

La estrategia es concentrar la automatización en el nivel más barato que cubra cada riesgo, y no repetir la misma verificación en varios niveles.

Los cálculos de riesgo se prueban como funciones puras porque no necesitan nada más: es donde un test cuesta segundos y atrapa el error más caro. Las reglas que viven en la base de datos —validación de fondos, atomicidad, aislamiento por usuario— se prueban contra una base real, porque son garantías del motor y no se pueden simular sin dejar de probar lo que importa. El end-to-end queda para los recorridos completos, deliberadamente pocos.

Lo que no pienso automatizar es la validación de que los números tengan sentido financiero. Que una fórmula esté bien implementada lo verifica un test; que sea la fórmula correcta lo verifica leer la documentación de negocio y hacer la cuenta a mano. Son dos preguntas distintas y solo una es automatizable.

## Resultado y aprendizajes

Pendiente hasta que la suite exista y corra.

Lo que ya me dejó escribir el plan antes de codear: obliga a decidir qué importa cuando todavía no hay tests que defender. Documentar la lógica financiera primero y recién después pensar cómo probarla hizo evidente que el riesgo real no estaba en la interfaz sino en dos lugares mucho menos visibles —las funciones puras de cálculo y las transacciones de la base—, que es exactamente donde no se mira cuando uno empieza a testear por la pantalla.
