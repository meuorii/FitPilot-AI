# FitPilot AI — Phase 01 Responsive Design System & Implementation Plan

Status: planning complete; implementation deferred to Phase 02.

Approved visual authority: [Phase 00 Bento Dashboard Blueprint](./PHASE_00_BENTO_DASHBOARD_BLUEPRINT.md)

Scope: the authenticated React/Vite/Tailwind web application under `client/`. This phase defines
responsive architecture, fluid typography, component-level styling work, and validation. It does not
modify React, TypeScript, Tailwind, global CSS, layout, route, API, authentication, mobile, server, or
AI-service files.

## 1. Phase 01 decisions

Phase 00 remains the visual authority: centered light work surface, horizontal top navigation,
reference-derived 12-column bento composition, compact density, tiered 20/16/11 px radii, restrained
FitPilot palette, and all six Rocco heroes. Phase 01 adds the implementation rules needed to make that
system behave fluidly.

Roadmap:

| Phase | Responsibility | Output |
| --- | --- | --- |
| Phase 00 | Approved visual blueprint | Reference measurements, page compositions, preservation matrix |
| Phase 01 | Responsive architecture, typography planning, implementation preparation | This document: tokens, spans, component mapping, QA contract |
| Phase 02 | Actual frontend implementation | Changes to `client/` only, following this plan |
| Subsequent phases | Visual refinement, responsive QA, regression validation | Browser captures, accessibility/overflow fixes, state verification |

The implementation target is not “scale everything down.” It is a coordinated system in which font
size, line-height, card padding, hero proportions, grid spans, and control widths change together while
the reference’s compact hierarchy stays intact.

## 2. Typography audit and existing implementation

### 2.1 Current structure reviewed

The authenticated route tree is in `client/src/App.tsx` and is wrapped by
`MainDashboardLayout.tsx`. The current shell uses `AppSidebar` and a page-level `PageHeader`. The six
page families are composed through:

- `DashboardContent` and dashboard cards/calendar/hero/skeleton.
- `WorkoutContent` and workout hero, exercise workspace, split/session/history cards, modals, and states.
- `MealContent` and meal hero, AI parser, date/calendar, nutrition, meals list/history, modals, and states.
- `CoachContent` and coach hero/context/chat/composer/message/prompt/capability components and states.
- `ProgressContent` and progress hero/check-in/analytics/chart/history components, modals, and states.
- `SettingsContent` and settings hero/account/forms/fields/security/quick actions, plus loading/error states.

`index.css` currently only imports Tailwind. There is no shared semantic typography token layer yet.
Most authenticated components use utility classes directly, so Phase 02 should add semantic CSS tokens
and then migrate page/dashboard classes deliberately rather than performing a blind global search/replace.

### 2.2 Existing font and typography

The authenticated dashboard does not explicitly load a new font. It resolves the existing Tailwind
sans/system stack. Preserve that behavior and do not install or import a new typeface.

Current patterns observed:

| Area | Current pattern | Responsive risk |
| --- | --- | --- |
| Page headers | `text-3xl`, then `sm:text-[34px]`; fixed `text-xl` error title | Abrupt jump between mobile and tablet; long names can dominate the shell |
| Hero headings | Usually `text-3xl sm:text-4xl lg:text-[44px]`; MealHero already uses `clamp(1.55rem, 2.3vw, 2.25rem)` | Inconsistent hero scale across six pages; fixed 44 px is too large in narrow 8-column/tablet states |
| Hero descriptions | `text-sm`, `sm:text-base`, or fixed `text-xs`/`leading-5` in MealHero | Text width and mascot width compete; line lengths change abruptly |
| Card headings | Predominantly `text-lg`; some `text-base`, `text-sm`, or `text-2xl` motivation/error titles | Cards do not share a semantic hierarchy; narrow rails can wrap unexpectedly |
| Metric values | Mix of `text-xl`, `text-lg`, `text-base`, and fixed unit labels | Large numbers and units can collide or wrap inconsistently |
| Labels/meta | Frequent `text-xs`, `text-[11px]`, `text-[10px]`, and some `text-[9px]` | The smallest values are difficult at zoom and on small screens; labels can become visually noisy |
| Buttons | Mix of `text-xs`, `text-sm`, `text-base`, and fixed heights | Button label width and 44 px hit area are not expressed by one system |
| Form fields | Mostly fixed `text-sm`/`text-base` plus fixed label sizes | Long names, select values, and validation messages need width and wrapping rules |
| Charts/calendar | `text-[9px]`, `text-[10px]`, `text-[11px]`, `text-xs` | Axis/weekday labels are at risk below readable minimum; fixed SVG/container assumptions can clip |
| Empty/error/loading | Mostly fixed `text-xs`/`text-sm`, `leading-5`/`leading-6` | Long error copy can overflow compact side cards or be visually underweighted |
| Long-content previews | Some `line-clamp-2` in workout preview content | Acceptable only for nonessential previews; never use to hide required content or AI responses |

