---
titulo: "Test suite for a financial app I built"
resumen: "275 tests on a trading journal I built. It found 10 defects: two let any logged-in user create money by bypassing the form entirely."
tags: [manual, automation, e2e, api]
stack: [Vitest, Playwright, Testing Library, PostgreSQL, Supabase, TypeScript, Docker, GitHub Actions]
fecha: 2026-07-30
destacado: true
estado: completo
ejemplo: false
repo: "https://github.com/Malu-gani/Registro-de-Operaciones"
demo: "https://registro-de-operaciones-chi.vercel.app"
---

## Context

A web application I built to log trading operations (crypto and stocks) and control risk before entering each position. Multi-portfolio, with balances kept separate per account (ARS, USD, USDT spot and USDT futures), risk/reward ratio calculation, and a traffic-light system that classifies every operation by risk level.

It's a personal financial app: it doesn't handle anyone else's money, but it does calculate the numbers used to decide whether to trade. A wrong calculation displayed with confidence is worse than a visible error, because nobody questions it.

**The test plan below was published before I wrote the first test.** Now both halves exist: the strategy I chose to attack the app with, and what happened when I executed it — 275 tests, 10 defects found and fixed, and three severities I had estimated wrong. The repository is public, so everything I claim here can be checked against the code, the tests, and the commits that fixed them.

## Test strategy

I prioritized by consequence of failure, not by ease of implementation. In a risk application the worst case isn't that something breaks: it's that it returns a plausible but wrong number.

| Level | Consequence of failure | Where it lives |
|---|---|---|
| **P0** | Money is created, destroyed or accounted for incorrectly. One user sees another's data. | The transactional Postgres functions and the Row Level Security policies |
| **P1** | A miscalculated number informs a real trading decision. | Risk calculation, per-account balances, importer |
| **P2** | The interface displays something correct incorrectly, or accepts invalid input. | Form validation, pagination, filters |
| **P3** | Cosmetic: color, spacing, theme. | Outside the automated scope |

Operating rule: **no P2 test gets written while a P0 path remains uncovered.** That decided the shape of the suite before any tool preference did — a wide base of unit and database tests, and only five end-to-end flows.

**A tool I ruled out, and why.** pgTAP is the usual recommendation for testing PostgreSQL, and I didn't use it: it runs tests from inside the engine, with elevated privileges. That means Row Level Security is never exercised — precisely the layer I needed to verify. I wrote the database tests from the outside, with a client authenticated as a real user.

**What I decided not to test, and why:**

| What | Why |
|---|---|
| The real market data APIs | Third-party, rate-limited, and returning values that change by definition. No test touches the network: I test how the app reacts when that response doesn't arrive or arrives malformed. |
| Chart rendering | I test the pure functions that build the data. The SVG is third-party code and the assertion is brittle. |
| The authentication provider's internals | Third-party code. I test that the app reacts correctly to its results, not its implementation. |
| Styles, theme and visual regression | P3, high maintenance cost, and the look changes often. |
| The crash when translating with the browser | It can't be automated honestly: it depends on the translator rewriting the DOM. It stays as a manual case with reproduction steps. |
| Real concurrency between two sessions on the same account | The balance-moving functions take a row lock, so the guarantee exists at the engine level. What I don't automate is *demonstrating* the race: it requires orchestrating two simultaneous sessions, and the scenario that would produce it —the same person operating from two tabs at once— is infrequent relative to that cost. Accepted and documented risk. |

## Execution

The suite ended up at **275 tests**: 186 unit, 18 component, 66 integration against Postgres, and 5 end-to-end flows, which became 9 after adding email verification. The shape isn't accidental: the risk calculations are pure functions and test in milliseconds, so that's where the base is; end-to-end is the most expensive level to maintain and was reserved for the paths whose value lies in the pieces working together.

**The database is tested for real, not simulated.** I spin up a local, ephemeral Postgres in Docker, with migrations applied in order by a script, and the 66 integration tests run against that. It lets me exercise Row Level Security with a real user session, which was the point: a simulated isolation policy proves nothing.

**Isolation between tests comes from RLS, not from a `truncate`.** Each test creates its own user with a unique email, so none of them sees another's data and they can all run in parallel. The usual alternative —wiping tables between tests— forces serial execution and, on top of that, disables exactly the mechanism I want to verify.

**A component I decided not to test as a component.** The crypto entry form depends on four contexts and hits the network on render: mounting it in a test would have meant testing half the application disguised as a unit test. Its three useful assertions moved to end-to-end, where that cost is already paid. Knowing which level *not* to test something at is part of the design.

**The flakiness that taught me the most.** With three or more files in parallel, a random test failed — never the same one. The cause wasn't in my code: the database CLI writes a telemetry file using write-and-rename, and several parallel processes competed for that rename — on Windows, one loses. The fix was to query that configuration once before the workers start, not to retry or raise timeouts. Chasing the symptom would have left a suite that fails 5% of the time, which is worse than a red suite: people learn to just run it again and stop believing it.

## Findings

The suite found **10 defects**. All 10 are fixed, and each one has its test written against the correct behavior and the migration that corrects it, in the repository.

**Two of them allowed money to be created.**

