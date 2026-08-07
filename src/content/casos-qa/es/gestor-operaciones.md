---
titulo: "Suite de pruebas de FolioTracker, mi app financiera propia"
resumen: "275 pruebas sobre un diario de trading que construí. Encontró 10 defectos: dos permitían que cualquier usuario logueado creara dinero salteándose el formulario."
tags: [manual, automation, e2e, api]
stack: [Vitest, Playwright, Testing Library, PostgreSQL, Supabase, TypeScript, Docker, GitHub Actions]
fecha: 2026-07-30
destacado: true
estado: completo
ejemplo: false
metricas:
  - etiqueta: pruebas
    valor: "275"
  - etiqueta: defectos
    valor: "10"
repo: "https://github.com/Malu-gani/Registro-de-Operaciones"
demo: "https://registro-de-operaciones-chi.vercel.app"
---

## Contexto

FolioTracker es una aplicación web propia para registrar operaciones de trading (cripto y acciones) y controlar el riesgo antes de entrar a cada operación. Multi-portafolio, con saldos separados por cuenta (ARS, USD, USDT spot y USDT futuros), cálculo de ratio riesgo/beneficio y un semáforo que clasifica cada operación por nivel de riesgo.

Es una app financiera personal: no maneja dinero de terceros, pero sí calcula los números con los que después se decide operar. Un cálculo mal hecho que se muestra con confianza es peor que un error visible, porque nadie lo va a cuestionar.

**El plan de pruebas que sigue se publicó antes de escribir el primer test.** Ahora están las dos mitades: la estrategia con la que decidí atacar la app, y lo que pasó al ejecutarla — 275 pruebas, 10 defectos encontrados y arreglados, y tres severidades que había estimado mal. El repositorio es público, así que todo lo que digo acá se puede contrastar contra el código, los tests y los commits que los arreglaron.

## Estrategia de prueba

Prioricé por consecuencia de la falla, no por dificultad de implementación. En una app de riesgo el peor escenario no es que algo se rompa: es que devuelva un número plausible pero equivocado.

| Nivel | Consecuencia de la falla | Dónde vive |
|---|---|---|
| **P0** | Se crea, se destruye o se contabiliza mal el dinero. Un usuario ve datos de otro. | Las funciones transaccionales de Postgres y las políticas de Row Level Security |
| **P1** | Un número mal calculado informa una decisión de trading real. | Cálculo de riesgo, saldos por cuenta, importador |
| **P2** | La interfaz muestra mal algo correcto, o deja cargar algo inválido. | Validación de formularios, paginación, filtros |
| **P3** | Cosmético: color, espaciado, tema. | Fuera del alcance automatizado |

Regla operativa: **ningún test P2 se escribe mientras quede un camino P0 sin cubrir.** Eso decidió la forma de la suite antes que cualquier preferencia de herramienta — base ancha en pruebas unitarias y de base de datos, y solo cinco flujos end-to-end.

**Una herramienta que descarté, y por qué.** pgTAP es lo que suele recomendarse para probar PostgreSQL, y no lo usé: corre las pruebas desde adentro del motor, con permisos elevados. Eso significa que Row Level Security nunca se ejercita, que era justo la capa que tenía que verificar. Las pruebas de base de datos las escribí desde afuera, con un cliente autenticado como un usuario real.

**Qué decidí no probar, y por qué:**

| Qué | Por qué |
|---|---|
| Las APIs de mercado reales | Son de terceros, con límite de peticiones y valores que cambian por definición. Ningún test toca la red: pruebo cómo reacciona la app cuando esa respuesta no llega o llega mal. |
| El renderizado de los gráficos | Pruebo las funciones puras que arman los datos. El SVG es código de terceros y la aserción es frágil. |
| El proveedor de autenticación por dentro | Código de terceros. Pruebo que la app reaccione bien a sus resultados, no su implementación. |
| Estilos, tema y regresión visual | P3, alto costo de mantenimiento y el look cambia seguido. |
| El crash al traducir con el navegador | No se puede automatizar de forma honesta: depende de que el traductor reescriba el DOM. Queda como caso manual con pasos de reproducción. |
| Concurrencia real entre dos sesiones sobre la misma cuenta | Las funciones que mueven saldo toman bloqueo de fila, así que la garantía existe a nivel del motor. Lo que no automatizo es *demostrar* la carrera: exige orquestar dos sesiones simultáneas, y el escenario que la produciría —la misma persona operando desde dos pestañas a la vez— es poco frecuente frente a ese costo. Riesgo aceptado y documentado. |

## Ejecución