Existing `clamp()` usage in auth pages is evidence that the project can support the pattern, but those
pages are out of Phase 01 scope. The dashboard plan below introduces an authenticated-only semantic
scale; auth/onboarding styles remain unchanged until separately scoped.

### 2.3 Current hard-coded values to migrate in Phase 02

The implementation should prioritize these classes for semantic token replacement:

- `PageHeader.tsx`: page title `text-3xl sm:text-[34px]`, subtitle `text-sm sm:text-[15px]`.
- Six hero components: fixed `text-3xl`, `sm:text-4xl`, `lg:text-[44px]`; fixed `text-xs`/`text-sm`
  descriptions and fixed `text-[10px]` metric labels.
- Dashboard cards: `text-lg` headings, `text-xs` contextual copy, `text-[11px]` activity labels.
- Workout/meal/coach/progress/settings cards: repeated `text-lg`, `text-base`, `text-sm`, `text-xs`,
  `text-[11px]`, and `text-[10px]` classes that should map to role tokens.
- All page skeleton/error/empty components: fixed small text and fixed line-height values.
- Modal titles and body copy: migrate only authenticated dashboard modals; do not change auth modal
  contracts in this phase.

The migration must be role-based, not purely numeric. A `text-sm` class may represent body copy,
button text, or a metric unit today; those roles should not all receive identical clamp values.

## 3. Fluid typography specification

### 3.1 Semantic tokens

These are the finalized Phase 01 recommendations. They use `rem` for user zoom compatibility and a
bounded `vw` preferred term so the interface grows smoothly without becoming a display page.

```css
:root {
  --type-hero: clamp(1.5rem, 1.15rem + 1.15vw, 2.75rem);       /* 24–44px */
  --type-page: clamp(1.375rem, 1.14rem + 0.72vw, 1.875rem);    /* 22–30px */
  --type-section: clamp(0.9375rem, 0.86rem + 0.24vw, 1.125rem); /* 15–18px */
  --type-card: clamp(0.875rem, 0.82rem + 0.22vw, 1rem);        /* 14–16px */
  --type-metric: clamp(1.25rem, 1rem + 0.8vw, 1.875rem);       /* 20–30px */
  --type-metric-compact: clamp(1rem, 0.9rem + 0.45vw, 1.375rem); /* 16–22px */
  --type-body: clamp(0.875rem, 0.82rem + 0.22vw, 0.9375rem);   /* 14–15px */
  --type-control: clamp(0.8125rem, 0.77rem + 0.18vw, 0.9375rem); /* 13–15px */
  --type-label: clamp(0.75rem, 0.71rem + 0.15vw, 0.8125rem);  /* 12–13px */
  --type-meta: clamp(0.6875rem, 0.65rem + 0.16vw, 0.75rem);   /* 11–12px */
  --type-chart: clamp(0.6875rem, 0.64rem + 0.12vw, 0.75rem);  /* 11–12px */

  --leading-hero: 1.06;
  --leading-heading: 1.16;
  --leading-body: 1.5;
  --leading-control: 1.25;
  --leading-meta: 1.3;
}
```

The comments describe the intended 320–1440 px output range, not a promise that every browser will
render exact pixels at every zoom level. The values are deliberately bounded: the compact mobile
minimum remains readable, and the desktop maximum stays below the current 44 px hero ceiling.

### 3.2 Usage rules

