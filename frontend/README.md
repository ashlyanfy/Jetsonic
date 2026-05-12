# Jetsonic Trading FZCO

Marketing site + backend API + (upcoming) admin panel.

## Repository layout

```
.                          ← Landing site (static HTML/CSS/JS)
├─ assets/
├─ about/  aog/  contact/  parts/  quality/  services/
├─ index.html  thank-you.html  offline.html
├─ app.js  styles.css  service-worker.js  manifest.webmanifest
├─ package.json            ← serves the landing via `serve`
└─ backend/                ← NestJS API
   ├─ prisma/              ← database schema + seed
   ├─ src/
   │  ├─ auth/             ← JWT login (admin panel)
   │  ├─ leads/            ← RFQ intake + admin endpoints + xlsx export
   │  └─ prisma/           ← Prisma service wrapper
   └─ package.json
```

## Local development

Open three terminals.

**1. Backend** (`backend/`)
```bash
npm install
npx prisma migrate dev
npm run seed              # creates admin@jetsonic.local / Admin123!
npm run start:dev         # http://localhost:3000/api/v1
```

**2. Landing** (repo root)
```bash
npm install
npm run dev               # http://localhost:5500
```

**3. Optional: Prisma Studio** (`backend/`)
```bash
npx prisma studio         # http://localhost:5555
```

## Deployment on Railway

Single Railway project, three services:

| Service  | Type    | Root directory | Start                |
| -------- | ------- | -------------- | -------------------- |
| landing  | Node    | `/`            | `npm start`          |
| backend  | Node    | `/backend`     | `npm run start:prod` |
| postgres | Plugin  | —              | managed              |

### Backend service — required environment variables

| Var              | Value                                                             |
| ---------------- | ----------------------------------------------------------------- |
| `DATABASE_URL`   | `${{Postgres.DATABASE_URL}}` (internal Railway reference)         |
| `JWT_SECRET`     | long random string                                                |
| `JWT_EXPIRES_IN` | `7d`                                                              |
| `CORS_ORIGINS`   | comma-separated list of allowed origins (landing URL + admin URL) |
| `PORT`           | Railway sets this automatically                                   |

After the first deploy, run migrations and seed:

```bash
railway run --service backend npx prisma migrate deploy
railway run --service backend npm run seed
```

### Landing service — point the form at the backend

Either edit `PROD_API_BASE` in `app.js`, or add a meta tag to every HTML head:

```html
<meta name="jetsonic-api" content="https://<backend-domain>/api/v1" />
```

### Custom domain

Once both services have public URLs:

- `jetsonictrade.ae` → CNAME → `landing-production.up.railway.app`
- `api.jetsonictrade.ae` → CNAME → `backend-production.up.railway.app`
