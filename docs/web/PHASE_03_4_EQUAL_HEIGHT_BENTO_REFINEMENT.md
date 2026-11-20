# Phase 03.4 — Equal-Height Bento Cards & Zero Unused Grid Space

## Status

Implemented in the Dashboard production layout and loading skeleton. This refinement preserves the Phase 03.3 12-column composition, nutrition redesign, Rocco hero, API data, and existing interactions.

## Confirmed sizing causes

The production Dashboard lower grid was still using `align-items: start`, so each named grid area sized its direct wrapper around its own content instead of stretching sibling surfaces to the shared row height. The overview also retained an `align-self: center` rule on the nutrition sibling, which could produce a shorter, vertically offset Calories & Macros surface.

The card wrappers did not provide a shared height contract to their inner `<section>` surfaces. As a result, Calendar could establish a taller first row while Weekly Activity and Today's Plan ended early, and Today's Summary could establish a taller bottom row while Today's Workout ended early. The loading skeleton used explicit utility heights (`h-72`/`h-80`), so it could not reliably mirror production row sizing.

## Corrected layout behavior

The approved Phase 03.3 placements remain unchanged:

```text
Overview:   Dashboard Hero 8 / Calories & Macros 4
Main row:   Calendar 3 / Weekly Activity 6 / Today's Plan 3
Bottom row: Today's Workout 7 / Today's Summary 5
```

The live production grid now uses `align-items: stretch`. Each direct placement wrapper is a flexible, stretchable grid item, and its card surface receives `width: 100%`, `height: 100%`, `min-width: 0`, and `min-height: 0`. This makes the tallest content-driven card establish the row height while its siblings share the same outer top and bottom boundaries.

The overview uses the same stretch behavior for Hero and Calories & Macros. The prior nutrition `align-self: center` exception was removed; the unified nutrition card remains content-safe while matching the hero's outer row height on desktop.

## Interior balancing

Equal-height surfaces are not filled with decorative content or fixed card heights. Existing content is distributed intentionally:

- Weekly Activity's chart region can grow with the shared row while retaining a readable minimum plotting area.
- Today's Plan uses a column flex layout so its existing action rows distribute through the available surface without changing their order or touch targets.
- Today's Workout is a column flex surface; its populated action link sits at the lower edge when the shared row is taller.
- Today's Summary keeps its existing primary metrics and secondary list, with the lower list anchored to the remaining interior space.
- Calendar keeps its seven-column date grid and natural content sizing.

No artificial spacer, negative margin, fixed viewport height, absolute positioning, truncation, or hidden overflow was introduced.

## Skeleton alignment

`DashboardSkeleton.tsx` now uses `min-h-*` placeholders instead of fixed `h-*` card heights. The shared skeleton grid uses stretch alignment and the same named areas as production. Its minimum placeholder sizes preserve a useful loading silhouette while allowing grid rows to size consistently. Responsive media rules return actual stacked dashboard surfaces to content-driven heights.

## Responsive behavior

- **1280px and above:** Hero and nutrition stretch as one overview row; Calendar, Weekly Activity, and Today's Plan share one equal-height row; Today's Workout and Today's Summary share one equal-height row.
- **1024–1279px:** The existing six-track fallback remains intact. Siblings that share a responsive grid row stretch together without forcing the page into the desktop three-panel density.
- **768–1023px:** The Dashboard uses the existing content-first column stack. Card surfaces return to `height: auto` so a narrow tablet is not padded to match unrelated content.
- **Below 768px:** Cards remain in logical source order with natural content-driven heights. The nutrition card retains its responsive ring layout.

The global `clamp()` typography, FitPilot palette, radius hierarchy, reduced-motion safety net, navbar, Rocco illustration, and all Dashboard data states remain unchanged.

## Files changed

- `client/src/index.css` — stretchable overview and Bento rows, direct wrapper sizing contract, interior flex rules, responsive natural-height overrides, and skeleton alignment.
- `client/src/components/dashboard/WeeklyActivityCard.tsx` — semantic class hooks for the flexible chart surface.
- `client/src/components/dashboard/TodayPlanCard.tsx` — semantic card hook for interior distribution.
- `client/src/components/dashboard/TodayWorkoutCard.tsx` — semantic card/action hooks for balanced lower-row placement.
- `client/src/components/dashboard/TodaySummaryCard.tsx` — semantic card hook for lower-list alignment.
- `client/src/components/dashboard/DashboardSkeleton.tsx` — stretch-compatible minimum placeholder heights.
- `docs/web/PHASE_03_4_EQUAL_HEIGHT_BENTO_REFINEMENT.md` — this report.

No backend, API, authentication, database, mobile, or business-logic files were changed.

## Validation

- `npm run build` — passed. Vite reports the existing large-chunk advisory; no build error was introduced.
- Targeted Dashboard ESLint — passed for the changed Dashboard component set, including the calendar, skeleton, nutrition, and all five lower-card components.
- `git diff --check` — passed. Git emitted only existing line-ending normalization warnings for other already-modified files.
- Full `npm run lint` — remains non-clean with 22 errors and 9 warnings in pre-existing Auth, Toast, PageHeader, Progress, Settings, and Workout modal/page code. No new issue was reported in the targeted Dashboard components.

## Browser verification limitation

A controlled browser surface with deterministic viewport resizing and computed DOM measurement was not available in this environment. Therefore this phase does not claim screenshot parity or measured one-pixel boundary confirmation.

When browser automation is available, capture the Dashboard at `1920×1080`, `1666×900`, `1440×900`, `1280×800`, `1024×768`, `768×1024`, `393×852`, and `320px`, then verify computed bounds for both overview siblings, all three main-row cards, and both bottom-row cards. Confirm no horizontal overflow, no avoidable exterior blank region, and natural-height behavior below 1024px.