| Token | Apply to | Do not use for |
| --- | --- | --- |
| `--type-hero` | Six Rocco hero headings | Page title or every card heading |
| `--type-page` | Page title in `PageHeader`, loading/error page title | Hero heading or metric value |
| `--type-section` | Section/card headings with primary information | Micro labels |
| `--type-card` | Standard card titles and compact list titles | Large hero or chart tick labels |
| `--type-metric` | Primary progress/calorie/goal values | Units, labels, or dense side-rail values |
| `--type-metric-compact` | Secondary metrics, card totals, chart summary values | Hero headline |
| `--type-body` | Descriptions, chat body, form help, error text | Button labels that need a slightly tighter control token |
| `--type-control` | Buttons, nav labels, inputs, selects, composer controls | Long AI responses |
| `--type-label` | Form labels, metric labels, card context labels | Required content that would become visually tiny |
| `--type-meta` | Dates, unit suffixes, list metadata, status context | Axis labels with dense values if contrast/space is insufficient |
| `--type-chart` | SVG/canvas tick labels and weekday labels | Chart titles or data values |

Use `line-height` tokens instead of repeating `leading-5`, `leading-6`, or `leading-none` unless the
content is a single-line numeric value. Metric numbers and units should be kept together with an
inline-flex wrapper and `white-space: nowrap` on the value/unit pair only; labels and descriptions must
wrap normally.

### 3.3 Safe wrapping and long content

- Never put `white-space: nowrap` on a page title, hero description, form label, AI message, exercise
  name, food description, or error message.
- Use `min-width: 0` on every grid/flex child that contains user or API data.
- Use `overflow-wrap: anywhere` for long names, email addresses, generated workout titles, and AI text.
- Use `text-overflow: ellipsis` only for a nonessential single-line preview where the full value is
  available in a details view or tooltip with an accessible name.
- Use `line-clamp` only on intentionally abbreviated previews such as a short workout-description
  snippet. Never clamp chat messages, AI responses, form labels, error copy, required metrics, or
  controls.
- Large numbers should use a flexible value container and allow a unit to move below the value in
  narrow cards rather than shrinking below `--type-meta`.
- Hero copy gets a content width cap (roughly 56–64% on desktop, 100% minus mascot safe area on
  mobile); the mascot gets the remaining safe area. If a heading wraps to three lines, the hero grows
  naturally—no fixed height should clip it.

### 3.4 Browser zoom and text scaling

The system must survive 200% browser zoom and Windows text scaling without horizontal overflow:

- Keep all type tokens in `rem`; do not convert them to fixed `px` in Phase 02.
- Avoid viewport-width-only font sizes and avoid setting `html { font-size }` as a scaling hack.
- Use content-driven `min-height`, not fixed height, on heroes, cards, chat, forms, and errors.
- Preserve 44 px minimum interactive hit areas after zoom; if a visual icon is smaller, its button remains
  at least 44 px.
- Verify that the top-sheet menu, modal, composer, and form fields remain reachable when zoomed.

## 4. Responsive layout and spacing strategy

### 4.1 Shared container tokens

```css
:root {
  --dashboard-max: 1320px;
  --dashboard-pad: clamp(1rem, 0.75rem + 1.1vw, 2rem); /* 16–32px */
  --grid-gap: clamp(0.75rem, 0.65rem + 0.35vw, 1rem);  /* 12–16px */
  --section-gap: clamp(1rem, 0.8rem + 0.55vw, 1.25rem); /* 16–20px */
  --card-pad: clamp(1rem, 0.9rem + 0.45vw, 1.5rem);    /* 16–24px */
}
```

The main authenticated container is `width: min(100% - 2 * var(--dashboard-pad), var(--dashboard-max))`.
Grid children always declare `min-width: 0`. The 12-column grid is the desktop source of truth; the
same DOM order collapses at lower widths rather than requiring page-specific duplication.

### 4.2 Viewport matrix

