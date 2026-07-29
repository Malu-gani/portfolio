---
titulo: "Test plan for a trading journal"
resumen: "Risk-based test strategy for a trade logging and risk management app, written before automating anything."
tags: [manual, automation, api]
stack: [Next.js, Supabase, PostgreSQL, TypeScript]
fecha: 2026-07-29
destacado: true
estado: en-progreso
ejemplo: false
---

## Context

A web app of my own for logging trades (crypto and stocks) and controlling risk before entering each position. Multi-portfolio, with balances kept separate per account (ARS, USD, USDT spot and USDT futures), risk/reward ratio calculation, and a traffic-light system that classifies every trade by risk level.

It's a personal finance app: it handles no one else's money, but it does compute the numbers used to decide whether to trade. A wrong calculation displayed confidently is worse than a visible error, because nobody will question it.

**This case documents the test plan, not its execution.** The app is under active development and has no automated suite yet; what follows is the strategy I'll attack it with, published before writing the first test. Once the suite exists, this case gets updated with real findings and results.

## Test strategy

I prioritized by consequence of failure, not by implementation difficulty. In a risk app the worst case isn't something breaking: it's something returning a plausible but wrong number.

- **Critical risk — risk calculations.** The formulas for position size, maximum loss and risk/reward ratio are the app's reason to exist. An error here propagates into every decision made while looking at the screen, with no signal that anything is off.
- **Critical risk — balance atomicity.** Opening and closing trades moves each account's available capital through transactional Postgres functions. A write left half-done leaves the balance off with no trace of why.
- **Critical risk — isolation between users.** Data access is restricted by Row Level Security. A badly written policy means one user seeing another's trades; it's the only failure in the system with consequences outside one's own account.
- **High risk — traffic-light thresholds.** The cutoffs differ per asset class and are inclusive at their upper bound. It's a textbook boundary-value problem, and exactly the kind of thing a poorly written test waves through.
- **Medium risk — currency separation.** ARS, USD and USDT are never summed or converted into each other. Adding them would produce a total that looks right and means nothing.
- **Low risk — fixed-term deposit lifecycle.** Maturity is derived by comparing dates on the client, with no server job. It fails visibly and carries no money with it.

**What I decided not to test, and why:**

- **Market data APIs** (CoinGecko, Yahoo Finance): third-party, rate-limited, and returning values that change by definition. Testing them for real would make the suite slow and non-deterministic. What I will test is how the app reacts when that response doesn't arrive, or arrives malformed.
- **The `alertas` table**: it's in the data model but not implemented. You don't test what doesn't exist.
- **List presentation details** (pagination, collapse and expand): low impact and changing often; automating them now would mean maintaining tests that break without anything being broken.

## Execution

Not executed yet — which is what makes this case in progress rather than complete.

The planned order works from the inside out, because that's where the ratio of effort to risk covered is best:

1. **Unit tests over the risk calculation functions.** They're pure functions, with no database or UI: quick to test, running in milliseconds, and covering critical risk number one. This is where the traffic-light boundary values and the stop loss directional validation belong.
2. **Integration tests against the transactional Postgres functions**, using a test database: opening without sufficient funds, closing partially, liquidating the same fixed-term deposit twice.
3. **Isolation tests between users**: two distinct users, verifying neither can reach the other's data.
4. **A handful of end-to-end tests** over the most-used complete paths, not over everything. E2E is the most expensive level to maintain; I reserve it for flows where the value lies in the pieces working together.

## Findings

None yet: no tests have been run. I'd rather publish the plan with no findings than fill it with invented bugs.

I have, however, identified in advance the cases I expect to hurt, from reading the code and the business documentation:

| Case | Why I expect it |
|---|---|
| Entry price equal to stop loss | Risk per unit is zero and position size tends to infinity. The implementation says it throws a controlled error; worth verifying no `Infinity` or `NaN` escapes to the screen. |
| Stop loss on the wrong side | A "stop loss" above entry on a long isn't a stop loss: it protects profit. It must be rejected before anything is calculated. |
| 3.00% versus 3.01% on stocks | The traffic-light levels are inclusive at their upper bound. A `<` instead of a `<=` shifts the boundary without breaking any test that isn't looking right there. |
| Partial close of a trade | Only the closed portion plus its result should be credited. It's the operation with the most arithmetic and the most intermediate states. |
| Stop loss and take profit absent | Both are optional. Metrics depending on them must not be calculated, nor displayed as zero. |

## Automation

The strategy is to concentrate automation at the cheapest level that covers each risk, and not repeat the same verification across levels.

Risk calculations get tested as pure functions because they need nothing else: it's where a test costs seconds and catches the most expensive error. Rules living in the database — funds validation, atomicity, per-user isolation — get tested against a real database, because they're engine guarantees and can't be simulated without ceasing to test the thing that matters. End-to-end is left for complete journeys, deliberately few.

What I don't intend to automate is validating that the numbers make financial sense. That a formula is correctly implemented is something a test verifies; that it's the right formula is something you verify by reading the business documentation and doing the arithmetic by hand. They're two different questions and only one of them is automatable.

## Outcome and takeaways

Pending until the suite exists and runs.

What writing the plan before coding already gave me: it forces you to decide what matters while there are no tests yet to defend. Documenting the financial logic first and only then thinking about how to test it made it obvious that the real risk wasn't in the interface but in two far less visible places — the pure calculation functions and the database transactions — which is exactly where you don't look when you start testing through the screen.
