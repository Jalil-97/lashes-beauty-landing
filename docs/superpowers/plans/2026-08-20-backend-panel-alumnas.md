# Panel de Alumnas — Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full server-side backend (Supabase clients, auth, and 9 API routes) so the admin panel (Chat 2) has a complete data layer.

**Architecture:** All requests from the browser hit Next.js API routes; no client ever talks directly to Supabase. Session is an httpOnly cookie holding a Supabase JWT, verified server-side on every protected route using `supabaseAdmin.auth.getUser(token)`. Course data stays exclusively in `lib/cursos.js`; Supabase only stores alumnas and pagos.

**Tech Stack:** Next.js 16.2.9 App Router · `@supabase/supabase-js` (new) · Resend (existing) · plain JavaScript (no TypeScript)

## Global Constraints

- Next.js 16.2.9, App Router, JavaScript only (no `.ts` / `.tsx`)
- `params` in Route Handler context is **async** → always `const { id } = await ctx.params`
- `request.cookies.get('name')` is **synchronous** — `NextRequest.cookies` API, no await
- **NEVER expose** `SUPABASE_SERVICE_ROLE_KEY` to the client (never in any `NEXT_PUBLIC_*` var or browser-importable file)
- **NEVER import** `supabaseAdmin` inside a Client Component or any file that could be bundled for the browser
- **NEVER touch** `app/globals.css`
- `lib/cursos.js` stays the **single source of truth** for course data — no `cursos` table in Supabase
- `npm run build` must pass clean before declaring any task done
- Supabase tables that already exist (do not recreate):
  - `alumnas(id, nombre, apellido, whatsapp, curso_id, grupo, kit bool, notas text, fecha_inscripcion date, origen 'web'|'manual', curso_finalizado bool, created_at)`
  - `pagos(id, alumna_id FK→alumnas, monto, fecha, medio, nota, created_at)`
- `grupo` column stores group **nombre** (e.g. `'Grupo 1'`), not ID; null for no-group courses
- `curso_id` column stores course **id** (e.g. `'lash-artist'`), not nombre

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `lib/supabaseAdmin.js` | Supabase client (SERVICE_ROLE_KEY) — all DB reads/writes |
| Create | `lib/supabaseAnon.js` | Supabase client (ANON_KEY) — auth.signInWithPassword only |
| Create | `lib/adminAuth.js` | `verifyAdminSession(request)` — reads cookie, calls getUser |
| Create | `app/api/admin/login/route.js` | POST: email+password → httpOnly cookie |
| Create | `app/api/admin/cursos/route.js` | GET: CURSOS + alumna counts from DB |
| Create | `app/api/admin/alumnas/route.js` | GET (with params) + POST (manual alta) |
| Create | `app/api/admin/alumnas/[id]/route.js` | PATCH: edit alumna fields |
| Create | `app/api/admin/pagos/route.js` | POST: add payment |
| Create | `app/api/admin/cursos/[curso_id]/[grupo]/finalizar/route.js` | PATCH: mark group finalizado |
| Modify | `app/api/inscripcion/route.js` | Add best-effort Supabase INSERT after Resend send |

---

### Task 1: Install @supabase/supabase-js and create Supabase client helpers

**Files:**
- Modify: `package.json` (via npm install)
- Create: `lib/supabaseAdmin.js`
- Create: `lib/supabaseAnon.js`

**Interfaces:**
- Produces: `supabaseAdmin` (default export from `lib/supabaseAdmin.js`) — for all DB operations in API routes
- Produces: `supabaseAnon` (default export from `lib/supabaseAnon.js`) — for `auth.signInWithPassword` only

- [ ] **Step 1: Install the package**

```bash
npm install @supabase/supabase-js
```

Expected: no errors; `@supabase/supabase-js` appears in `package.json` dependencies.

- [ ] **Step 2: Create lib/supabaseAdmin.js**

```js
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default supabaseAdmin
```

- [ ] **Step 3: Create lib/supabaseAnon.js**

