# Phase 03.1 — Full-Width Dashboard Layout & Horizontal Spacing Correction

## Status

Implemented in the web client. This phase supersedes the Phase 03 desktop width cap for authenticated dashboard surfaces while preserving the approved Bento composition, palette, typography, card geometry, and page content.

## Root-cause audit

The excessive desktop whitespace came from the shared shell rather than from the individual page grids:

- `client/src/index.css` defined `--dashboard-max: 1320px`.
- `.dashboard-container` used that token as `max-width` and was centered with `mx-auto`.
- `.dashboard-top-nav__inner` used the same cap, so navigation and page content could not share the available desktop width.
- The page grids already used fluid tracks, but they were being asked to fill a constrained parent.

The reference image was inspected directly at 1200×900. Its centered shell was treated as a visual relationship only; no screenshot aspect ratio or fixed canvas dimensions were introduced into the implementation.

## Implemented correction

### Shared fluid shell

In `client/src/index.css`:

- Changed `--dashboard-max` from `1320px` to `100%` for the authenticated web shell.
- Added explicit `width: 100%` to `.dashboard-container` and `.dashboard-top-nav__inner`.
- Kept the existing container structure and `mx-auto` compatibility so no route or component contract changed.
- Preserved the shared navbar/page alignment by using the same `--dashboard-pad` token in both surfaces.
- Added a bounded hero text/image safe area so the wider shell does not stretch the Rocco illustration or create oversized empty hero interiors.

### Horizontal gutter strategy

The existing gutter token now uses:

```css
--dashboard-pad: clamp(0.75rem, 0.55rem + 1.1vw, 2rem);
```

This yields approximately 12–32px per side across the target range, with small balanced margins on mobile and desktop. Cards continue to use the existing responsive gap tokens and `minmax(0, 1fr)` tracks, so the Bento surfaces expand with the available work surface instead of remaining capped.

| Viewport | Approx. side gutter | Approx. usable shell width* |
| ---: | ---: | ---: |
| 390px | 12px | 366px |
| 768px | 17px | 734px |
| 1024px | 20px | 984px |
| 1280px | 23px | 1234px |
| 1440px | 24px | 1392px |
| 1666px | 27px | 1612px |
| 1920px | 30px | 1860px |
| 2560px | 32px | 2496px |

\*Source-derived layout estimates before any browser scrollbar width. These are calculated from the CSS clamp token, not from a fixed screenshot coordinate system.

## Page impact

All six authenticated routes inherit the same fluid shell without changing their content mapping or business logic:

- Dashboard: the reference-inspired overview and 12-column Bento grid now expand across the available width.
- Workouts: the training workspace and supporting cards receive the additional width while retaining their page-specific spans.
- Meals: meal logging, nutrition panels, calendar, and history use the same expanded parent grid.
- AI Coach: the chat-focused workspace remains content-led and gets a wider usable conversation surface.
- Progress: analytics and check-in sections share the full-width shell; internal chart/form proportions remain page-specific.
- Settings: form-heavy cards gain space without changing fields, actions, persistence, or account behavior.

The six original Rocco hero components and mascot assets remain intact. The hero containment rules only limit internal text/image proportions at desktop widths; they do not crop, replace, hide, or distort the mascot.

## Responsive and accessibility safeguards

- Mobile and tablet breakpoints continue to stack/reorganize the existing grids instead of forcing desktop spans into narrow widths.
- No `100vw` width was introduced, avoiding scrollbar-induced horizontal overflow.
- Existing `min-width: 0`, fluid typography, focus states, reduced-motion rules, and mobile top-sheet navigation remain unchanged.
- No required content is clipped or truncated to solve width issues.
- The navbar uses the same gutter system as the page content and keeps active-route, account, logout, and mobile-menu behavior intact.

## Browser review and validation

The local authenticated Dashboard was reviewed in the available Brave session after the change. The rendered page showed the horizontal navbar, Rocco hero, nutrition cards, calendar, workout/activity region, and supporting panels with the new fluid shell; the mascot remained visible and the existing content was present.

The available browser session did not provide deterministic viewport resizing or DOM computed-style extraction for each requested viewport, so exact live measurements at 393×852, 768×1024, 1024×768, 1280×800, 1440×900, 1666×900, 1920×1080, and 2560×1440 were not captured. The table above is the source-derived measurement record. A fixed-viewport screenshot comparison should remain part of the next QA pass when Playwright or an equivalent viewport-controlled browser is available.

## Files changed

- `client/src/index.css` — removed the authenticated shell width cap, established the fluid gutter behavior, and bounded desktop hero internals.
- `docs/web/PHASE_03_1_FULL_WIDTH_DASHBOARD_FIX.md` — this implementation and validation report.

No backend, mobile, authentication, API, database, AI-service, or unrelated files were changed for Phase 03.1.

## Verification commands

- `npm run build` — passed after the correction. Vite emitted only the repository's existing large-chunk advisory.
- `npm run lint` — not clean; it reports 22 errors and 9 warnings across existing auth, toast, progress, settings, workout-modal, and layout code. The report includes React hook set-state-in-effect findings and existing PageHeader fast-refresh/unused-prop findings. No lint rule or dependency was changed for this targeted width correction.

The lint failure is recorded rather than treated as a visual success. The full-width correction itself is CSS-only in `index.css` and does not alter application logic or API behavior.
