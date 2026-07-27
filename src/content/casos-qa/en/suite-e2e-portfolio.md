---
titulo: "E2E suite for this portfolio"
resumen: "Test strategy and automation for the site you are viewing: navigation, i18n, theming and accessibility."
tags: [automation, e2e, accesibilidad]
stack: [Playwright, TypeScript, axe-core, GitHub Actions]
fecha: 2026-07-27
destacado: true
estado: completo
ejemplo: true
repo: "https://github.com/Malu-gani/portfolio"
---

## Context

This portfolio is a bilingual static site with two content tracks. It has no backend, but it still concentrates several points where a silent failure would wreck its one job: a recruiter opens it and it works.

## Test strategy

I prioritized by impact on that goal:

- **High risk:** a broken link or a page that fails to load. It ends the evaluation on the spot.
- **High risk:** the language switch that drops the visitor back on the home page instead of the equivalent page.
- **Medium risk:** dark mode that doesn't persist, or that flashes white on load.
- **Medium risk:** contrast failures that leave text unreadable in either theme.

**I decided not to automate** wording review or image quality checks: those are human judgment calls, and automating them would only produce false positives without adding value.

## Execution

Playwright suite using the Page Object Model, running on Chromium, Firefox, WebKit and a mobile viewport.

## Findings

To be replaced with the real bugs found during development, using the BugReport component.

## Automation

I automated what repeats on every deploy and what a human doesn't catch at a glance: broken links, contrast, and visual regressions.

## Outcome and takeaways

To be replaced once the implementation is complete.
