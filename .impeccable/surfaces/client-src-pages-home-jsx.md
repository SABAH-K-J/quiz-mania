---
version: 1
slug: "client-src-pages-home-jsx"
primary_target: "client/src/pages/Home.jsx"
related_targets: ["client/src/pages/PlayQuiz.jsx","client/src/pages/JoinQuiz.jsx","client/src/pages/Dashboard.jsx","client/src/pages/QuizResults.jsx","client/src/pages/MyResults.jsx","client/src/components/QuizBuilder.jsx"]
---

# Surface brief: Quiz Mania web app

## Scope and visitor mode

The full public web app: home (Persuade), join/play/results (Operate), creator builder, dashboard and analytics (Operate), auth (Operate). The visual world is shared across all routes; only the composition changes with the task. The redesign replaces the incumbent dark purple gradient/glass system completely.

## Audience, job, action

Creators (teachers, trainers, students, community hosts) need a blank page to become a playable, shareable quiz without friction. Players (students, friends, class groups) need to turn an 8-character code into a score within seconds. The home page's job is to make the code mechanism legible enough to try immediately; its primary action is the working code entry, with account creation as the visible second door.

## Proof and content

Only real capabilities: three question types (multiple choice, true/false, multi-select), 2-6 options, per-question points, optional quiz timer, explanations, draft/publish, 8-character code, instant scoring, retakes, creator analytics, personal history. No testimonials, counts, prices, benchmarks or customers. The sample round in the hero is design material and is labelled as a sample.

## Constraints

Preserve routes, API behaviour, content truth, keyboard access, WCAG 2.2 AA contrast and targets, reduced motion, semantic landmarks, responsive behaviour from 320px up, and SEO metadata. No gradient text, no decorative glass/blur, no eyebrow labels, no equal icon+heading+text card grids, no rounded-card default.

## Chosen direction and memorable moment

Broadcast trivia scoreboard, user-pinned: arena white and charcoal, signal red/cobalt/yellow, huge condensed numerals, scoreboard panels and thick rules. The memorable moment is the hero itself acting as a working board: eight code cells and a live sample round with answer lanes, clock and score digits.

## Direction contract

THESIS: Quiz Mania is a live arena scoreboard, not a friendly SaaS dashboard. It refuses the dark gradient/glass template and the equal icon-card grid; every screen is a working board where the code, clock and score are the primary objects.

OWN-WORLD: Arena white `#F2F0E9` and panel white `#FFFFFF` ruled by 2px charcoal `#15161A`; signal red `#E4262C`, cobalt `#1746D1` and yellow `#F5C400` with fixed jobs; Barlow Condensed for display and numerals, Barlow for body; square corners, thick rules, lane strips, segmented clocks, tabular figures; no gradients, glass or blur.

STORY: A visitor understands it is free, sees the 8-character code mechanism working in the hero, and can either enter a code or start building. Creators meet the same board language as a control room, not a different product.

FIRST VIEWPORT: A full-width bordered arena board under the topbar. Left: "THE BOARD IS OPEN." at display scale, a one-line offer, eight code cells with a red PLAY action, and a visible "Build a quiz" second action. Right: a labelled sample-round panel with clock, question, four answer lanes and score digits, interactive on click. A red live strip spans the board's top edge.

FORM: Broadcast trivia scoreboard; candidate 6 of 7 grounded directions, ordered by resonance; the roll assigned index 6. seed:042d207d315fbbe4.

Raises carried from the weighed challengers: SIGNAL DISCIPLINE (donor: indoor weather sun) - four flat signal colours with fixed jobs, committed at page scale, no gradient. TABULAR TRUTH (donor: Ikeda datamatics) - scores, codes, clocks and counts always sit in strict tabular columns; the data structure is the composition. MEASURED SCALE (donor: VU meter bridge) - time and score use calibrated rails and segments with a red zone, never soft rounded progress bars. LEDGER HONESTY (donor: provenance ribbon) - every state (draft, live, correct, skipped, wrong) is written in words as well as colour. EXPOSED GRID (donor: punk paste-up table) - panel seams and section boundaries are drawn; the page shows its board construction instead of floating cards.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