The origin is a reasonable architectural decision taken one step further than it protected. Writes that move capital don't happen from the client: they go through transactional Postgres functions that validate funds, insert the record and debit the balance inside a single transaction. Those functions run with elevated privileges and are granted to any authenticated user, so they can be called directly from the browser console, bypassing the form and all of its validation. **Client-side validation wasn't a second layer of defense: it was the only one.**

- **Opening a position with a negative quantity created money.** The cost came out negative, the guard comparing available balance against cost always passed —any balance is greater than a negative number— and the subtraction ended up adding. Measured against the real database: **1,000 USD became 101,000 in a single call.**
- **Closing a position with a negative exit price did too.** On a short it inflated the profit; on a long it left the available balance at −6,000, breaking the invariant the rest of the system defends everywhere.

Both were fixed by validating parameters inside the functions themselves. Column constraints were also added to the operations table, replicating what the fixed-deposits table already had — which is exactly what kept a third defect in the same family from being serious. Two different paths for the same case: if someone writes a new function tomorrow and forgets to validate, the column constraint stops it anyway.

The other eight defects, ordered by severity:

| Defect | Consequence |
|---|---|
| A fixed deposit's maturity compared the local date against UTC | It shifted a day forward or back depending on the hour it was viewed |
| `"1.234"` was read as 1.234 when importing | A file in local format loaded amounts a thousand times smaller |
| The schema granted no explicit table permissions | Latent: it worked in the cloud by inheriting environment permissions, but on a database rebuilt from scratch the entire app was invisible to its own users |
| A position could be closed with an exit date earlier than its entry date | Negative duration in the metrics |
| Nonexistent dates like February 31st were accepted | Records with impossible dates |
| Two different formulas calculated the same risk/reward ratio and contradicted each other | Two screens showed different numbers for the same thing |
| A stop loss of `0` was read as "no stop loss" | Risk metrics weren't calculated on the riskiest possible position |
| A raw Postgres error leaked to the interface | Cosmetic, but it exposes the system's internals |

**What execution corrected in my estimates.** I deduced all 10 defects by reading the code, before writing a single test. Running them against a real database changed three things: one I had classified as critical turned out to be P3, because a column constraint already stopped it; another turned out worse than I had described; and the missing-permissions one **couldn't be seen by reading** — it only appeared when rebuilding the database from scratch.

And the other way around: of the five edge cases I anticipated as the most dangerous, **four were already correctly implemented**. An entry price equal to the stop loss threw a controlled error, a stop on the wrong side was rejected, the traffic-light thresholds respected their inclusive upper bound, and a partial close credited only the closed portion. Only the fifth grazed a real defect.

The conclusion was worth more to me than the defects themselves: **static analysis gets the *where* right and the *how much* wrong.** Reading the code led me to the right functions, and got almost every severity wrong. That's the argument for writing the suite in one line: without executing it, I would have prioritized the fix work badly.

**A defect no user could ever have reported.** While automating email confirmation, it turned out the link in the email never completed the session: cookies were written where they didn't survive the redirect, and the return URL was built from an origin that resolved to `localhost` in production. Nobody was going to report it, because the only person affected was someone who couldn't get in yet.

## Automation

**What runs, when, and at what cost.** Continuous integration has two jobs separated precisely by cost. A fast one, on every push: type checking, static analysis and unit tests, all without external dependencies. A full one, only on pull requests: it spins up its own database in Docker inside the runner, applies the migrations, and runs the integration and end-to-end tests. Separating them avoids the usual trap — a suite so slow that people start skipping it.

**Coverage is reported, but doesn't block.** Setting a coverage minimum rewards writing filler tests to reach the number. The real criterion is prioritization by consequence of failure: I'd rather have 60% coverage where the money is than 90% spread evenly.

**Tests for a known defect are born red.** When the suite found a defect, I wrote the test against the *correct* behavior, not the one the app had, and marked it as an expected failure. A suite born green on top of a bug turns that bug into the specification. The fix goes in a separate change, and there the test turns green in the same move that corrects it.

What I didn't automate is validating that the numbers make **financial sense**. That a formula is correctly implemented is verified by a test; that it's the right formula is verified by reading the business documentation and doing the arithmetic by hand. They're two different questions and only one of them is automatable.

## Results and takeaways

I published the test plan before writing the first test, and that forced me to decide what mattered while there was still nothing to defend. Documenting the financial logic first and only then thinking about how to test it made it obvious that the real risk wasn't in the interface, but in two far less visible places —the pure calculation functions and the database transactions— which is exactly where nobody looks when they start testing through the screen.

The uncomfortable part of having published it first is that now you can also see where I got it wrong, and I'd rather that be visible. **Two things I'd do differently:**

**Execute against a real database long before fixing severities.** Three of the ten classifications were wrong, and one of them nearly made me prioritize a P3 fix over one that left the balance negative. A handful of tests running against the database on day two would have reordered the entire fix effort.

**Rebuild the environment from scratch as a first step, not as a consequence.** The missing-permissions defect was invisible in the code and had been there for months: the app worked in the cloud because it inherited permissions from the environment, not because the repository defined them. It surfaced on its own, unsought, when bringing the database up from the migrations. Standing a project up from zero is a test in itself, and I hadn't thought of it as one.

What I take from all of it: a test plan is worth writing even when it's wrong, **as long as you confront it afterwards**. The value wasn't in being right, it was in having something written to compare against.
