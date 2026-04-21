---
name: pre-production-audit
description: Pre-production security & stability checklist for CountFire backend. Use this skill BEFORE deploying the project to production (real users, real brigade data). The current deployment on Render is educational/training — these issues are acceptable there but MUST be fixed before real production. Triggers include the user asking about "deploying to production", "going live", "real users", "продакшн", "реальні користувачі", "запустити на прод", or any mention of switching from training to real operational use.
---

# Pre-production audit — CountFire backend

If the user is preparing to deploy this project for **real users** (not the Render training environment), walk through this checklist with them. Do NOT apply these fixes automatically on the training environment — they will break it or have no benefit there.

## 🔴 CRITICAL — must fix before production

### 1. Weak JWT_SECRET
**Location:** `.env` → `JWT_SECRET=mySecretKey123!@>`
**Risk:** Anyone who guesses or leaks this secret can forge JWT tokens for **any user including GOD role**. Full account takeover.
**Fix:**
```bash
# generate a strong secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Place the output in `.env` as `JWT_SECRET=...`. After rotation, **all existing sessions invalidate** — every user must re-login.

On Render: set `JWT_SECRET` as an environment variable in the dashboard, NOT in the repo.

### 2. `alter: true` on startup
**Location:** `backEnd/server.js` — multiple `Model.sync({ alter: true })` calls in `start()`.
**Risk:** On every server boot, Sequelize diffs the model against the DB and runs ALTER TABLE. Can silently **drop columns, reorder indexes, lose data**. A renamed field = DROP + ADD = data gone.
**Fix:** Migrate to sequelize-cli migrations:
1. `npm i -D sequelize-cli`
2. `npx sequelize-cli init`
3. Generate a baseline migration from current schema
4. Replace all `sync({ alter: true })` with `sync()` (create-only, no schema changes) OR remove sync entirely
5. Deploy migrations manually via `npx sequelize-cli db:migrate` in Render build command

## 🟠 HIGH — strongly recommended before production

### 3. No input validation on `req.body`
**Risk:** Type confusion, data corruption, potential injection via JSON fields that get stored and later rendered. Example: a client sends `{ brigadeId: { $gt: 0 } }` or arrays where strings expected.
**Fix:** Add `zod` schemas per route:
```bash
npm i zod
```
Priority endpoints for validation:
- `POST /api/auth/login`
- `POST /api/users` (create user)
- `PUT /api/transfer` (transfer items between brigades)
- All POST/PUT on equipment models

### 4. Secrets & environment hygiene
- Verify `.env` is in `.gitignore` and has NEVER been committed (`git log --all -- .env`)
- Rotate **any** secret that ever touched git history
- On Render: move all secrets to dashboard env vars, not in repo

### 5. CORS & HTTPS
- Confirm Render enforces HTTPS (it does by default)
- Add explicit CORS allowlist in `server.js` — right now CORS is implicit/permissive

### 6. helmet middleware
```bash
npm i helmet
```
```js
import helmet from 'helmet'
app.use(helmet())
```
Adds X-Frame-Options, HSTS, CSP baseline, etc.

## 🟡 MEDIUM — nice to have

### 7. Pagination on `getAll()` endpoints
Every `Model.findAll()` without `limit/offset` will slow down or time out as data grows. Add `?page=1&pageSize=50` pattern. **Breaking change for frontend** — coordinate both sides.

### 8. Structured logging & error monitoring
- Replace `console.log` / `console.error` with `pino` or `winston`
- Add Sentry (or similar) for error tracking

### 9. Health check endpoint
`GET /api/health` that returns DB connectivity status — required for Render zero-downtime deploys.

## 🟢 LOW — cosmetic, skip unless doing a major refactor

- Rename `controlers/` → `controllers/`
- Rename `HydravlicTool` → `HydraulicTool` (requires DB column migration)
- Rename fields `yaerOfPurchase` → `yearOfPurchase`, `wherehousePassed` → `warehousePassed` (requires DB migration + frontend updates)
- These are DB column names — renaming touches migrations, models, controllers, and frontend simultaneously. High coordination cost for zero functional benefit.

## ✅ Already fixed (safe changes applied 2026-04-19)

- `express.json({ limit: '1mb' })` — DoS via huge payloads blocked
- Global rate limiter on `/api/*` (120 req/min) — brute force / scraping protection
- `transferController.transferItems` wrapped in `sequelize.transaction()` — atomic transfers, no orphan state
- 9 controllers refactored to `createBrigadeScopedController` factory
- Express 5 wildcard route syntax fix (`/{*path}`)
- Login rate limiter (5 attempts / 15 min) on `/api/auth/login`

## How to use this skill

When the user says they're preparing for production:

1. Ask: "Is this deployment still the training environment on Render, or real users with real brigade data?"
2. If **real users** → walk through 🔴 CRITICAL items first. Confirm each with the user before applying. JWT rotation and migration setup both need user involvement (env vars, baseline migration review).
3. 🟠 HIGH items → propose as a follow-up PR after critical fixes deploy safely
4. 🟡 / 🟢 → mention only if asked; don't block the launch on them

**Never apply these fixes to the training Render deployment unsolicited** — they'll either have no effect or break working behavior the user is actively learning from.