```js
import { createClient } from '@supabase/supabase-js'

const supabaseAnon = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default supabaseAnon
```

- [ ] **Step 4: Verify build passes**

```bash
npm run build
```

Expected: clean build — no "module not found" errors.

- [ ] **Step 5: Commit**

```bash
git add lib/supabaseAdmin.js lib/supabaseAnon.js package.json package-lock.json
git commit -m "chore: install @supabase/supabase-js, add admin and anon clients"
```

---

### Task 2: Session verification helper

**Files:**
- Create: `lib/adminAuth.js`

**Interfaces:**
- Consumes: `supabaseAdmin` from `./supabaseAdmin`
- Consumes: `request.cookies.get('admin-session')?.value` — synchronous, no await
- Produces: `verifyAdminSession(request)` — async, returns Supabase user object or null

**How it works:** `supabaseAdmin.auth.getUser(token)` sends the JWT to Supabase's `/auth/v1/user` endpoint with the token as the Bearer header (overriding the service key). If the JWT is valid and not expired, it returns the user. If expired or invalid, it returns an error.

- [ ] **Step 1: Create lib/adminAuth.js**

```js
import supabaseAdmin from './supabaseAdmin'

export async function verifyAdminSession(request) {
  const token = request.cookies.get('admin-session')?.value
  if (!token) return null

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return null

  return user
}
```

- [ ] **Step 2: Build check**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add lib/adminAuth.js
git commit -m "feat: add verifyAdminSession helper for protected admin routes"
```

---

### Task 3: POST /api/admin/login

**Files:**
- Create: `app/api/admin/login/route.js`

**Interfaces:**
- Consumes: `supabaseAnon` from `@/lib/supabaseAnon`
- Input body: `{ email: string, password: string }`
- On success (200): sets `admin-session` httpOnly cookie, returns `{ ok: true }`
- On bad credentials (401): returns `{ ok: false, error: 'Credenciales inválidas' }`
- On missing fields (400): returns `{ ok: false, error: 'Email y contraseña requeridos' }`

**Cookie spec:**
```
Set-Cookie: admin-session=<access_token>; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax
```
- `HttpOnly` — JS cannot read it (XSS protection)
- `Max-Age=3600` — matches Supabase default JWT expiry (1 hour); Mica can just re-login if it expires
- `SameSite=Lax` — CSRF protection on cross-site navigation
- Cookie is set via `Set-Cookie` response header (not `cookies()` from next/headers) to avoid async issues

- [ ] **Step 1: Create app/api/admin/login/route.js**

```js
import supabaseAnon from '@/lib/supabaseAnon'

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ ok: false, error: 'Body inválido' }, { status: 400 })
  }

  const { email, password } = body || {}
  if (!email || !password) {
    return Response.json({ ok: false, error: 'Email y contraseña requeridos' }, { status: 400 })
  }

  const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password })

  if (error || !data.session) {
    return Response.json({ ok: false, error: 'Credenciales inválidas' }, { status: 401 })
  }

  const { access_token } = data.session

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `admin-session=${access_token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax`,
    },
  })
}
```

- [ ] **Step 2: Manual test — valid credentials**

Start dev server (`npm run dev`), then in another terminal:

```bash
curl -v -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jalil.karami97@gmail.com","password":"<TEST_USER_PASSWORD>"}'
```

Expected:
- Status: `200`
- Header: `set-cookie: admin-session=eyJ...; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax`
- Body: `{"ok":true}`

- [ ] **Step 3: Manual test — invalid credentials**

```bash
curl -s -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@email.com","password":"badpassword"}'
```

Expected: `{"ok":false,"error":"Credenciales inválidas"}` with status 401.

- [ ] **Step 4: Build + commit**

```bash
npm run build
git add app/api/admin/login/route.js
git commit -m "feat: add POST /api/admin/login with httpOnly session cookie"
```

---

### Task 4: GET /api/admin/cursos

**Files:**
- Create: `app/api/admin/cursos/route.js`

**Interfaces:**
- Consumes: `CURSOS` from `@/lib/cursos`, `supabaseAdmin`, `verifyAdminSession`
- Returns: `{ ok: true, cursos: [...] }`

**Response shape per curso with grupos:**
```json
{
  "id": "lash-artist",
  "nombre": "De Cero a Lash Artist",
  "precio": 399999,
  "precioKit": 115000,
  "cupos": 6,
  "grupos": [
    { "id": "grupo-1", "nombre": "Grupo 1", "cupos": 0, "alumnas": 3 },
    { "id": "grupo-2", "nombre": "Grupo 2", "cupos": 2, "alumnas": 1 }
  ]
}
```

**Response shape per curso without grupos (cupos: null, online):**
```json
{
  "id": "lash-trends",
  "nombre": "Lash Trends — Efectos en Tendencia",
  "precio": 49999,
  "precioKit": null,
  "cupos": null,
  "grupos": null,
  "alumnas": 7
}
```

**Count algorithm:**
1. `SELECT curso_id, grupo FROM alumnas` (all rows, only 2 cols)
2. Build map: `{ 'lash-artist|Grupo 1': 3, 'lash-trends|': 7 }` — key is `curso_id|grupo` with empty string for null grupo
3. For courses with grupos: look up each group by `curso.id|grupo.nombre`
4. For courses without grupos: sum all keys that start with `curso.id|`

- [ ] **Step 1: Create app/api/admin/cursos/route.js**

```js
import { CURSOS } from '@/lib/cursos'
import supabaseAdmin from '@/lib/supabaseAdmin'
import { verifyAdminSession } from '@/lib/adminAuth'