La suite quedó en **275 pruebas**: 186 unitarias, 18 de componentes, 66 de integración contra Postgres y 5 flujos end-to-end, que después de sumar la verificación por email pasaron a 9. La forma no es casual: los cálculos de riesgo son funciones puras y se prueban en milisegundos, así que ahí está la base; el end-to-end es el nivel más caro de mantener y quedó reservado para los recorridos donde el valor está en que las piezas funcionen juntas.

**La base de datos se prueba de verdad, no simulada.** Levanto una Postgres local y efímera en Docker, con las migraciones aplicadas en orden por script, y contra eso corren las 66 pruebas de integración. Eso permite ejercitar Row Level Security con una sesión de usuario real, que era el punto: una política de aislamiento simulada no prueba nada.

**El aislamiento entre pruebas lo da RLS, no un `truncate`.** Cada prueba crea su propio usuario con un email único, así que ninguna ve los datos de otra y todas pueden correr en paralelo. La alternativa habitual —limpiar las tablas entre pruebas— obliga a correr en serie y además desactiva justamente el mecanismo que quiero verificar.

**Un componente que decidí no probar como componente.** El formulario de carga de cripto depende de cuatro contextos y sale a la red al renderizar: montarlo en un test habría sido probar media aplicación disfrazada de prueba unitaria. Sus tres verificaciones útiles se movieron a end-to-end, donde ese costo ya está pago. Saber en qué nivel *no* corresponde probar algo es parte del diseño.

**La intermitencia que más me enseñó.** Con tres o más archivos en paralelo fallaba una prueba al azar, nunca la misma. La causa no estaba en mi código: la CLI de la base escribe un archivo de telemetría con la técnica de escribir-y-renombrar, y varios procesos en paralelo competían por ese renombrado — en Windows, uno pierde. La solución fue consultar esa configuración una sola vez antes de arrancar los procesos, no reintentar ni subir tiempos de espera. Perseguir el síntoma habría dejado una suite que falla el 5% de las veces, que es peor que una suite roja: la gente aprende a volver a correrla y deja de creerle.

## Hallazgos

La suite encontró **10 defectos**. Los 10 están arreglados, y cada uno tiene su prueba escrita contra el comportamiento correcto y la migración que lo corrige, en el repositorio.

**Dos de ellos permitían crear dinero.**

El origen es una decisión de arquitectura razonable, llevada un paso más allá de donde protegía. Las escrituras que mueven capital no se hacen desde el cliente: pasan por funciones transaccionales de Postgres que validan los fondos, insertan el registro y debitan el saldo dentro de una sola transacción. Esas funciones corren con permisos elevados y están otorgadas a cualquier usuario autenticado, así que se las puede llamar directo desde la consola del navegador, salteándose el formulario y toda su validación. **La validación del cliente no era una segunda capa de defensa: era la única.**

- **Abrir una operación con cantidad negativa creaba dinero.** El costo daba negativo, la guarda que compara disponible contra costo pasaba siempre —cualquier saldo es mayor que un número negativo— y la resta terminaba sumando. Medido contra la base real: **1.000 USD pasaron a 101.000 en una sola llamada.**
- **Cerrar una operación con precio de salida negativo también.** En una posición corta inflaba la ganancia; en una larga dejaba el saldo disponible en −6.000, rompiendo la invariante que el resto del sistema defiende en todos lados.

Los dos se arreglaron validando los parámetros dentro de las propias funciones. Y además se agregaron restricciones de columna en la tabla de operaciones, replicando lo que la tabla de plazos fijos ya tenía — que fue justamente lo que evitó que un tercer defecto de la misma familia fuera grave. Dos vías distintas para el mismo caso: si mañana alguien escribe una función nueva y se olvida de validar, la restricción de columna lo frena igual.

Los otros ocho defectos, ordenados por severidad:

| Defecto | Consecuencia |
|---|---|
| El vencimiento de un plazo fijo comparaba la fecha local contra UTC | Se adelantaba o atrasaba un día según la hora en que se mirara |
| `"1.234"` se interpretaba como 1,234 al importar | Un archivo en formato local cargaba montos mil veces menores |
| El esquema no otorgaba permisos de tabla explícitos | Latente: funcionaba en la nube por herencia del entorno, pero en una base recreada desde cero la app entera era invisible para sus propios usuarios |
| Se podía cerrar una operación con fecha de salida anterior a la de entrada | Duración negativa en las métricas |
| Se aceptaban fechas inexistentes como el 31 de febrero | Registros con fechas imposibles |
| Dos fórmulas distintas calculaban el mismo ratio riesgo/beneficio y se contradecían | Dos pantallas mostraban números distintos para lo mismo |
| Un stop loss en `0` se leía como "sin stop loss" | Las métricas de riesgo no se calculaban en la operación más arriesgada posible |
| Un error crudo de Postgres se filtraba a la interfaz | Cosmético, pero deja ver el interior del sistema |

