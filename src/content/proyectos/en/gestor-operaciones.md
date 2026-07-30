---
titulo: "Trading journal and risk manager"
resumen: "Web app for logging crypto and stock trades, with per-account balances and risk control before entering a position."
stack: [Next.js, TypeScript, Supabase, PostgreSQL, Tailwind]
fecha: 2026-07-30
destacado: true
ejemplo: false
repo: "https://github.com/Malu-gani/Registro-de-Operaciones"
demo: "https://registro-de-operaciones-chi.vercel.app"
---

## Description

An application for keeping a record of trades and, above all, for deciding the size of each position before opening it. It supports multiple portfolios, with capital kept in separate accounts per currency and market (ARS, USD, USDT spot and USDT futures) that are never mixed or converted into one another.

For each trade it computes position size, projected maximum loss and the risk/reward ratio, and classifies risk using different thresholds per asset class: what counts as low risk on stocks is critical risk on leveraged futures.

## Motivation

I built it because I was keeping the record in spreadsheets, and the problem wasn't logging the trades — it was calculating risk before entering. Doing that arithmetic by hand, with leverage involved, at the exact moment you need to decide quickly, is precisely the scenario where you get it wrong.

I also wanted the business rules to not live only in the code. The financial logic is documented separately, with the formulas written out in prose, and the code points to that document as its source of truth. That decision turned out to be what later made it possible to write the test plan.

## Technical decisions

Writes that move capital don't happen via `insert` or `update` from the client: they go through transactional PostgreSQL functions. Opening a trade validates funds, inserts the record and debits the balance within a single transaction, so it can't be left half-done. Before that there was a non-atomic double write when closing trades, which is exactly the kind of thing that throws a balance off without leaving a trace.

Isolation between users lives in the database, with Row Level Security on every table, rather than in the application layer. It's an engine guarantee: even if the client asked for someone else's data, it wouldn't receive it.

## Current status

Under active development. The trades, per-account balances, multi-portfolio and fixed-term deposit flows are implemented; the alerts module is in the data model but not built yet.

It has an automated test suite and runs in continuous integration. The design of that suite, the defects it found, and what was deliberately left untested are covered in the case on this portfolio's QA track.

## Deployment and operation

It's deployed and in use, at a total cost of zero. Hosting is Vercel on the free plan: the production environment follows the main branch, so every integrated change ships on its own, and each pull request gets its own preview URL. The database and authentication run on Supabase's free tier, and confirmation emails go out over Gmail SMTP.

The architectural decision that took the most work was email confirmation. The standard flow stores a verifier in a cookie on the browser where sign-up started, so registering on a computer and opening the email on a phone failed — which is exactly what everyone does. Switching to a flow based on a token carried in the link itself removed that dependency, at the cost of writing the email templates and a dedicated route handler for confirmation.