export async function GET(request) {
  const user = await verifyAdminSession(request)
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { data: alumnas, error } = await supabaseAdmin
    .from('alumnas')
    .select('curso_id, grupo')

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const counts = {}
  for (const a of alumnas) {
    const key = `${a.curso_id}|${a.grupo ?? ''}`
    counts[key] = (counts[key] || 0) + 1
  }

  const cursos = CURSOS.map(curso => {
    if (curso.grupos) {
      return {
        id: curso.id,
        nombre: curso.nombre,
        precio: curso.precio,
        precioKit: curso.kit?.disponible ? curso.kit.precio : null,
        cupos: curso.cupos,
        grupos: curso.grupos.map(g => ({
          id: g.id,
          nombre: g.nombre,
          cupos: g.cupos,
          alumnas: counts[`${curso.id}|${g.nombre}`] || 0,
        })),
      }
    }

    const alumnaCount = Object.entries(counts)
      .filter(([k]) => k.startsWith(`${curso.id}|`))
      .reduce((sum, [, n]) => sum + n, 0)

    return {
      id: curso.id,
      nombre: curso.nombre,
      precio: curso.precio,
      precioKit: curso.kit?.disponible ? curso.kit.precio : null,
      cupos: curso.cupos,
      grupos: null,
      alumnas: alumnaCount,
    }
  })

  return Response.json({ ok: true, cursos })
}
```

- [ ] **Step 2: Manual test**

```bash
TOKEN=$(curl -s -c - -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jalil.karami97@gmail.com","password":"<PASSWORD>"}' | grep -o 'admin-session=[^;]*' | head -1)

curl -s http://localhost:3000/api/admin/cursos -H "Cookie: $TOKEN"
```

Expected: `{ ok: true, cursos: [...] }` — array of 5 cursos, each with correct shape. Alumna counts may be 0 initially (DB is empty).

Without cookie: Expected `{ error: 'No autorizado' }` with status 401.

- [ ] **Step 3: Build + commit**

```bash
npm run build
git add app/api/admin/cursos/route.js
git commit -m "feat: add GET /api/admin/cursos — course list enriched with alumna counts"
```

---

### Task 5: GET + POST /api/admin/alumnas

**Files:**
- Create: `app/api/admin/alumnas/route.js`

**GET — interfaces:**
- Query params: `curso_id` (required), `grupo` (optional — omit to get all groups for a course)
- DB query: `SELECT *, pagos(*) FROM alumnas WHERE curso_id = X [AND grupo = Y] ORDER BY fecha_inscripcion ASC`
- Enriches each alumna with price calculations using `lib/cursos.js`

**GET — enrichment logic:**
```
precio     = cursoData.precio                           (from lib/cursos.js, 0 if not found)
precioKit  = a.kit ? cursoData.kit.precio : 0           (0 if kit=false or kit not available)
total      = precio + precioKit
totalPagado = sum of all a.pagos[].monto
saldoPendiente = total - totalPagado
```

**GET — response shape:**
```json
{
  "ok": true,
  "alumnas": [
    {
      "id": "uuid",
      "nombre": "Camila",
      "apellido": "García",
      "whatsapp": "1130001234",
      "curso_id": "lash-artist",
      "grupo": "Grupo 2",
      "kit": true,
      "notas": null,
      "fecha_inscripcion": "2026-07-15",
      "origen": "web",
      "curso_finalizado": false,
      "created_at": "2026-07-15T10:00:00Z",
      "pagos": [
        { "id": "uuid", "alumna_id": "...", "monto": 50000, "medio": "Transferencia", "fecha": "2026-07-15", "nota": "seña", "created_at": "..." }
      ],
      "precio": 399999,
      "precioKit": 115000,
      "total": 514999,
      "totalPagado": 50000,
      "saldoPendiente": 464999
    }
  ]
}
```

**POST — interfaces:**
- Body: `{ nombre, apellido, whatsapp, kit?, curso_id, grupo?, notas? }`
- Required: `nombre`, `apellido`, `whatsapp`, `curso_id`
- Defaults: `kit = false`, `grupo = null`, `notas = null`
- Always sets: `origen: 'manual'`, `fecha_inscripcion: today`, `curso_finalizado: false`
- Returns: 201 + `{ ok: true, alumna: { ...full row } }`

- [ ] **Step 1: Create app/api/admin/alumnas/route.js**

```js
import { CURSOS } from '@/lib/cursos'
import supabaseAdmin from '@/lib/supabaseAdmin'
import { verifyAdminSession } from '@/lib/adminAuth'

export async function GET(request) {
  const user = await verifyAdminSession(request)
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const curso_id = searchParams.get('curso_id')
  const grupo = searchParams.get('grupo')

  if (!curso_id) {
    return Response.json({ error: 'curso_id requerido' }, { status: 400 })
  }

  let query = supabaseAdmin
    .from('alumnas')
    .select('*, pagos(*)')
    .eq('curso_id', curso_id)
    .order('fecha_inscripcion', { ascending: true })

  if (grupo) query = query.eq('grupo', grupo)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })

  const cursoData = CURSOS.find(c => c.id === curso_id)
  const precio = cursoData?.precio ?? 0
  const precioKitBase = cursoData?.kit?.disponible ? cursoData.kit.precio : 0

  const alumnas = data.map(a => {
    const totalPagado = (a.pagos || []).reduce((sum, p) => sum + Number(p.monto), 0)
    const precioKit = a.kit ? precioKitBase : 0
    const total = precio + precioKit
    return { ...a, precio, precioKit, total, totalPagado, saldoPendiente: total - totalPagado }
  })

  return Response.json({ ok: true, alumnas })
}

