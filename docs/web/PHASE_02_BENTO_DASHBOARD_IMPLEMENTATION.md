# Phase 02 — Bento Dashboard Implementation

Status: implemented in the web client

This phase applies the approved Phase 00 visual blueprint and Phase 01 responsive system to the authenticated React/Vite dashboard. The mobile Expo app, server, AI service, authentication contracts, and database were not modified.

## Completed implementation

- Replaced the rendered sidebar with a sticky horizontal FitPilot top navigation.
- Preserved the six authenticated routes and navigation order: Dashboard, Workouts, Meals, AI Coach, Progress, Settings.
- Preserved logout confirmation, token/session clearing, query-cache clearing, and redirect behavior.
- Added a keyboard-friendly mobile top-sheet menu with Escape handling and a desktop account menu.
- Added the Phase 01 semantic CSS tokens for palette, fluid typography, spacing, radii, and motion.
- Applied the documented 20px primary, 16px secondary, and 11px control geometry through the authenticated dashboard shell.
- Added a centered 1320px dashboard container with responsive gutters and compact reference-inspired density.
- Added responsive Bento wrapper strategies for Dashboard, Workouts, Coach, Progress, and Settings while retaining existing child component order and data flow.
- Preserved all six Rocco hero components and their original image assets. Hero surfaces now use the approved solid FitPilot deep accent and content-driven responsive sizing; mascot images continue to use contain behavior.
- Removed line-clamp usage from workout names and descriptions where it could conceal actual content. Required content is allowed to wrap and expand its card.
- Added reduced-motion safety rules and avoided introducing a new motion dependency.

## Shared design-system changes

`client/src/index.css` now owns the implementation tokens:

- `--type-hero`, `--type-page`, `--type-section`, `--type-card`, `--type-metric`, `--type-body`, `--type-control`, `--type-label`, `--type-meta`, and `--type-chart` use bounded `clamp()` values in rem units.
- `--dashboard-max` is 1320px; page gutters, card padding, grid gaps, and section gaps scale fluidly.
- FitPilot palette values remain `#F5F3F6`, `#FFFFFF`, `#38323F`, `#7482A4`, `#667493`, and `#B6A2B6`.
- Primary surfaces use 20px corners, supporting cards use 16px corners, and compact controls use 11px corners.
- Focus rings, selection color, input focus treatment, reduced-motion behavior, and overflow-safe sizing are defined at the shell level.

## Navigation implementation

`AppTopNav.tsx` is the rendered authenticated navigation. It uses the existing route destinations and icon system, reads the existing local account record only for presentation, and keeps logout behavior identical to the former sidebar. The mobile menu is a top sheet rather than a replacement sidebar. `PageHeader` remains the page title/search row and no longer duplicates the global notification/avatar controls.

## Page updates

- Dashboard: 12-column shell with a 9-column primary work surface and 3-column utility rail.
- Workouts: 12-column asymmetric placement for the hero, split/session utilities, exercise workspace, history, and motivation card.
- Meals: existing parser-first two-column content architecture retained with shared dashboard spacing and responsive collapse.
- AI Coach: existing 8–4 context/chat architecture retained, with unconstrained chat content and responsive min-width behavior.
- Progress: existing 8–4 analytics/check-in architecture retained with shared overview/workspace wrappers.
- Settings: existing 8–4 hero/forms/supporting-rail architecture retained, with forms allowed to expand for long labels and values.

No cards, actions, loading states, empty states, error states, modals, API calls, calculations, or business rules were intentionally removed or replaced.

## Files changed

### Added

- `client/src/components/layout/AppTopNav.tsx`
- `docs/web/PHASE_02_BENTO_DASHBOARD_IMPLEMENTATION.md`

### Updated

- `client/src/layouts/MainDashboardLayout.tsx`
- `client/src/components/layout/PageHeader.tsx`
- `client/src/index.css`
- `client/src/components/dashboard/DashboardContent.tsx`
- `client/src/components/dashboard/DashboardHero.tsx`
- `client/src/components/workout/WorkoutContent.tsx`
- `client/src/components/workout/WorkoutHero.tsx`
- `client/src/components/workout/QuickSessionPreview.tsx`
- `client/src/components/workout/WorkoutSplitCard.tsx`
- `client/src/components/workout/TodayExerciseList.tsx`
- `client/src/components/workout/modals/ChangeWorkoutSplitModal.tsx`
- `client/src/components/meal/MealContent.tsx`
- `client/src/components/meal/MealHero.tsx`
- `client/src/components/coach/CoachContent.tsx`
- `client/src/components/coach/CoachHero.tsx`
- `client/src/components/progress/ProgressContent.tsx`
- `client/src/components/progress/ProgressHero.tsx`
- `client/src/components/settings/SettingsContent.tsx`
- `client/src/components/settings/SettingsHero.tsx`

## Validation

- `npm run build` — passed (`tsc -b` and Vite production build).
- `npm run lint` — passed.
- Reference image — directly inspected at 1200×900 before implementation.
- Browser screenshot comparison — not available in this environment because the browser access host was unavailable; no pixel-parity claim is made.
- Desktop/mobile route screenshots — not captured for the same browser limitation. The implementation uses the documented 320–1920px CSS breakpoints and should receive the next visual QA pass when a browser surface is available.

## Follow-up visual QA

When browser access is available, capture Dashboard at 1440×900 and each authenticated route at 390px and 1440px. Compare shell width, nav baseline, hero image bounds, card radii, 3–6–3 balance, 8–4 workspace balance, chart overflow, form wrapping, focus states, and the mobile top-sheet interaction against the Phase 00/01 acceptance criteria.
