---
titulo: "QA for an internal operations manager"
resumen: "Manual test cases and API automation for an operations manager still in development, focused on critical flows."
tags: [manual, automation, api]
stack: [Postman, Playwright, TypeScript, PostgreSQL]
fecha: 2026-07-20
destacado: true
estado: en-progreso
ejemplo: true
---

## Context

Internal app to manage shifts, inventory and reports for a small operations team. It's being built alongside its own test suite, so this case gets updated as the product moves forward.

## Test strategy

With the product still under construction, the risk matrix is defined by where a wrong number hurts the most:

- **High risk:** shift assignment, because an undetected overlap means a shift goes uncovered.
- **High risk:** stock deduction when an operation closes, because a mismatch there poisons the financial reports.
- **Medium risk:** report generation, because errors are visible and can be fixed before they reach a third party.
- **Low risk, dropped for now:** UI personalization (themes, column order). Not tested at this stage because the module isn't frozen yet, and retesting it on every design tweak would waste effort.

## Execution

Manual cases covering the high- and medium-risk flows before each delivery, run against a staging environment with representative test data.

## Findings

To be replaced with the real bugs found during development.

## Automation

Shift and inventory APIs are being automated at request level with Playwright, since those are the endpoints that change the most and the ones where a contract change breaks silently in the UI.

## Outcome and takeaways

To be replaced once the implementation is complete.
