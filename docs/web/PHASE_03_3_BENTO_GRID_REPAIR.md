# Phase 03.3 — Critical Bento Grid Repair & Reference-Accurate Dashboard Layout

## Status

Implemented in the Dashboard production layout and loading skeleton. This phase repairs the broken Phase 03.2 grid architecture while preserving the Phase 03.2 unified nutrition card, circular indicators, Rocco hero, API data, and Dashboard functionality.

## Confirmed root cause

The production Dashboard grid was not using the intended Phase 03.2 span map. Its live first row was:

```text
calendar × 1 | workout × 5 | plan × 6
```

That left Calendar with one flexible track and gave Today's Plan most of the row. Because Workout and Plan also contained nested content structures, the result was an unreadable Calendar, disproportionate panels, and a visually disconnected lower composition. The skeleton used a different map, so loading and populated states did not share the same geometry.

## Corrected desktop architecture

At 1280px and above, the Dashboard now uses one coordinated 12-column grid with these exact named rows:

```text
Main row:   calendar × 3 | activity × 6 | plan × 3
Bottom row: workout × 7  | summary × 5
```

The production CSS is:

```css
grid-template-columns: repeat(12, minmax(0, 1fr));
grid-template-areas:
  "calendar calendar calendar activity activity activity activity activity activity plan plan plan"
  "workout workout workout workout workout workout workout summary summary summary summary summary";
```

Every row was source-checked to contain exactly 12 named tracks. No `grid-auto-flow: dense`, absolute positioning, fixed screenshot dimensions, or artificial row heights were introduced.

The DOM order now follows the visual reading order: Calendar, Weekly Activity, Today's Plan, Today's Workout, Today's Summary. This keeps keyboard and screen-reader order aligned with the new composition.

## Responsive placement

### 1024–1279px

The Dashboard lower grid uses six fluid tracks before the tablet stack:

```text
Row 1: Calendar 3 / Weekly Activity 3
Row 2: Today's Plan 3 / Today's Workout 3
Row 3: Today's Summary 6
```

This gives Calendar and the chart usable half-width surfaces rather than forcing three narrow panels.

### 768–1023px

The existing content-first flex stack takes over, preserving the logical order and readable card widths.

### Below 768px

The cards stack naturally in source order. The nutrition card continues to use its responsive 2×2 ring layout where space allows, without horizontal scrolling or required-content truncation.

## Empty-space correction

The previous nested `work` and `stack` wrappers have been removed from the Dashboard composition. Each card now participates directly in the same grid, so row boundaries are determined by the intended main/bottom regions rather than by unrelated nested column heights. Lower cards remain content-driven; the implementation does not stretch short cards with `height: 100%` or reserve empty grid tracks.

The center analytical surface is now Weekly Activity, matching the reference's dominant central-chart hierarchy. Calendar and Today's Plan read as compact side panels, while Today's Workout and Today's Summary form the balanced lower split.

## Calendar repair

`DashboardCalendar.tsx` already used a seven-column date grid and was preserved. Its parent now provides a real three-track desktop region, so the heading, month label, controls, weekday labels, date cells, and workout/meal indicators remain readable without shrinking or hiding content. No clipping rule was added to conceal overflow.

## Nutrition and hero preservation

- `NutritionOverview` remains one unified white surface with the four SVG circular progress indicators from Phase 03.2.
- Real Calories, Protein, Carbs, and Fat values, percentages, targets, remaining values, and exceeded states remain unchanged.
- `DashboardHero` retains the original Rocco illustration, headline, focus label, remaining metrics, and View Today's Plan action.
- No Dashboard feature, API contract, calculation, or interaction was removed.

## Skeleton alignment

`DashboardSkeleton.tsx` now mirrors the corrected production map:

```text
Overview: Hero 8 / Nutrition 4
Main:     Calendar 3 / Activity 6 / Plan 3
Bottom:   Workout 7 / Summary 5
```

The 1024–1279 six-track fallback and tablet/mobile stacking are also represented by the shared CSS.

## Files changed

- `client/src/components/dashboard/DashboardContent.tsx` — direct card order and placement hooks.
- `client/src/components/dashboard/DashboardSkeleton.tsx` — corrected loading geometry and source order.
- `client/src/index.css` — corrected 12-track areas, added six-track laptop layout, and removed the mismatched production geometry.
- `docs/web/PHASE_03_3_BENTO_GRID_REPAIR.md` — this report.

The Phase 03.2 nutrition components and DashboardCalendar implementation were inspected and preserved. No unrelated authenticated page, backend, mobile Expo, authentication, database, or AI-service code was changed in this phase.

## Validation

- Reference image `C:\Users\fonti\Downloads\0bf59d72860c28a26d3d74a312e7796c.webp` was inspected directly. Its narrow-left / dominant-center / narrow-right composition informed the corrected layout; its 1200×900 canvas was not used as a production dimension.
- Source validation confirmed all Dashboard named rows contain exactly 12 tracks at desktop and six tracks at the laptop fallback.
- `npx eslint` targeted at all Dashboard components passed.
- `npm run build` passed (`tsc -b` and Vite production build). The existing large-chunk advisory remains.
- Full `npm run lint` remains non-clean with 22 errors and 9 warnings across existing auth, toast, progress, settings, workout-modal, layout, and page-hook code. No lint issue was reported in the targeted Dashboard component set.

## Browser verification limitation

The configured browser access host was unavailable. The available native Brave window was on the project conversation tab rather than the local authenticated Dashboard, and deterministic viewport resizing/DOM computed-style extraction was not available. Therefore, no final screenshot comparison or computed Calendar pixel measurement is claimed for this phase.

Outstanding QA when a controlled browser surface is available:

1. Capture 1280×800, 1440×900, 1666×900, and 1920×1080 Dashboard screenshots.
2. Capture 1024×768, 768×1024, 393×852, and 320px layouts plus a 200% zoom pass.
3. Inspect computed Calendar, Weekly Activity, Plan, Workout, and Summary bounds.
4. Confirm no horizontal document overflow and no avoidable blank region beneath the coordinated rows.
5. Compare the final composition against the reference at a consistent desktop viewport.
