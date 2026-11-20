# Phase 03.2 — Adaptive Bento Auto-Layout, Empty Space Correction & Circular Nutrition Progress

## Status

Implemented for the authenticated Dashboard page. The other five authenticated pages retain their existing Phase 03/03.1 shells, navigation, responsive typography, heroes, and page-specific Bento layouts.

## Root-cause audit

The remaining Dashboard imbalance was caused by nested stacks inside the lower grid:

- Calendar occupied one direct grid column.
- Workout and Weekly Activity were nested in a six-column stack.
- Today's Plan and Today's Summary were nested in a three-column stack.
- The parent grid therefore knew only about three children, so short cards could leave visually empty regions while the nested stacks continued independently.

The nutrition area also rendered four independent bordered cards below a separate heading. That duplicated surface boundaries and consumed more vertical space than the reference-inspired compact overview.

## Final Dashboard architecture

The Dashboard now uses direct grid participation for every lower card:

```text
Overview:    DashboardHero 8 columns | NutritionOverview 4 columns
Row 1:       Calendar 3 columns | Today's Workout 6 columns | Today's Plan 3 columns
Row 2:       Weekly Activity 8 columns | Today's Summary 4 columns
```

The desktop grid uses 12 fluid `minmax(0, 1fr)` tracks and named grid areas. Row 2 begins after the coordinated Row 1 track rather than inside independently stacked side columns. This removes the avoidable structural gap beneath Calendar while preserving content-driven card heights and natural page scrolling.

At 768–1023px the lower region becomes a single logical column to protect readability. Below 768px it remains a natural document-order stack: Calendar, Workout, Plan, Weekly Activity, Summary. No visual reordering conflicts with keyboard or screen-reader order.

The existing 03.1 fluid shell remains active: the grid expands to the available viewport with the shared 12–32px gutter token and no fixed screenshot dimensions.

## Unified Calories & Macros card

`NutritionOverview` is now one white Bento surface containing:

- `Calories & Macros` heading.
- Existing description and Meals Logged count.
- Four compact metric articles in a responsive 2×2 grid.

Each `MacroCard` now includes:

- An SVG circular track and FitPilot blue-gray progress stroke.
- Rounded stroke ends and a compact centered percentage.
- Existing consumed/target values.
- Existing remaining or over-target status text.
- Accessible `role="progressbar"` semantics with a bounded visual value and a readable `aria-valuetext`.

The visual fill is clamped to 0–100% while the displayed percentage remains the actual rounded percentage, so over-target data remains truthful. Existing `metric.remaining`, `metric.exceeded`, consumed values, targets, units, and API data flow are unchanged. Zero targets are protected by the existing API percentage contract and the visual clamp prevents invalid stroke geometry.

The ring uses a neutral track, a single FitPilot accent, and a responsive 64–84px size range. Required numbers remain visible as text; the ring is never the sole communication channel.

## Skeleton alignment

`DashboardSkeleton` now mirrors the production topology: 8–4 overview, 3–6–3 first Bento row, and 8–4 lower row. The loading behavior remains unchanged; only placeholder placement and dimensions were updated.

## Files changed

- `client/src/components/dashboard/DashboardContent.tsx` — flattened the lower grid into five directly placed items.
- `client/src/components/dashboard/NutritionOverview.tsx` — unified the nutrition parent surface and responsive metric grid.
- `client/src/components/dashboard/MacroCard.tsx` — replaced horizontal bars with accessible SVG circular progress rings.
- `client/src/components/dashboard/DashboardSkeleton.tsx` — aligned loading placeholders with the new grid areas.
- `client/src/index.css` — added named Dashboard grid areas, nutrition/ring styles, skeleton areas, and tablet/mobile adaptations.
- `docs/web/PHASE_03_2_ADAPTIVE_BENTO_LAYOUT.md` — this implementation report.

No backend, API, authentication, database, AI-service, Expo/mobile, nutrition-calculation, workout-logic, or other authenticated page implementation was changed for this phase.

## Validation

- Reference image `C:\Users\fonti\Downloads\0bf59d72860c28a26d3d74a312e7796c.webp` was directly inspected again. Its compact surfaces, asymmetric rows, and tight card relationships informed the structure; its 1200×900 canvas was not used as a layout constraint.
- The local Dashboard was reviewed in the available Brave session after the change.
- The accessibility tree confirmed the preserved navbar, hero, Rocco image, Dashboard links, all existing metrics, Calendar controls, Workout/Plan/Activity/Summary content, and four progress-bar semantics with values 85, 73, 98, and 54.
- Targeted ESLint for the four changed Dashboard components passed.
- `npm run build` passed (`tsc -b` and Vite production build); Vite emitted only the existing large-chunk advisory.
- `npm run lint` remains non-clean with the repository's existing 22 errors and 9 warnings in auth, toast, progress, settings, workout modal, layout, and page-hook code. The changed Dashboard files pass targeted lint; no lint rule or dependency was changed here.

## Browser verification limitation

The available native Brave review confirmed structure and accessibility content, but the browser access host did not provide deterministic viewport resizing or DOM computed-style extraction. Exact screenshot captures at 393×852, 768×1024, 1024×768, 1280×800, 1440×900, 1666×900, and 1920×1080 were therefore not produced. Fixed-viewport screenshot comparison and 200% zoom review remain the next QA pass when a controlled browser surface is available.

## Preservation checklist

- DashboardHero and the original Rocco mascot asset remain rendered.
- Existing Dashboard metrics, calendar, workout, activity, plan, summary, links, and loading state remain present.
- Existing data fetching, calculations, API contracts, route behavior, and interactions remain unchanged.
- No required text is clipped, line-clamped, hidden, or replaced with placeholder data.
- Other authenticated pages were not redesigned in this targeted phase.
