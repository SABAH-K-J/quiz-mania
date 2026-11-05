# Quiz Mania ⚡

A free public quiz platform. Build a quiz in minutes, share one 8-character code, and let anyone play and get scored instantly.

- **Live demo:** https://quiz-mania-chi.vercel.app/
- **Frontend:** React 19 + Vite + Tailwind CSS → deploy free on **Vercel**
- **Backend:** Django 5 + Django REST Framework + SimpleJWT → deploy free on **Render** (or Koyeb)
- **Database:** SQLite locally, **free Postgres** in production (Neon or Supabase)

The Django service is API-only; the React SPA is the product.

---

## Features

**For quiz creators**

- Build multiple-choice, true/false and multi-select questions (2–6 options)
- Per-question points and an optional explanation
- Optional time limit, category, retakes, and answer reveal
- Draft-first workflow: nothing is public until the quiz is explicitly published
- Dashboard with attempts, average score, top score and full attempt history
- Share by code or direct link

**For quiz takers**

- Join with an 8-character code — no download
- One question at a time with progress, review and timer
- Instant score, points, correct count and time taken
- Answer breakdown (when the creator allows it)
- Personal result history and best score

**Production basics**

- JWT auth with refresh rotation and blacklisting
- Owner-only editing and private drafts
- Server-side publish validation
- Taker payloads never include correct answers
- CORS/CSRF, proxy-aware TLS settings, health check endpoint
- SEO/GEO/AEO metadata, JSON-LD, sitemap and robots
- CI for backend checks and frontend build

---

## Repository layout

```
quiz-mania/
├─ api/                        DRF viewsets, serializers, auth endpoints
├─ quiz/                       Models, migrations, admin
├─ Quiz_mania/                 Django settings, URLs, WSGI/ASGI
├─ client/                     React SPA (deploy this to Vercel)
│  ├─ public/                  favicon, OG image, manifest, robots, sitemap
│  ├─ src/
│  └─ vercel.json
├─ Dockerfile                  Optional backend image (Render/Koyeb/Fly/VPS)
├─ render.yaml                 Render blueprint (free plan)
├─ Procfile                    Start command for PaaS hosts
├─ docker-compose.yml          Optional local full-stack run
├─ requirements.txt
├─ .env.example
└─ manage.py
```

---

## Run locally

### 1. Backend

Requires **Python 3.10+** (Docker uses 3.11).

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
source .venv/bin/activate

pip install -r requirements.txt

# Windows: copy .env.example .env
cp .env.example .env

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 8000
```

The API is now at `http://localhost:8000/api/`, admin at `http://localhost:8000/admin/`, health at `http://localhost:8000/health/`.

### 2. Frontend

Requires **Node.js 20.19+ or 22.12+** (Vite 7).

```bash
cd client
npm install

# Windows: copy .env.example .env
cp .env.example .env

npm run dev
```

Open `http://localhost:5173`.

`client/.env`:

```env
VITE_API_URL=http://localhost:8000/api
VITE_SITE_URL=http://localhost:5173
```

> `VITE_API_URL` must include the `/api` suffix.

### 3. Optional: Docker Compose

```bash
docker compose up --build
```

Frontend on `http://localhost`, backend on `http://localhost:8000`.

---

## Environment variables

### Backend (`.env` locally, host dashboard in production)

| Variable | Required | Example | Notes |
| --- | --- | --- | --- |
| `DJANGO_SECRET_KEY` | **Yes** in production | long random string | Generate: `python -c "import secrets; print(secrets.token_urlsafe(64))"` |
| `DJANGO_DEBUG` | Yes | `False` | Defaults to `False` when unset |
| `DJANGO_ALLOWED_HOSTS` | Yes | `.onrender.com,localhost,127.0.0.1` | Comma-separated |
| `DJANGO_CORS_ALLOWED_ORIGINS` | Yes | `https://your-app.vercel.app` | Exact frontend origin(s) |
| `DJANGO_CORS_ALLOWED_ORIGIN_REGEXES` | Optional | `https://.*\.vercel\.app` | For preview deployments |
| `DJANGO_CSRF_TRUSTED_ORIGINS` | Recommended | `https://your-api.onrender.com,https://your-app.vercel.app` | Needed for Django admin behind TLS |
| `DATABASE_URL` | **Yes** in production | `postgres://user:pass@host:5432/db` | SQLite is not durable on PaaS |
| `SITE_URL` | Optional | `https://your-app.vercel.app` | Used in backend metadata |
| `DJANGO_SECURE_SSL_REDIRECT` | Optional | `False` | Leave `False` behind a managed proxy |
| `JWT_ACCESS_MINUTES` | Optional | `60` | Access token lifetime |
| `JWT_REFRESH_DAYS` | Optional | `7` | Refresh token lifetime |
| `PORT` | Optional | `8000` | Render/Koyeb set this automatically |

