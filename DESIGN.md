# DESIGN.md — Quiz Mania

## Visual world
Broadcast trivia scoreboard. Arena white ruled by 2px charcoal lines, signal colours with fixed jobs, huge condensed numerals, flat bordered panels and exposed grid seams. No gradients, glass, blur, eyebrow labels, icon-card grids, or rounded-card defaults.

## Palette
- Arena: `#F2F0E9` (`arena-100`) page background; `#FAF9F4` (`arena-50`) soft panel fill; `#E7E4DA` (`arena-200`) rule/scrollbar.
- Paper: `#FFFFFF` panel surface.
- Ink: `#15161A` (`ink-900`) text, borders, topbar; `#343941` (`ink-700`) secondary; `#626A75` (`ink-500`) muted; `#8A919B` (`ink-400`) only on large display.
- Signal red `#E4262C` (`signal-red`) primary action, live lamp, wrong answer, caret.
- Signal red dark `#B71B20` (`signal-red-dark`) link text on white.
- Cobalt `#1746D1` (`signal-blue`) focus ring, selected answer lane, progress.
- Yellow `#F5C400` (`signal-yellow`) top score, highlight strip, review badge.
- Green `#0E7A4A` (`signal-green`) correct answer, success.

Colour jobs are fixed: red acts, blue selects/focuses, yellow scores/highlights, green confirms. No decorative colour.

## Typography
- Display and numerals: `Barlow Condensed` 600–800, uppercase, tight tracking, tabular figures.
- Body: `Barlow` 400–700.
- Loaded locally via `@fontsource` (no Google Fonts).
- Scale: `.display-xl` clamp(2.9rem, 7.4vw, 6rem); `.display-lg` clamp(2.25rem, 4.6vw, 3.9rem); `.display-md` clamp(1.75rem, 3.2vw, 2.6rem); body 15–16px.
- `.num` for tabular score digits; `.label` for 13px uppercase field labels.

## Layout
- `.container-page` max 1200px; `.container-wide` max 1440px.
- 2px charcoal borders on every panel; no floating cards.
- Exposed grid: `.lane-grid` 2 columns mobile, 3 columns at `sm`, with drawn seams.
- Score strips: `.score-strip` (4 cells), `.score-strip-3` (3 cells).
- Section spacing `mt-12` to `mt-16`; topbar and footer are full-width.

## Components
- Buttons: `.btn`, `.btn-primary` (red), `.btn-secondary` (white), `.btn-ghost`, `.btn-ghost-light`, `.btn-danger`, `.btn-sm`. Minimum 48px height, 40px for small.
- Inputs: `.input-field`, 48px min height, 2px border, blue focus ring with offset.
- Badges: `.badge`, `.status-live`, `.status-draft`, `.status-quiet`.
- Tables: `.data-table` with 2px charcoal header, 1px cell rules.
- Meters: `.meter` / `.meter-fill`.
- Lanes: `.lane`, `.lane-active`, `.lane-correct`, `.lane-wrong`, `.lane-letter`.
- Scoreboard: `ScoreDigits` (sm/md/lg/xl), `CodeEntry` (8 cells), `TimeRail`, `CopyCode`, `StatStrip`, `Meter`, `CheckMark`.
- Page shell: `PageHeader`, `EmptyState`, `Spinner`, `Alert`, `StatusBadge`, `AuthLayout`.

## Motion
- `lamp` blink on live indicators (2.4s steps).
- `digit-in` for score digits.
- `rail-out` for the time rail.
- All motion disabled under `prefers-reduced-motion`.

## Accessibility
- WCAG 2.2 AA contrast; text on white uses `ink-700` or darker for body; `ink-400` only at 12px+ on non-critical labels.
- 48px minimum touch targets; visible focus ring (3px cobalt, 3px offset).
- Semantic landmarks, skip link, labelled regions, reduced motion, keyboard-operable code entry and answer lanes.
- `aria-live` on timer and answer feedback.

## Responsive
- Mobile-first from 320px; no horizontal scroll at tested widths 390, 768, 1024, 1440.
- Code cells stack into a full-width grid at mobile, Play button wraps below.
- Tables gain horizontal scroll only where needed.

## Do / don't
- Do use flat 2px borders, thick rules, tabular figures, and words plus colour for state.
- Don't use gradients, glass/blur, drop shadows beyond the panel shadow, rounded cards, or generic icon grids.
- Don't introduce new colours; use the signal palette only.
- Don't add marketing claims beyond real capabilities.
