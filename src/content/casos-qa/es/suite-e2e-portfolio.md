---
titulo: "Suite E2E de este portfolio"
resumen: "Estrategia de prueba y automatización del sitio que estás viendo: navegación, i18n, tema y accesibilidad."
tags: [automation, e2e, accesibilidad]
stack: [Playwright, TypeScript, axe-core, GitHub Actions]
fecha: 2026-07-27
destacado: true
estado: completo
ejemplo: true
repo: "https://github.com/maluganiJ/portfolio"
---

## Contexto

Este portfolio es un sitio estático bilingüe con dos carriles de contenido. Aunque no tiene backend, concentra varios puntos donde un fallo silencioso arruinaría su único objetivo: que un reclutador lo abra y funcione.

## Estrategia de prueba

Prioricé por impacto sobre ese objetivo:

- **Riesgo alto:** un enlace roto o una página que no carga. Corta la evaluación en seco.
- **Riesgo alto:** el cambio de idioma que devuelve a la home en vez de a la página equivalente.
- **Riesgo medio:** el tema oscuro que no persiste, o que arranca con parpadeo blanco.
- **Riesgo medio:** fallas de contraste que dejan texto ilegible en uno de los dos temas.

**Decidí no automatizar** la validación de la redacción ni la calidad de las imágenes: son revisiones humanas y automatizarlas daría falsos positivos sin aportar valor.

## Ejecución

Suite en Playwright con Page Object Model, corriendo en Chromium, Firefox, WebKit y viewport mobile.

## Hallazgos

Reemplazar por los bugs reales encontrados durante el desarrollo, usando el componente BugReport.

## Automatización

Automaticé lo que se repite en cada deploy y lo que un humano no detecta a simple vista: enlaces rotos, contraste y regresiones visuales.

## Resultado y aprendizajes

Reemplazar al completar la implementación.