export async function POST(request) {
  const user = await verifyAdminSession(request)
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { nombre, apellido, whatsapp, kit, curso_id, grupo, notas } = body || {}

  if (!nombre || !apellido || !whatsapp || !curso_id) {
    return Response.json(
      { error: 'Faltan campos obligatorios: nombre, apellido, whatsapp, curso_id' },
      { status: 400 }
    )
  }

  const { data, error } = await supabaseAdmin
    .from('alumnas')
    .insert({
      nombre,
      apellido,
      whatsapp,
      kit: !!kit,
      curso_id,
      grupo: grupo || null,
      notas: notas || null,
      origen: 'manual',
      fecha_inscripcion: new Date().toISOString().split('T')[0],
      curso_finalizado: false,
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ ok: true, alumna: data }, { status: 201 })
}
```

- [ ] **Step 2: Manual test — create manual alumna**

```bash
curl -s -X POST http://localhost:3000/api/admin/alumnas \
  -H "Content-Type: application/json" \
  -H "Cookie: admin-session=<TOKEN>" \
  -d '{"nombre":"Test","apellido":"Alumna","whatsapp":"1134567890","kit":false,"curso_id":"lash-trends"}'
```

Expected: 201, `{ ok: true, alumna: { id: "...", nombre: "Test", apellido: "Alumna", origen: "manual", curso_finalizado: false, ... } }`

Save the `id` from the response for use in Task 6 and Task 7 tests.

- [ ] **Step 3: Manual test — list alumnas**

```bash
curl -s "http://localhost:3000/api/admin/alumnas?curso_id=lash-trends" \
  -H "Cookie: admin-session=<TOKEN>"
