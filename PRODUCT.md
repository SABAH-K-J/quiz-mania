# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are both quiz creators and quiz takers on the same platform. Creators (teachers, trainers, students, community hosts) build quizzes, set time limits, categories, and share them. Takers (students, friends, class groups) join with an 8-character code or link and play instantly. Both audiences use the same public web app on desktop and mobile; creators also need dashboard, analytics, results, and publish/draft workflows.

## Product Purpose

Quiz Mania is a free public quiz platform: create a quiz in minutes, share a short code, and let anyone play and get scored instantly. Success means a creator can go from blank page to a playable, shareable quiz without friction, and a taker can join, answer, and see a clear score and explanation within seconds. Public discoverability via SEO/GEO/AEO is part of the purpose — pages must be crawlable, understandable to search and answer engines, and usable by first-time visitors without training.

## Positioning

Unlike a generic survey or classroom-only tool, Quiz Mania combines an instant code-based play loop with lightweight public sharing and post-game analytics in one free flow: the mechanism is create once → publish → share code/link → play → scored result with review. Draft vs published, retake control, time limits, categories, multi-select/true-false/multiple-choice, and per-answer explanations are the differentiated depth that a copy-paste quiz clone cannot truthfully match without the full stack.

## Operating Context

- Web product: Django REST Framework + React (Vite, Tailwind) frontend under `client/`, Django backend with SQLite by default, JWT auth.
- Core workflows: register/login → create quiz (details + questions 2–6 options) → save draft or publish → share 8-char code → join/play with timer → submit → scored result → creator analytics/leaderboard → taker history in My Results.
- Adjacent surfaces: dashboard for owned quizzes, My Results for personal history, quiz results for creators, join-by-code.
- Public use: SEO/GEO/AEO — meta, semantic HTML, JSON-LD, sitemap/robots where applicable, fast first paint, mobile-first Operate UX.

## Capabilities and Constraints

Confirmed capabilities (from codebase and README):
- Auth: JWT access + rotating refresh, blacklist on logout, register returns tokens.
- Quiz: title, description, category (general/science/math/history/geography/technology/sports/entertainment/other), status (draft/published/archived), optional time limit, show-correct-answers, allow-retake, generated 8-char code.
- Questions: multiple_choice / true_false / multi_select, points, order, explanation, optional image, 2–6 options (enforced in UI; backend should enforce).
- Taking: by-code fetch for published quizzes only, countdown when time limit set, single vs multi answer handling, score = sum of correct points, time_taken recorded.
- Results: per-user history, creator view of results for owned quiz, percentage, sorted views.
- Backend apps: `quiz` (models), `accounts` (legacy template views), `api` (serializers, viewsets, auth).
- Frontend routes: /, /login, /register, /dashboard, /quiz/create, /quiz/edit/:id, /quiz/join, /quiz/play/:code, /quiz/results/:id, /my-results.
- Constraints: references to `primary-*` Tailwind colors must be defined; `App.css` centered `#root` must not constrain layout; images, env-driven API URL, production settings hardening required.
- Undecided: public deployment URL/domain (for SEO canonicals, sitemap, share links), final production DB (Postgres recommended over SQLite), image hosting/CDN.

## Brand Commitments

- Name: Quiz Mania (public deployment name Crouton Alpha is the service name; client-facing product name remains Quiz Mania).
- Presentation: playful / game-like (user-confirmed). Fun, energetic, quiz-game personality while staying usable by the public. Confirmed voice is simple, friendly, action-oriented. No binding palette/logo constraints beyond preserving the name.

## Evidence on Hand

- Repo: `README.md` (features, quick start), `requirements.txt` (Django 5.2, DRF, SimpleJWT, CORS), `Dockerfile`, `docker-compose.yml`.
- Code evidence: models in `quiz/models.py`, serializers/views in `api/`, settings in `Quiz_mania/settings.py`, pages in `client/src/pages/`.
- Absences future work must not fabricate: no testimonials, customer logos, pricing, benchmarks, traffic stats, or external press. Marketing copy must stay to real capabilities above. Demo/illustrative data must be labeled synthetic if shown.

## Product Principles

1. Instant playability beats setup friction — code/link → play in one step.
2. Both sides of the quiz matter equally — creators and takers share first-class flows.
3. Public by default — free, discoverable, and understandable to search and answer engines.
4. Scored honestly — correct answers, points, and explanations are never faked.
5. Fast and accessible for everyone — mobile-first, keyboard/screen-reader usable, resilient to errors and empty states.

## Accessibility & Inclusion

Target WCAG 2.2 AA: 44px touch targets, visible focus, labeled controls, error messages tied to fields, keyboard-complete quiz play, prefers-reduced-motion respect, contrast ≥4.5:1 body text. Mobile-first responsive; no horizontal scroll; text scales without breaking layout.