| Viewport | Container/grid | Navbar | Card behavior |
| --- | --- | --- | --- |
| 1920 | 1320 px max, 12 columns, 16 px gap | Full horizontal nav and account cluster | Preserve 3–6–3 / 8–4 spans; do not let cards stretch indefinitely |
| 1440 | 1320 px max, 12 columns, 16 px gap | Full horizontal nav | Primary visual comparison target; match Phase 00 density |
| 1280 | About 1216 px usable with 32 px inset, 12 columns, 16 px gap | Full nav if labels fit | Keep reference composition; reduce search width before changing spans |
| 1024 | 12 columns, 14 px gap, 24 px inset | Full nav or compact top-sheet trigger if crowded | Keep major 8–4 relationships; secondary lower cards may use 6–6 |
| 768 | 6 columns, 12 px gap, 20–24 px inset | Compact top bar; menu is top sheet | Hero full width; primary workspace 4 columns + rail 2 only when readable, otherwise stack |
| 430 | 1 column, 12 px gap, 16 px inset | Logo/current page/menu/avatar | One card per row; buttons full width where useful; mascot remains visible |
| 390 | 1 column, 12 px gap, 16 px inset | Same | Reference density becomes vertical order, not compressed side-by-side content |
| 360 | 1 column, 12 px gap, 16 px inset | Same | Long names wrap; no card relies on a fixed height |
| 320 | 1 column, 12 px gap, 16 px inset | Same; menu sheet full width | Overflow/collision stress target; chart internals may scroll only when unavoidable |

Breakpoints should describe layout transitions, not typography jumps. Typography remains fluid across all
widths; only grid topology, mascot safe area, button stacking, and menu behavior change.

### 4.3 Shared navigation behavior

Phase 02 will replace the proposed `AppSidebar` placement with a horizontal top nav in
`MainDashboardLayout.tsx`, while preserving its route links and logout logic. Desktop uses the approved
six-link order. At 768 px and below, the nav becomes a compact bar with an anchored/full-width sheet;
this is not a side drawer.

The menu sheet must have `aria-expanded`, `aria-controls`, Escape-to-close, focus return to the trigger,
and route-change close behavior. Search can collapse to a trigger below 1024 px, but it must preserve
the page-specific search value, placeholder, submit, and disabled states.

### 4.4 Grid topology by page

The following spans refine Phase 00 without changing its visual decisions:

| Page | Desktop 1024+ | Tablet 768 | Mobile 320–430 |
| --- | --- | --- | --- |
| Dashboard | Hero/overview 12; main 3–6–3; lower 5–4–3 | Hero 6; metrics 3×2; utility/workspace 6+6 or stacked by min width | Hero, metrics, calendar, workout/activity, plan/summary, one column |
| Workouts | Hero 8 + split 4; exercises 8 + session 4; history/motivation lower | Hero 6; split/session below; exercise list 6; history full | Hero, split, exercises, session, history, motivation |
| Meals | Hero/parser/list 8 + calendar/nutrition/actions 4; history full | Hero 6; parser/list 6; rail below; history full | Hero, parser, meals, calendar, nutrition, actions, tips, history |
| AI Coach | Hero 8 + context 4; chat 8 + capabilities/prompts 4 | Hero full; context; chat full; rail below | Hero, context, chat, prompts/capabilities |
| Progress | Hero 8 + check-in 4; analytics 8 + rail 4; check-ins full | Hero full; check-in; analytics full; rail; check-ins | Hero, check-in, analytics cards, week/milestones, check-ins |
| Settings | Hero 8 + summary 4; forms 4+4; security 8 + rail 4 | Hero full; summary; forms 6; security; rail | Hero, summary, account/profile/goals/preferences/security, rail actions |

Use `minmax(0, 1fr)` tracks, `minmax(18rem, 4fr)` for primary workspaces when content needs a
minimum, and `auto-fit` only for truly repeatable metric tiles. Do not let `auto-fit` change the
intentional 3–6–3 hero/dashboard composition.

## 5. Component mapping and responsive rules

### Shared layout and page context

| Component/file | Phase 02 responsive work |
| --- | --- |
| `MainDashboardLayout.tsx` | Add shared fluid container, top-nav slot, route outlet ordering, and `min-width: 0`; preserve auth boundary and outlet context semantics. |
| `AppSidebar.tsx` | Extract/preserve six links, active states, logout modal trigger, local/session token clearing, query clear, and navigate behavior for the top-sheet navigation. Do not retain a desktop sidebar. |
| `PageHeader.tsx` | Map title/subtitle/search/avatar to `--type-page`, `--type-body`, `--type-control`; let names wrap; keep page-specific search props and accessible labels. |
| `PageShell.tsx` | No new use in authenticated redesign; leave behavior outside scope. |
| `GlobalToast.tsx`, `Toast.tsx` | Keep overlay behavior; ensure toast text uses body/control tokens and can wrap at 320/200% zoom. |

### Dashboard