```

Expected: alumna from Step 2 appears with `totalPagado: 0`, `saldoPendiente: 49999`, `total: 49999`.

- [ ] **Step 4: Build + commit**

```bash
npm run build
git add app/api/admin/alumnas/route.js
git commit -m "feat: add GET + POST /api/admin/alumnas"
```

---

### Task 6: PATCH /api/admin/alumnas/:id

**Files:**
- Create: `app/api/admin/alumnas/[id]/route.js`

**Interfaces:**
- Consumes: `await ctx.params` — async in Next.js 16 (`const { id } = await ctx.params`)
- Body: any subset of `{ nombre?, apellido?, whatsapp?, kit?, notas? }`
- Silently ignored: `id`, `origen`, `curso_id`, `grupo`, `created_at`, `fecha_inscripcion`, `curso_finalizado`
- Returns: 200 + `{ ok: true, alumna: { ...updated full row } }`
- Returns 400 if no recognized field is present

- [ ] **Step 1: Create app/api/admin/alumnas/[id]/route.js**

```js
import supabaseAdmin from '@/lib/supabaseAdmin'
import { verifyAdminSession } from '@/lib/adminAuth'

export async function PATCH(request, ctx) {
  const user = await verifyAdminSession(request)
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await ctx.params

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { nombre, apellido, whatsapp, kit, notas } = body || {}

  const updates = {}
  if (nombre !== undefined) updates.nombre = nombre
  if (apellido !== undefined) updates.apellido = apellido
  if (whatsapp !== undefined) updates.whatsapp = whatsapp
  if (kit !== undefined) updates.kit = !!kit
  if (notas !== undefined) updates.notas = notas

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: 'No hay campos para actualizar' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('alumnas')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ ok: true, alumna: data })
}
```

- [ ] **Step 2: Manual test — edit the test alumna from Task 5**

```bash
curl -s -X PATCH "http://localhost:3000/api/admin/alumnas/<UUID_FROM_TASK_5>" \
  -H "Content-Type: application/json" \
  -H "Cookie: admin-session=<TOKEN>" \
  -d '{"notas":"Referida por alumna anterior. Prefiere WhatsApp."}'
```

Expected: `{ ok: true, alumna: { ..., notas: "Referida por alumna anterior. Prefiere WhatsApp." } }`

- [ ] **Step 3: Test that kit update works**

```bash
curl -s -X PATCH "http://localhost:3000/api/admin/alumnas/<UUID>" \
  -H "Content-Type: application/json" \
  -H "Cookie: admin-session=<TOKEN>" \
  -d '{"kit":true}'
