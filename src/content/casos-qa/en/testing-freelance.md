---
titulo: "Exploratory testing for a freelance client"
resumen: "Exploratory testing for a small online store with no QA team, prioritized by business risk over two days."
tags: [manual, exploratorio]
stack: [Session charters, Google Sheets, DevTools]
fecha: 2026-05-10
destacado: true
estado: completo
ejemplo: true
---

## Context

A freelance client running an online store built on a third-party template needed a review before a launch campaign. There was no QA team, no written test cases, and the budget covered two days of work.

## Test strategy

With so little time, the priority couldn't be coverage — it had to be impact on sales:

- **High risk:** checkout and shipping calculation, since a failure there loses the sale.
- **High risk:** the payment form, including declined-card and retry cases.
- **Medium risk:** catalog search and filters, since they affect conversion but have a fallback (browsing by category).
- **Low risk, dropped:** the blog and institutional pages. I decided not to test them: they're outside the purchase flow, and a bug there blocks no sale.

I used exploratory testing with 45-minute session charters instead of formal test cases, because the site's content changed daily and detailed cases would have gone stale before I finished writing them.

## Execution

Two exploratory sessions per high-risk area, one per medium-risk area, logging each session in a spreadsheet with findings, evidence and severity.

## Findings

To be replaced with the real bugs found during the sessions.

## Automation

Nothing was automated: the scope and timeline didn't justify it. That was a deliberate call, not an oversight.

## Outcome and takeaways

To be replaced once the implementation is complete.