| Component | Strategy |
| --- | --- |
| `DashboardContent.tsx` | Implement the 12-column dashboard topology; preserve data props and DOM order for mobile. |
| `DashboardHero.tsx` | `--type-hero`, `--type-body`, `--type-metric-compact`; reserve mascot safe area; natural height; action remains inside hero. |
| `NutritionOverview.tsx`, `MacroCard.tsx` | Metrics use `--type-metric-compact` with inline-flex value/unit; 4-up desktop, 2×2 tablet, one/two-column mobile by available width. |
| `DashboardCalendar.tsx` | Fixed minimum touch target, fluid labels/weekday metadata; calendar cells do not shrink below readable content. |
| `TodayWorkoutCard.tsx`, `WeeklyActivityCard.tsx` | Primary central area; activity labels use `--type-chart` with accessible text values retained. |
| `TodayPlanCard.tsx`, `TodaySummaryCard.tsx` | Compact right stack; titles use `--type-card`, values use compact metric token; allow summary descriptions to wrap. |
| `DashboardSkeleton.tsx` | Skeleton blocks mirror hero/metrics/3–6–3 geometry and expand with content at narrow widths. |

### Workouts

| Component | Strategy |
| --- | --- |
| `WorkoutContent.tsx` | 8–4 desktop, explicit mobile order; `min-width: 0` on all workspaces. |
| `WorkoutHero.tsx` | Fluid hero heading/description/metrics; Rocco safe area; primary action wraps/expands without overlap. |
| `TodayExerciseList.tsx` | Exercise names use card/body tokens and wrap; search/filter controls remain 44 px; no line clamp on required names. |
| `WorkoutExerciseImage.tsx` | Preserve aspect ratio; media column can collapse below text without cropping semantic image. |
| `WorkoutSplitCard.tsx`, `QuickSessionPreview.tsx` | Rail becomes stacked; routine/session metrics use compact values and wrap units safely. |
| `RecentWorkouts.tsx`, `WorkoutMotivationCard.tsx` | History gets full width below 768; motivation remains support content, never the primary action. |
| `WorkoutSkeleton.tsx`, `WorkoutErrorState.tsx` | Mirror hero/workspace/rail order; error copy wraps naturally. |
| Workout modals | `ActiveWorkoutModal`, `ChangeWorkoutSplitModal`, `CreateWorkoutRoutineModal`, `CreateWorkoutSplitModal`, `EditWorkoutRoutineModal`, `ExerciseDetailsModal`, `RecentWorkoutDetailsModal`: fluid modal title/body/form tokens, max-width with `min(100% - 2rem, ...)`, scrollable content, no clipped exercise names or actions. |

### Meals

| Component | Strategy |
| --- | --- |
| `MealContent.tsx` | Preserve parser-first order and refs; use 8–4 desktop and one-column mobile. |
| `MealHero.tsx` | Existing clamp becomes the canonical hero pattern; keep mascot visible, parser CTA full width where needed, and feature copy allowed to wrap. |
| `AIMealParser.tsx` | Composer/input uses control token; textarea grows within a content-driven min-height; parsed result never clamps. |
| `MealTypeSelector.tsx`, `ParsedMealPreview.tsx`, `SmartInputPreview.tsx` | Controls and table/preview text use semantic tokens; long pasted nutrition data can scroll within its own region without clipping labels. |
| `TodayMealsList.tsx`, `MealImage.tsx`, `MealEmptyState.tsx`, `MealDateNavigator.tsx` | Names and descriptions wrap; image stays a bounded thumbnail; empty state uses body/error tokens and full-width action at mobile. |
| `MealCalendar.tsx`, `DailyNutritionOverview.tsx`, `TodayIntakeCard.tsx`, `NutritionSummary.tsx` | Rail cards stack; ring labels keep minimum size and units; calendar cells retain touch area. |
| `QuickMealActions.tsx`, `MealTips.tsx` | Actions become full-width rows on mobile; no hidden tip copy. |
| `MealHistoryPanel.tsx` | Full-width section; weekly/history rows use responsive columns or stacked labels, preserving all metrics. |
| `MealSkeleton.tsx`, `MealErrorState.tsx` | Mirror parser/list/rail silhouette and allow error copy to grow. |
| Meal modals | `SmartMealModal`, `ManualMealModal`, `MealDetailsModal`, `DeleteMealConfirmModal`: fluid fields, wrapped food names/descriptions, scrollable content, actions remain reachable at zoom. |