```

Then verify saldo via GET alumnas: `total` should now be `49999 + 0 = 49999` (lash-trends has `kit.disponible: false` so `precioKitBase = 0`; no change).

Try with a kit-available course alumna: if alumna has `curso_id: 'lash-artist'` and `kit` changes to `true`, total should increase by 115000.

- [ ] **Step 4: Build + commit**

```bash
npm run build
git add "app/api/admin/alumnas/[id]/route.js"
git commit -m "feat: add PATCH /api/admin/alumnas/:id"
```

---

### Task 7: POST /api/admin/pagos

**Files:**
- Create: `app/api/admin/pagos/route.js`

**Interfaces:**
- Body: `{ alumna_id, monto, medio, fecha, nota? }`
- Required: `alumna_id`, `monto` (coerced to Number), `medio`, `fecha`
- `nota`: optional, null if absent
- `medio`: free-form string (e.g. `"Transferencia"`, `"Efectivo"`, `"Tarjeta"`, `"MercadoPago"`)
- `fecha`: date string `"YYYY-MM-DD"`
- Returns: 201 + `{ ok: true, pago: { id, alumna_id, monto, medio, fecha, nota, created_at } }`

- [ ] **Step 1: Create app/api/admin/pagos/route.js**

```js
import supabaseAdmin from '@/lib/supabaseAdmin'
import { verifyAdminSession } from '@/lib/adminAuth'

export async function POST(request) {
  const user = await verifyAdminSession(request)
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { alumna_id, monto, medio, fecha, nota } = body || {}

  if (!alumna_id || monto === undefined || monto === null || !medio || !fecha) {
    return Response.json(
      { error: 'Faltan campos obligatorios: alumna_id, monto, medio, fecha' },
      { status: 400 }
    )
  }

  const { data, error } = await supabaseAdmin
    .from('pagos')
    .insert({ alumna_id, monto: Number(monto), medio, fecha, nota: nota || null })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ ok: true, pago: data }, { status: 201 })
}
```

- [ ] **Step 2: Manual test — add a payment**

```bash
curl -s -X POST http://localhost:3000/api/admin/pagos \
  -H "Content-Type: application/json" \
  -H "Cookie: admin-session=<TOKEN>" \
  -d '{"alumna_id":"<UUID_FROM_TASK_5>","monto":25000,"medio":"Transferencia","fecha":"2026-08-20","nota":"seña inicial"}'
```

Expected: 201, `{ ok: true, pago: { id: "...", alumna_id: "...", monto: 25000, medio: "Transferencia", fecha: "2026-08-20", nota: "seña inicial" } }`

- [ ] **Step 3: Verify saldo updates via GET alumnas**

```bash
curl -s "http://localhost:3000/api/admin/alumnas?curso_id=lash-trends" \
  -H "Cookie: admin-session=<TOKEN>"
```

Expected: alumna.totalPagado = 25000, alumna.saldoPendiente = 24999 (49999 − 25000).

- [ ] **Step 4: Add second payment, verify sum**

```bash
curl -s -X POST http://localhost:3000/api/admin/pagos \
  -H "Content-Type: application/json" \
  -H "Cookie: admin-session=<TOKEN>" \
  -d '{"alumna_id":"<UUID>","monto":24999,"medio":"Efectivo","fecha":"2026-08-21"}'
```

Then GET alumnas again. Expected: `totalPagado: 49999`, `saldoPendiente: 0`.

- [ ] **Step 5: Build + commit**

```bash
npm run build
git add app/api/admin/pagos/route.js
git commit -m "feat: add POST /api/admin/pagos"
```

---

### Task 8: PATCH /api/admin/cursos/:curso_id/:grupo/finalizar

**Files:**
- Create: `app/api/admin/cursos/[curso_id]/[grupo]/finalizar/route.js`

**Interfaces:**
- Dynamic params: `curso_id`, `grupo` — both async (`const { curso_id, grupo } = await ctx.params`)
- Special convention: `grupo === '_'` means the course has no groups (cupos: null, online) → filter by `curso_id` only, with `grupo IS NULL`
- For named groups: filter `curso_id = X AND grupo = Y` (URL-decodes grupo before querying)
- Updates `curso_finalizado: true` on all matching alumnas
- Returns: `{ ok: true }`

**Why `_` for no-group courses:** Supabase JS `.is('grupo', null)` is different from `.eq('grupo', null)`. Using `_` as a sentinel in the URL avoids encoding null and signals to the backend to use the IS NULL filter.

- [ ] **Step 1: Create app/api/admin/cursos/[curso_id]/[grupo]/finalizar/route.js**

```js
import supabaseAdmin from '@/lib/supabaseAdmin'
import { verifyAdminSession } from '@/lib/adminAuth'