### Frontend (Vercel → Project → Settings → Environment Variables)

| Variable | Required | Example |
| --- | --- | --- |
| `VITE_API_URL` | **Yes** | `https://quiz-mania-api.onrender.com/api` |
| `VITE_SITE_URL` | **Yes** | `https://quiz-mania.vercel.app` |
| `VITE_GITHUB_URL` | Optional | `https://github.com/you/quiz-mania` |
| `VITE_PROXY_TARGET` | Optional (dev only) | `http://127.0.0.1:8000` |

`VITE_SITE_URL` is used for canonical URLs, Open Graph tags, `robots.txt` and `sitemap.xml` at build time.

---

## Deploy for free (recommended stack)

**Vercel (frontend) + Render (backend) + Neon (Postgres).** All three have free tiers that work together.

### Step 1 — Create a free Postgres database

1. Sign up at [neon.tech](https://neon.tech).
2. Create a project (the free plan is enough).
3. Copy the **connection string**. It looks like:
   `postgresql://user:password@ep-xxx.aws.neon.tech/neondb?sslmode=require`
4. Keep it for the Render step.

> Alternatives: [Supabase](https://supabase.com) (free Postgres) or Render's own Postgres. Neon is recommended because its free database does not expire.

### Step 2 — Deploy the backend to Render

**Option A: Blueprint (fastest)**

1. Push this repository to GitHub.
2. In Render, choose **New → Blueprint** and select the repo.
3. Render reads [`render.yaml`](./render.yaml) and creates the `quiz-mania-api` web service on the free plan.
4. Fill in the values Render marks as required:
   - `DATABASE_URL` → the Neon connection string
   - `DJANGO_CORS_ALLOWED_ORIGINS` → the Vercel URL (this can be added after Step 3)
   - `DJANGO_CSRF_TRUSTED_ORIGINS` → `https://YOUR-API.onrender.com,https://YOUR-APP.vercel.app`
   - `SITE_URL` → the Vercel URL
   - `DJANGO_SECRET_KEY` is generated automatically.
5. Deploy. When it finishes, open:
   `https://YOUR-API.onrender.com/health/` → should return `{"status": "ok", "database": "ok"}`.

**Option B: Manual web service**

1. Render → **New → Web Service** → connect the repo.
2. Runtime: **Python 3**. Plan: **Free**.
3. Build command:
   `pip install -r requirements.txt && python manage.py collectstatic --noinput`
4. Start command:
   `python manage.py migrate --noinput && gunicorn Quiz_mania.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 120`
5. Health check path: `/health/`
6. Add the environment variables from the table above (`DJANGO_DEBUG=False`, `DJANGO_ALLOWED_HOSTS=.onrender.com`, `DATABASE_URL`, CORS/CSRF, `SITE_URL`).
7. Deploy.

Create an admin user once. In Render, open the service **Shell** and run:

```bash
python manage.py createsuperuser
```

**Free-plan notes**

- Render free web services sleep after ~15 minutes of inactivity. The next request takes ~30–60 seconds to wake.
- Optional: add a free [UptimeRobot](https://uptimerobot.com) HTTP monitor for `https://YOUR-API.onrender.com/health/` every 5 minutes to keep it warm.
- Do not use SQLite in production — the filesystem is ephemeral.
- Uploaded media is ephemeral too. The current UI does not upload images; if that changes, add S3/Cloudinary storage.

### Step 3 — Deploy the frontend to Vercel

1. Import the same GitHub repository at [vercel.com/new](https://vercel.com/new).
2. Set **Root Directory** to `client`.
3. Framework preset: **Vite**. Build command `npm run build`, output directory `dist`.
4. Add environment variables:
   - `VITE_API_URL=https://YOUR-API.onrender.com/api`
   - `VITE_SITE_URL=https://YOUR-APP.vercel.app`
5. Deploy.

`client/vercel.json` handles SPA routing, asset caching and security headers.

### Step 4 — Connect the two

1. Copy the Vercel production URL.
2. In Render → Environment, set:
   - `DJANGO_CORS_ALLOWED_ORIGINS=https://YOUR-APP.vercel.app`
   - `DJANGO_CSRF_TRUSTED_ORIGINS=https://YOUR-API.onrender.com,https://YOUR-APP.vercel.app`
   - `SITE_URL=https://YOUR-APP.vercel.app`
3. Redeploy the Render service (or wait for the env change to restart it).
4. On Vercel, confirm `VITE_API_URL` and `VITE_SITE_URL`, then redeploy if they changed.

### Other free-ish backend hosts

| Host | Free tier | Notes |
| --- | --- | --- |
| **Render** | Free web service, spins down | Recommended. Easiest with `render.yaml`. |
| **Koyeb** | One free web service, scales to zero | Use the `Dockerfile`; `PORT` is set automatically. |
| **PythonAnywhere** | Free account | WSGI only, no custom domain, manual reload. Adapt the `Procfile` command to their WSGI setup. |
| **Fly.io** | No true free tier | Paid, but cheap. Use the `Dockerfile`. |

### Push to GitHub

```bash
git add .
git commit -m "Production-ready Quiz Mania"
git push origin main
```

---

## API overview

All endpoints are under `/api/`.

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/register/` | Public | Create an account, returns user + JWT tokens |
| `POST` | `/auth/login/` | Public | Obtain access + refresh tokens |
| `POST` | `/auth/refresh/` | Public | Rotate refresh token |
| `POST` | `/auth/logout/` | Public | Blacklist a refresh token |
| `GET` | `/users/me/` | Required | Current user |
| `GET` | `/quizzes/` | Public | Published quizzes; authenticated users also see their own |
| `GET` | `/quizzes/my_quizzes/` | Required | Quizzes created by the current user |
| `POST` | `/quizzes/` | Required | Create a draft |
| `PATCH` | `/quizzes/{id}/` | Owner | Update quiz details |
| `POST` | `/quizzes/{id}/publish/` | Owner | Validate and publish |
| `GET` | `/quizzes/{code}/by_code/` | Public | Taker-safe quiz payload |
| `GET` | `/quizzes/{id}/results/` | Owner | All attempts for a quiz |
| `GET` | `/questions/?quiz_id={id}` | Public/Owner | Questions (answers hidden for takers) |
| `POST` | `/questions/` | Owner | Add a question |
| `PATCH` / `DELETE` | `/questions/{id}/` | Owner | Edit/delete a question |
| `GET` | `/results/` | Required | Results for the current user |
| `POST` | `/results/submit/` | Required | Submit answers and get a score |
| `GET` | `/health/` | Public | Database + service health |

Interactive DRF docs are not enabled in production; use the endpoints above or the Django admin.

---

## Production checklist

- [ ] `DJANGO_SECRET_KEY` is long, random and stored as a secret
- [ ] `DJANGO_DEBUG=False`
- [ ] `DATABASE_URL` points at Postgres (not SQLite)
- [ ] `DJANGO_ALLOWED_HOSTS` includes the API host
- [ ] `DJANGO_CORS_ALLOWED_ORIGINS` includes the Vercel production URL
- [ ] `DJANGO_CSRF_TRUSTED_ORIGINS` includes both production origins
- [ ] `VITE_API_URL` ends in `/api` and points at the API
- [ ] `VITE_SITE_URL` matches the deployed frontend
- [ ] `/health/` returns `200`
- [ ] Register → create draft → add questions → publish → play → results all work
- [ ] Admin account created on the production database

---

## Quality checks

```bash
# backend
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py test

# frontend
cd client
npm run build
```

CI (`.github/workflows/ci.yml`) runs the same checks on every push and pull request.

---

## Licence

MIT — see [LICENSE](./LICENSE).