### AI Coach

| Component | Strategy |
| --- | --- |
| `CoachContent.tsx` | Hero/context then 8–4 chat/rail; mobile keeps chat composer after message content. |
| `CoachHero.tsx` | Fluid hero heading and context metrics; mascot safe area; no text under mascot. |
| `CoachContextCard.tsx` | Context rows use label/meta tokens, value container `min-width: 0`, and wrapping/truncation only for redundant previews. |
| `CoachChat.tsx`, `CoachMessageList.tsx`, `CoachMessageBubble.tsx`, `CoachFormattedMessage.tsx` | AI/user messages use body token and natural wrapping; no line clamp; long generated tables/code blocks scroll internally without hiding content. |
| `CoachComposer.tsx` | Textarea and send/attachment controls preserve keyboard behavior and 44 px targets; composer expands vertically rather than forcing overflow. |
| `CoachEmptyState.tsx`, `CoachErrorState.tsx` | Error/empty messaging uses body token and full-width retry/start action on mobile. |
| `CoachQuickPrompts.tsx`, `SuggestedPrompts.tsx`, `CoachCapabilities.tsx` | Prompt buttons may wrap to multiple lines; no horizontal overflow; capabilities stack below chat at tablet/mobile. |
| `CoachSkeleton.tsx` | Hero/context skeletons and chat skeleton use the same fluid geometry and do not reserve fixed text heights. |

### Progress

| Component | Strategy |
| --- | --- |
| `ProgressContent.tsx` | 8–4 hero/check-in, 8–4 analytics/rail, full-width check-ins; mobile order remains task-first. |
| `ProgressHero.tsx` | Fluid hero heading, metric values, and action; goal text wraps inside safe area; Rocco remains visible. |
| `QuickCheckInCard.tsx` | Form labels/values use label/control tokens; validation messages wrap; form remains usable at 200% zoom. |
| `GoalProgressCard.tsx`, `WeightTrendCard.tsx`, `BodyFatTrendCard.tsx`, `LatestCheckInCard.tsx` | Card headings use section/card tokens; measurements keep value/unit together; cards grow naturally if labels wrap. |
| `ProgressLineChart.tsx` | Chart labels use `--type-chart`; retain accessible data table/summary behavior if already present; reduce tick density by layout only, never by deleting data. |
| `ThisWeekCard.tsx`, `MilestonesInsights.tsx` | Right rail stack; compact metrics and insight copy wrap; no fixed-height crop. |
| `RecentCheckIns.tsx`, `ProgressLogCollection` | Full-width responsive rows; check-in dates/values remain visible; action controls stay reachable. |
| `ProgressEmptyState.tsx`, `ProgressErrorState.tsx`, `ProgressSkeleton.tsx` | Preserve all state copy and retry/log actions; use fluid body/title tokens and content-driven heights. |
| Progress modals | `AllCheckInsModal`, `DeleteProgressLogConfirmModal`: max-width, scrollable body, fluid titles, no clipped check-in values or destructive action labels. |

### Settings

| Component | Strategy |
| --- | --- |
| `SettingsContent.tsx` | 8–4 hero/summary, 4+4 form grid, 8–4 security/rail; mobile one-column sequence. |
| `SettingsHero.tsx` | Same hero token and mascot safe-area rules; metric labels never shrink below label token. |
| `AccountSummaryCard.tsx`, `GoalSnapshotCard.tsx` | Compact summaries use compact metric token and wrapped account/goal values. |
| `AccountInformationCard.tsx`, `ProfileInformationCard.tsx`, `GoalsNutritionCard.tsx`, `PreferencesCard.tsx`, `SecurityCard.tsx` | Form headings/labels/help/errors use semantic tokens; fields become one column at narrow widths; save actions remain visible and 44 px. |
| `SettingsQuickActions.tsx` | Stack action rows at mobile; preserve `onNavigate`, scroll, and focus behavior. |
| `SettingsTextField.tsx`, `SettingsSelectField.tsx`, `SettingsNumberField.tsx`, `PasswordField.tsx` | Use control/label tokens; select values and validation copy wrap; preserve focus/disabled/autocomplete semantics. |
| `SettingsErrorState.tsx`, `SettingsSkeleton.tsx` | Match hero/summary/form geometry and let status copy grow. |