export async function PATCH(request, ctx) {
  const user = await verifyAdminSession(request)
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { curso_id, grupo } = await ctx.params

  let query = supabaseAdmin
    .from('alumnas')
    .update({ curso_finalizado: true })
    .eq('curso_id', curso_id)

  if (grupo === '_') {
    query = query.is('grupo', null)
  } else {
    query = query.eq('grupo', decodeURIComponent(grupo))
  }

  const { error } = await query

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ ok: true })
}
```

- [ ] **Step 2: Manual test — mark lash-trends as finalizado**

The test alumna from Task 5 has `curso_id: 'lash-trends'` and `grupo: null`.

```bash
curl -s -X PATCH "http://localhost:3000/api/admin/cursos/lash-trends/_/finalizar" \
  -H "Cookie: admin-session=<TOKEN>"
```

Expected: `{ ok: true }`

Verify: GET alumnas for lash-trends should show `curso_finalizado: true`.

```bash
curl -s "http://localhost:3000/api/admin/alumnas?curso_id=lash-trends" \
  -H "Cookie: admin-session=<TOKEN>"
```

Expected: `alumna.curso_finalizado === true`

- [ ] **Step 3: Build + commit**

```bash
npm run build
git add "app/api/admin/cursos/[curso_id]/[grupo]/finalizar/route.js"
git commit -m "feat: add PATCH /api/admin/cursos/:curso_id/:grupo/finalizar"
```

---

### Task 9: Add Supabase INSERT to /api/inscripcion (web form → DB)

**Files:**
- Modify: `app/api/inscripcion/route.js`

**Rule: Resend send is primary. Supabase INSERT is best-effort — a DB error must NEVER cause a 500 to the user if the email already sent. Wrap the insert in try/catch with an empty catch.**

**What we insert:**
- `nombre`, `apellido`, `whatsapp` — from body (already in scope)
- `curso_id` — `cursoData?.id` (already found via `CURSOS.find(c => c.nombre === curso)`)
- `grupo` — from body, `null` if absent
- `kit` — boolean from body
- `notas: null` — web form has no notes field
- `origen: 'web'`
- `fecha_inscripcion` — today's date
- `curso_finalizado: false`

**Where to insert the code:** Between the `if (error) { return 500 }` block and the final `return Response.json({ ok: true })`. The insert fires after confirming Resend succeeded.

Note: `email` is NOT a column in the `alumnas` table — it only goes to Resend.

- [ ] **Step 1: Add the supabaseAdmin import at the top of app/api/inscripcion/route.js**

At line 1, after `import { Resend } from 'resend'`:

```js
import { Resend } from 'resend'
import supabaseAdmin from '@/lib/supabaseAdmin'
import { CURSOS } from '@/lib/cursos'
```

Wait — `CURSOS` is already imported on line 2. So only add the supabaseAdmin import:

```js
import { Resend } from 'resend'
import supabaseAdmin from '@/lib/supabaseAdmin'
import { CURSOS } from '@/lib/cursos'
```

- [ ] **Step 2: Add the Supabase INSERT block inside the try block**

Locate this block in `app/api/inscripcion/route.js` (currently lines 223-229):

```js
    if (error) {
      return Response.json(
        { ok: false, error: error.message || 'Error al enviar el email' },
        { status: 500 },
      )
    }

    return Response.json({ ok: true, id: data?.id }, { status: 200 })
