# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

Lashes Beauty Academy: a Next.js 16 marketing site + inscription form for a lash-extension training academy, plus a password-protected admin panel where the owner manages students, payments, and course editions. Plain JavaScript throughout (no TypeScript, despite `tsconfig.json` existing for tooling/JSX support).

## Commands

```bash
npm run dev      # dev server (localhost:3000)
npm run build    # production build — MUST pass clean before considering any task done
npm run lint      # eslint (flat config, not `next lint`)
npm run test      # vitest run — all tests
npx vitest run lib/whatsapp.test.js   # run a single test file
```

There is no staging environment — `npm run dev` and `npm run build` both use the real production Supabase project and real API keys from `.env.local`. Submitting the public forms or hitting write endpoints during manual testing has real side effects (emails sent via Resend, rows written to the live `alumnas`/`pagos` tables).

## Architecture

### Two apps, one repo

- **Public site** (`app/page.jsx`, `app/sitio/`, `components/sections/*`): a date-gated landing page. `app/page.jsx` compares `now()` against a hardcoded launch timestamp and renders either `Proximamente` (coming-soon) or `Sitio` (the real site) — no routing involved, it's a straight conditional render at the same `/` path.
- **Admin panel** (`app/admin/page.jsx`, ~1700 lines, single client component + several modal sub-components in the same file): course/edition selector → alumna list → payments, plus a "Finalizados" (archived editions) view and a global cross-edition student search. Gated by `proxy.js` (Next 16's renamed `middleware.js`) checking for an `admin-session` cookie; `app/admin/login/page.jsx` is the only route it lets through unauthenticated.

### Auth model

Login (`app/api/admin/login/route.js`) authenticates against Supabase Auth via `lib/supabaseAnon.js` and sets the resulting JWT as an `httpOnly; Secure; SameSite=Lax` cookie (`admin-session`, currently 12h `Max-Age`). Every protected API route calls `verifyAdminSession(request)` from `lib/adminAuth.js`, which re-validates that JWT server-side via `supabaseAdmin.auth.getUser(token)` — the cookie's `Max-Age` and the JWT's own expiry are independent; extending one doesn't extend the other. `lib/supabaseAdmin.js` (service-role key, bypasses RLS) is server-only — never import it from a Client Component or anything that could bundle into the browser. No client code talks to Supabase directly; every read/write goes through an `app/api/**/route.js`.

### Course data vs. enrollment data

`lib/cursos.js` (`CURSOS` array) is the **single source of truth** for the course catalog — names, prices, dates, kit availability, group structure. There is no `cursos` table in Supabase. Supabase only stores people: `alumnas`, `pagos`, and `ediciones_vistas`.

`alumnas` columns in current use: `id, nombre, apellido, whatsapp, edicion_id, curso_id, grupo, kit, notas, fecha_inscripcion, origen ('web'|'manual'), curso_finalizado, curso_nombre, fecha_inicio, precio, precio_kit_disponible, precio_kit, contacto_exportado, created_at`. `curso_nombre`, `fecha_inicio`, `precio` are frozen at inscription time from `lib/cursos.js` — never re-derived from the live catalog later, so a course's price/date changing in `lib/cursos.js` doesn't retroactively change what's shown for already-enrolled alumnas.

`pagos(id, alumna_id FK→alumnas, monto, fecha, medio, nota, created_at)`.

`ediciones_vistas(edicion_id PK, alumnas_count, updated_at)` tracks per-edition "last seen alumna count" server-side (Supabase, not localStorage) to compute the "new alumnas since last visit" badge in the admin course selector.

### `edicionId` — the permanent edition identifier

Every course edition (a group/cohort/date) has a manually-assigned `edicionId` string in `lib/cursos.js`, convention `{curso_id}-{yyyy}-{mm}` with a `-b`/`-c` suffix for a second/third edition landing in the same month. This exists specifically so reusing a group name or a marketing date across different cohorts can never collide two unrelated enrollments together — `edicion_id` (frozen on the `alumnas` row at inscription) is the only thing the admin panel keys on, never `curso_id + grupo` or a date string.

Because `lib/cursos.js` gets edited over time (dates change, editions get replaced), an edition can still have active, non-finalized alumnas in the DB after it's been removed from the catalog. `GET /api/admin/cursos` handles this by building the edition list per course as the **union** of what's currently in `lib/cursos.js` plus any distinct `edicion_id` in `alumnas` for that `curso_id` with `curso_finalizado = false` — the latter are flagged `sinDefinicion: true` and hide the "Agregar alumna" action, but otherwise behave like any other active edition (can still take payments, be marked finalized, etc). This is also why a course defined as non-grouped in `lib/cursos.js` can still end up rendered with multiple selectable editions in the admin panel.

Direct navigation to one specific edition (from "Ver detalle" on a finalized edition, or from the global student search) bypasses the curso→edición selector chain entirely via a `?edicion_id=` query param — `GET /api/admin/alumnas?edicion_id=X` returns both the roster and the edition's own metadata (course name, date, finalized/sinDefinicion status) so the detail view never has to re-derive anything from `lib/cursos.js`.

### WhatsApp number handling

`lib/whatsapp.js` is the single place that builds `wa.me` links or validates phone numbers — `toDialableE164()`, `buildWaLink()`, `isValidWhatsapp()`. It has to support two coexisting number formats: new submissions from the public form arrive in E.164 (via `react-phone-number-input` + `libphonenumber-js`), while manual admin entry and all pre-existing `alumnas.whatsapp` values are free-text Argentina-local numbers with no country code (sometimes with the old `15` mobile prefix). The util detects format by a leading `+` and normalizes either way — there was no data migration, so both formats will coexist in the DB indefinitely.

### Next.js 16 breaking-change traps (see `AGENTS.md`)

- Middleware is `proxy.js` + `export function proxy(...)`, not `middleware.js`.
- Route handler `ctx.params` is async: `const { id } = await ctx.params`.
- `request.cookies.get(...)` (NextRequest) is still synchronous, unlike `ctx.params`.
- `npm run lint` runs bare `eslint`, not `next lint`.

## Hard constraints

- Never touch `app/globals.css`. Component-scoped styling (e.g. the admin panel, `ContactForm`'s phone-input skin) uses an inline `<style>{...}</style>` block in that same client component instead.
- Never call Supabase directly from client code — always through an `app/api/**` route.
- Don't add npm dependencies to work around something plain JS can already do; the three exceptions currently in the repo (`react-phone-number-input`, `libphonenumber-js`, `vitest`) were each explicitly requested by name for a specific task.
- Never `git push` — commits get pushed manually after review.
- `npm run build` must be clean before any task is considered done (and now `npm run test` too, for anything touching `lib/whatsapp.js`).