## 6. Hero responsiveness plan

All six heroes preserve their original Rocco asset, alt text, identity, and action. The shared hero
contract is:

```text
desktop 1024+:  min-height: content-driven; text width 56–64%; mascot safe area 36–44%
tablet 768:     full width; text width about 58%; mascot moves to a safe lower/right region
mobile:         text block first; mascot remains visible in a bounded lower/right area; action below copy
```

Do not use fixed hero heights that assume one-line copy. Use `min-height` only as a visual baseline and
let the panel grow. The mascot is `object-contain`, anchored to the bottom/right safe area, with
`max-width` and `max-height` constraints rather than cropping. The text wrapper uses `min-width: 0`
and a responsive maximum width. At mobile, if copy and mascot compete, the mascot becomes a smaller
secondary visual region below or beside the text; it is never hidden.

| Hero | Fluid typography and positioning |
| --- | --- |
| `DashboardHero` | `--type-hero` for “Let’s crush today’s goals!”, `--type-body` for supporting copy, compact metric token for calorie/protein cards; preserve View Today’s Plan inside panel. |
| `WorkoutHero` | Same hero token; routine title/metrics may wrap; start/continue/manage/create/edit actions remain in a stacked action group at narrow widths. |
| `MealHero` | Existing clamp becomes the shared reference; preserve parser CTA and feature row, allowing the feature row to wrap or stack instead of hiding required copy. |
| `CoachHero` | Hero heading and three context metrics collapse from three columns to a wrapped list; Rocco remains in the lower/right safe area. |
| `ProgressHero` | Four metrics become 2×2 at tablet and stacked/flowing at mobile; Log Check-In stays inside the hero and remains full-width if necessary. |
| `SettingsHero` | Four metrics follow the same rule; Review Preferences remains in the text/action flow; image failure fallback remains accessible. |

Hero actions must never be positioned over the mascot, and no heading should be forced into a fixed
line count. Use `clamp()` for size, not `line-clamp` for content.

## 7. Content preservation checklist

Phase 02 must confirm all of the following before any visual QA is accepted:

- All six route links remain: Dashboard, Workouts, Meals, AI Coach, Progress, Settings.
- Existing profile/avatar fallback, notifications, search, and logout behavior remain available in the
  top-navigation pattern.
- All six original Rocco assets remain visible and recognizable at every target viewport.
- Dashboard retains hero, nutrition/macro values, calendar, workout, weekly activity, today’s plan,
  and today’s summary.
- Workouts retains routine/session actions, exercise list/library, split management, quick session,
  recent history, motivation, rest alarm, and every workout modal.
- Meals retains AI parser, meal type, parsed preview, today’s meals, calendar/date navigation,
  nutrition overview, quick actions, tips, history, manual/detail/delete/AI modal workflows.
- AI Coach retains context, chat messages, formatted workout responses, composer, attachments/prompts,
  capabilities, suggested prompts, avatars, retry, empty, and loading states.
- Progress retains goal, current/target/remaining values, charts, check-in form, weekly summary,
  milestones/insights, recent check-ins, search/filter, view-all, delete, and retry actions.
- Settings retains account/profile/avatar, goals/nutrition, preferences, security/password, goal
  snapshot, quick actions, save/loading/error/toast behavior, and field semantics.
- No API response shape, hook, mutation, query key, calculation, auth token behavior, database field,
  or business rule is changed.
- No required text is hidden by `line-clamp`, `overflow: hidden`, a fixed height, or a breakpoint-only
  `display: none` rule.

## 8. Phase 02 implementation sequence

1. Establish shared semantic tokens in `client/src/index.css`: palette aliases, radii from Phase 00,
   fluid type scale, leading, container padding, grid gap, and motion variables. No page markup change
   in the token-only commit.
2. Refactor `MainDashboardLayout.tsx` to the approved horizontal `AppTopNav` architecture and move
   the existing `AppSidebar` navigation/logout behavior into the top-sheet pattern. Preserve all auth
   and query-clearing behavior.
3. Update `PageHeader.tsx` to use the page type/body/control tokens, wrapping-safe title layout, and
   the compact search/avatar placement. Preserve every prop and route behavior.