```

Replace with:

```js
    if (error) {
      return Response.json(
        { ok: false, error: error.message || 'Error al enviar el email' },
        { status: 500 },
      )
    }

    try {
      await supabaseAdmin.from('alumnas').insert({
        nombre,
        apellido: apellido || null,
        whatsapp,
        curso_id: cursoData?.id || null,
        grupo: grupo || null,
        kit: !!kit,
        notas: null,
        origen: 'web',
        fecha_inscripcion: new Date().toISOString().split('T')[0],
        curso_finalizado: false,
      })
    } catch {}

    return Response.json({ ok: true, id: data?.id }, { status: 200 })
```

- [ ] **Step 3: Manual test — submit public inscription**

```bash
curl -s -X POST http://localhost:3000/api/inscripcion \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "WebTest",
    "apellido": "Inscripcion",
    "email": "test@test.com",
    "whatsapp": "1134567890",
    "curso": "Lash Trends — Efectos en Tendencia",
    "nivel": "Avanzada",
    "modalidad": "Online",
    "metodoPago": "Transferencia",
    "kit": false
  }'
```

Expected: `{ ok: true }` AND Resend sends the email AND the alumna appears in Supabase with `origen: 'web'`.

Verify via admin route:
```bash
curl -s "http://localhost:3000/api/admin/alumnas?curso_id=lash-trends" \
  -H "Cookie: admin-session=<TOKEN>"
```

Expected: a new alumna with `nombre: 'WebTest'`, `origen: 'web'`.

- [ ] **Step 4: Verify Resend still works if Supabase is unavailable**

Temporarily check that if `supabaseAdmin.from('alumnas').insert()` throws, the route still returns `{ ok: true }` (the empty catch block ensures this). No test needed beyond code inspection — the pattern is correct by construction.

- [ ] **Step 5: Build + commit**

```bash
npm run build
git add app/api/inscripcion/route.js
git commit -m "feat: persist web inscripciones to Supabase after Resend (best-effort)"
```

---

## Self-Review

### Spec coverage

| Spec task | Implemented in |
|-----------|---------------|
| 1. `lib/supabaseAdmin.js` helper | Task 1 |
| 2. `POST /api/admin/login` with httpOnly cookie | Task 3 |
| 3. Session verification middleware | Task 2 |
| 4. `GET /api/admin/cursos` with alumna counts | Task 4 |
| 5. `GET /api/admin/alumnas?curso_id=X&grupo=Y` with pagos | Task 5 |
| 6. `POST /api/admin/alumnas` manual alta | Task 5 |
| 7. `PATCH /api/admin/alumnas/:id` edit | Task 6 |
| 8. `POST /api/admin/pagos` add payment | Task 7 |
| 9. `PATCH /api/admin/cursos/:curso_id/:grupo/finalizar` | Task 8 |
| 10. Modify `/api/inscripcion` to save to Supabase | Task 9 |

### Security checklist

- ✅ Every `/api/admin/*` route calls `verifyAdminSession(request)` as first operation before any DB access
- ✅ `SUPABASE_SERVICE_ROLE_KEY` only used in `lib/supabaseAdmin.js` — a server-only file, never imported by any Client Component
- ✅ Cookie is `HttpOnly` (no JS access) and `SameSite=Lax` (CSRF protection)
- ✅ PATCH alumna whitelist: only `nombre`, `apellido`, `whatsapp`, `kit`, `notas` — `id`, `origen`, `curso_id`, `grupo`, `created_at`, `fecha_inscripcion`, `curso_finalizado` are never modified via this route
- ✅ No SQL injection risk — Supabase JS client uses parameterized queries

### API consistency

- `grupo` URL param / DB column / body field: always the group **nombre** (e.g. `'Grupo 1'`) or null
- `curso_id` URL param / DB column / body field: always the course **id** (e.g. `'lash-artist'`)  
- `await ctx.params`: used in all dynamic route handlers (Tasks 6, 8)
- `monto`: always coerced via `Number(monto)` before INSERT
- `kit`: always coerced via `!!kit` before INSERT/UPDATE