**Lo que la ejecución le corrigió a la estimación.** Los 10 defectos los deduje leyendo el código, antes de escribir un solo test. Correrlos contra una base real cambió tres cosas: uno que había clasificado como crítico resultó P3, porque una restricción de columna ya lo frenaba; otro resultó peor de lo que había descrito; y el de los permisos faltantes **no se podía ver leyendo** — apareció recién al recrear la base desde cero.

Y al revés: de los cinco casos borde que anticipé como los más peligrosos, **cuatro ya estaban correctamente implementados**. La entrada igual al stop loss lanzaba un error controlado, el stop del lado equivocado se rechazaba, los umbrales del semáforo respetaban el límite inclusive y el cierre parcial acreditaba solo la porción. Solo el quinto rozó un defecto real.

La conclusión me sirvió más que los propios defectos: **el análisis estático acierta el dónde y falla el cuánto.** Leer el código me llevó a las funciones correctas, y se equivocó en casi todas las severidades. Es el argumento para escribir la suite en una línea: sin ejecutarla, habría priorizado mal el trabajo de arreglo.

**Un defecto que ningún usuario podría haber reportado.** Al automatizar la confirmación por email apareció que el enlace del mail nunca completaba la sesión: las cookies se escribían donde no sobrevivían a la redirección, y la URL de retorno se armaba con un origen que en producción resolvía a `localhost`. Nadie iba a reportarlo, porque el único afectado era alguien que todavía no podía entrar.

## Automatización

**Qué corre, cuándo y con qué costo.** La integración continua tiene dos trabajos separados justamente por costo. Uno rápido, en cada push: verificación de tipos, análisis estático y pruebas unitarias, todo sin dependencias externas. Uno completo, solo en los pull requests: levanta su propia base de datos en Docker dentro del runner, aplica las migraciones y corre las pruebas de integración y las end-to-end. Separarlos evita la trampa habitual — una suite tan lenta que se termina salteando.

**La cobertura se reporta, pero no bloquea.** Poner un mínimo de cobertura premia escribir pruebas de relleno para llegar al número. El criterio real es la priorización por consecuencia de la falla: prefiero 60% de cobertura donde está el dinero que 90% repartido parejo.

**Las pruebas de un defecto conocido nacen en rojo.** Cuando la suite encontraba un defecto, escribía la prueba contra el comportamiento *correcto*, no contra el que tenía la app, y la dejaba marcada como fallo esperado. Una suite que nace en verde sobre un bug lo convierte en especificación. El arreglo va en un cambio aparte, y ahí la prueba pasa a verde en el mismo movimiento que lo corrige.

Lo que no automaticé es la validación de que los números tengan **sentido financiero**. Que una fórmula esté bien implementada lo verifica una prueba; que sea la fórmula correcta lo verifica leer la documentación de negocio y hacer la cuenta a mano. Son dos preguntas distintas y solo una es automatizable.

## Resultado y aprendizajes

Publiqué el plan de pruebas antes de escribir la primera prueba, y eso me obligó a decidir qué importaba cuando todavía no había nada que defender. Documentar primero la lógica financiera y recién después pensar cómo probarla hizo evidente que el riesgo real no estaba en la interfaz, sino en dos lugares mucho menos visibles —las funciones puras de cálculo y las transacciones de la base—, que es exactamente donde no se mira cuando uno empieza a probar por la pantalla.

Lo incómodo de haberlo publicado antes es que ahora también se ve dónde me equivoqué, y prefiero que se vea. **Dos cosas haría distinto:**

**Ejecutar contra una base real mucho antes de fijar severidades.** Tres de las diez clasificaciones estaban mal, y una de ellas hizo que casi priorizara un arreglo P3 por encima de uno que dejaba el saldo en negativo. Un puñado de pruebas corriendo contra la base al segundo día habría reordenado el trabajo de arreglo entero.

**Recrear el entorno desde cero como primer paso, no como consecuencia.** El defecto de los permisos faltantes era invisible leyendo el código y llevaba meses ahí: la app funcionaba en la nube porque heredaba permisos del entorno, no porque el repositorio los definiera. Apareció solo, sin buscarlo, al levantar la base desde las migraciones. Levantar un proyecto desde cero es una prueba en sí misma, y no la había pensado como tal.

Lo que me llevo del conjunto: un plan de pruebas sirve aunque se equivoque, **siempre que después se lo confronte**. El valor no estuvo en acertar, estuvo en tener algo escrito contra qué comparar.