4. Implement the shared grid/card primitives or class conventions using `minmax(0, 1fr)`, `min-width: 0`,
   content-driven heights, and Phase 00’s 20/16/11 px radius tiers.
5. Implement Dashboard first at 1440/390, matching the reference composition and validating the token
   scale. Then expand to 1024/768/430/360/320.
6. Apply the same tokens and topology to Workouts, Meals, AI Coach, Progress, and Settings in that
   order. Keep data props and child components unchanged; change only structure/classes needed for
   responsive composition.
7. Migrate each hero to the shared fluid hero contract, verifying the six original Rocco assets at
   every width before adjusting copy width or mascot constraints.
8. Migrate card headings, metrics, labels, buttons, form fields, chart labels, empty/error/loading
   messages, and modal text by semantic role. Review long-content cases after each page.
9. Add the interaction polish: explicit transform/color transitions, 44 px targets, trigger-origin
   menus, focus return, and reduced-motion tiering. Avoid `transition: all`, large scroll reveals,
   and keyboard-triggered animation.
10. Run client build/lint and browser validation only after the implementation is complete. Do not add
    new dependencies or touch mobile/backend/AI files.

Expected Phase 02 file areas:

```text
client/src/index.css
client/src/layouts/MainDashboardLayout.tsx
client/src/components/layout/AppSidebar.tsx
client/src/components/layout/PageHeader.tsx
client/src/components/dashboard/**
client/src/components/workout/**
client/src/components/meal/**
client/src/components/coach/**
client/src/components/progress/**
client/src/components/settings/**
client/src/components/modals/**
```

This list is a handoff boundary, not authorization to edit during Phase 01.

## 9. Validation checklist

### Visual fidelity

- Compare Dashboard at 1440×900 against the inspected reference composition: centered shell, nav line,
  compact overview band, 3–6–3 main row, asymmetric lower row, compact gaps, and tiered corner geometry.
- Confirm 20 px primary, 16 px secondary, and 11 px nested radii are visually distinct.
- Confirm no reference-only blue/purple/orange/green accents have entered FitPilot styling.
- Confirm the six heroes retain the original Rocco proportions and readable actions.
- Confirm no generic gradients, glass surfaces, floating decoration, duplicated KPI cards, or oversized
  whitespace have been introduced.

### Typography and accessibility

- Inspect every target viewport: 320, 360, 390, 430, 768, 1024, 1280, 1440, and 1920 px.
- Repeat critical checks at 200% browser zoom and with Windows text scaling where available.
- Confirm all required text uses a readable minimum: no dashboard content below 11 px; labels generally
  12 px or larger; body 14 px or larger.
- Confirm page/hero/card/metric/control roles use semantic clamp tokens rather than breakpoint-only
  fixed sizes.
- Confirm headings wrap naturally and retain one clear hierarchy; no line-clamp hides required content.
- Confirm contrast, focus-visible rings, keyboard order, accessible menu state, and focus return.
- Confirm reduced motion removes Tier 1 movement, softens Tier 2 transitions, and retains Tier 3 state
  feedback. No auto-motion over five seconds exists without a pause control.

### Overflow and long content

- Long full names, exercise names, meal descriptions, emails, generated AI responses, chart labels,
  validation messages, and error copy wrap without clipping.
- Large numeric values keep value/unit association without forcing the entire card wider.
- No horizontal page overflow at 320 px; internal chart/table scrolling is explicit and accessible if
  truly unavoidable.
- No fixed-height hero/card/form/chat container clips wrapped content.
- Buttons, icon buttons, menu items, calendar cells, and form controls maintain at least 44 px hit areas.

### Functional regression

- All six routes, search fields, top-sheet navigation, profile/avatar fallback, notifications, logout,
  existing modal open/close/confirm flows, data loading, retry, empty, success, error, and chat composer
  behavior remain intact.
- No API calls, hooks, types, calculations, auth/session storage, or query invalidation are changed.
- No mobile Expo files, server files, AI-service files, lockfiles, or deployment config are modified.

## 10. Phase 01 completion state

The responsive system is implementation-ready when the Phase 02 owner can implement the tokens, grid,
top navigation, hero safe areas, and semantic typography roles without inventing new content or making
new visual decisions. The approved Phase 00 blueprint remains unchanged; this document only adds the
technical responsive and fluid-type contract needed to implement it safely.

No frontend implementation has been performed in Phase 01.
