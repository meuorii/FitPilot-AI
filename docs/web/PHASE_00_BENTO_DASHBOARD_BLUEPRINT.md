# FitPilot AI — Phase 00 Bento Dashboard Blueprint

Status: blueprint complete; implementation intentionally deferred.

Scope: authenticated responsive web dashboard only (`client/`). This document preserves the
existing FitPilot content, actions, API behavior, and Rocco assets while defining a reference-led
visual architecture for Phase 01 implementation.

Reference inspected: `C:\Users\fonti\Downloads\0bf59d72860c28a26d3d74a312e7796c.webp`.
The supplied raster was visually inspected before this blueprint was written. It is a 1200 × 900
light crypto dashboard reference. Its visible dashboard shell occupies approximately x=59–1140,
y=66–834 (about 1081 × 768); the outer grey field is not part of the product surface.

## 1. Direction and non-negotiables

FitPilot is an authenticated fitness operating surface: people use it frequently, scan it quickly,
and act on concrete tasks such as starting a workout, logging food, chatting with Rocco, or recording
a check-in. The design mode is therefore **Operate**: density, scanability, strong alignment, and
low-friction controls outrank decorative expression.

The reference contributes composition, not its colors or content. The chosen direction is a quiet,
light, reference-derived bento system with one FitPilot signature: each page keeps its existing Rocco
hero as the largest human cue, but the hero is proportioned as a dashboard panel rather than a
marketing banner. Content remains left aligned. Metrics and chart labels remain compact. No new
metrics, cards, claims, or actions are introduced.

Visual decisions that are specific to this brief:

- The outer dashboard is a centered white work surface on FitPilot’s `#F5F3F6` background, echoing
  the reference shell without copying its crypto palette.
- The primary visual weight is an asymmetric 12-column grid: a left utility/summary rail, a wide
  central work area, and a narrow right stack. The dashboard page uses the reference most literally;
  the other pages reuse its alignment grammar but let their real content determine the spans.
- Card geometry is tiered. Large panels use a measured, compact radius; nested controls use a visibly
  smaller radius; pills are reserved for statuses and segmented controls. There is no one-radius
  card kit.
- Rocco is the only expressive illustration layer. Decorative rings, blur blobs, gradient washes,
  floating shapes, and generic glass effects are removed from the proposed visual system.

## 2. Reference measurement analysis

### 2.1 Canvas and shell

| Reference feature | Observed estimate | Proposed FitPilot equivalent |
| --- | ---: | --- |
| Raster canvas | 1200 × 900 px | Verification baseline: 1440 × 900 and 1280 × 800 desktop captures |
| Outer field | #CDD1D0-like cool grey; about 59 px left/right and 66 px top | Keep FitPilot background `#F5F3F6`; no extra page frame or shadow |
| Product shell | x≈59, y≈66, w≈1081, h≈768 | `max-width: 1320px`; desktop horizontal inset 32 px, vertical top inset 24 px |
| Shell inner left/right inset | ≈22 px from shell edge to card/nav content | `--dashboard-gutter: 24px` at desktop; 16 px on mobile |
| Shell top nav band | y≈89–129; roughly 58 px usable height | 64–72 px desktop top bar, 56 px mobile top bar |
| Main overview band | begins around y≈151; ends around y≈251 | compact 88–104 px overview row; no oversized page heading |
| Main content row | begins around y≈270; card bottoms around y≈570 | grid row min-height about 300 px at reference scale |
| Lower row | begins around y≈578; bottom around y≈820 | 230–250 px lower row, aligned to the main row’s left edge |

These are image-derived design estimates, not claims about the source product’s CSS. They are the
starting measurements for Phase 01 visual comparison. The implementation must be checked against the
reference at the same aspect ratio and then at the target desktop sizes.

### 2.2 Card geometry and surfaces

The reference cards are rounded but not inflated. At 1200 px wide, the large card corners read at
approximately 18–20 px. The shell itself is effectively square/near-square; it is the card system,
not a giant outer radius, that creates softness.

| Tier | Reference reading | Proposed CSS token | Usage |
| --- | --- | --- | --- |
| Shell | 0–2 px effective radius | `--radius-shell: 2px` | Outer white work surface only if a shell is retained at desktop |
| Primary panel | ≈18–20 px | `--radius-panel: 20px` | Hero, chart, main workspaces, major form groups |
| Secondary panel | ≈14–16 px | `--radius-card: 16px` | Utility cards, side stacks, supporting panels |
| Nested control | ≈10–12 px | `--radius-control: 11px` | Inputs, list rows, inner metric tiles, buttons |
| Status/segmented control | full pill only where semantics require it | `--radius-pill: 999px` | Active state, LIVE/status, compact filters |

The nested radius must be at least 4 px smaller than its parent’s radius so inner surfaces do not
visually collide with the parent corner. Do not use `rounded-[24px]` or `rounded-[32px]` as a global
replacement. Existing components that currently use 24 px or larger should be mapped to the tier that
matches their visual role, not mechanically normalized.

Surface treatment:

- Page background: `#F5F3F6`.
- Card surface: `#FFFFFF`.
- Border: a 1 px cool-tinted neutral derived from the existing `#EAE7EC`; use it only where a card
  needs a boundary or where it separates adjacent light surfaces.
- Shadow: none for most cards; at most a low, broad shadow around the desktop shell or a raised modal.
  Avoid the existing repeated `0 8px 30px` shadow on every card.
- Hero surface: solid `#667493` / `#7482A4` family or a restrained blend within those existing
  FitPilot accents. Do not import the reference’s bright blue, purple, orange, or green.

### 2.3 Reference grid proportions

The reference main row is approximately:

- Left utility rail: x≈82–342, about 261 px.
- Center analytics panel: x≈349–897, about 548 px.
- Right stack: x≈904–1118, about 215 px.
- Horizontal gaps: ≈7 px between panels at the screenshot scale, reading as 8 px.

That is approximately a **3–6–3** relationship when expressed as flexible columns, even though the
right rail is visually narrower because its cards are compact and the screenshot’s inner column math is
not a literal equal 12-part grid. FitPilot should use a real 12-column CSS Grid with a 16 px desktop
gap and these spans as the composition target:

```text
| 1 2 3 | 4 5 6 7 8 9 | 10 11 12 |
| left  | central       | right     |
```

At a 1280 px content width, 12 columns with 16 px gaps yield 12 flexible tracks of roughly 82–84 px.
The resulting 3/6/3 spans are intentionally close to the reference while allowing FitPilot’s content
to breathe. For pages with a wide editor or chart, use 8–4. For dense lower cards, use 5–4–3 or 6–3–3.

Vertical rhythm is compact: 16 px between primary panels, 12 px inside a card between heading and
content, 8 px between label and value, and 24 px around a major page group. Do not create large empty
marketing gaps.

### 2.4 Typography and density

Preserve the authenticated app’s current sans-serif stack; do not add a display face or a new font
dependency in Phase 01. Use the existing readable system/Tailwind sans resolution consistently.

- Page title: 24–30 px, 700–800 weight, line-height about 1.1; only one per route.
- Section/card title: 14–16 px, 700 weight, line-height 1.2.
- Metric value: 24–32 px when it is the focal number; 18–22 px in compact tiles.
- Body/supporting text: 13–15 px, line-height 1.45–1.55.
- Context labels: 11–12 px, 500–600 weight, sentence case; do not force all labels into tracked all-caps.
- Chart/calendar annotations: 10–12 px with sufficient contrast.

The reference’s discipline comes from short labels, deliberate whitespace inside panels, and a clear
value-to-context ratio—not from making every label tiny. Keep long copy out of narrow rails and allow
content-driven height where a modal, chat message, or form needs it.

## 3. Global design specification

### 3.1 Proposed top navigation

Replace `AppSidebar` in the proposed architecture with a single horizontal `AppTopNav` rendered by
`MainDashboardLayout`.

Desktop structure, left to right:

```text
[FitPilot AI]     Dashboard  Workouts  Meals  AI Coach  Progress  Settings     [search] [bell] [avatar ▾]
```

- The logo is the left anchor and links to `/dashboard`.
- The six existing routes remain in this exact order. The active route uses a low-contrast filled
  surface or 2 px bottom rule in `#7482A4`; it must not become a large pill row.
- Search remains available where the current page passes search props. The global placement is a
  compact 200–280 px field; page-specific search behavior and placeholder strings are unchanged.
- Notifications, profile/avatar fallback, and logout remain in the account cluster. Logout opens the
  existing `LogoutConfirmModal` and keeps its current auth/session clearing behavior.
- Do not add a new profile menu feature. The menu is only a new placement for existing account/logout
  functionality.
- Desktop bar height: 64–72 px; content aligned to the same 12-column container as all cards.

Mobile/tablet behavior without a sidebar:

- 360–767 px: top bar contains the logo, current page label, account/avatar, and a menu button. The
  menu opens an anchored or full-width top sheet below the bar, with all six links, settings, and
  logout. It is not a left drawer and does not recreate a sidebar.
- 768–1023 px: keep a single-row top bar when there is room; otherwise use the same top sheet. Search
  collapses into an icon/button that expands to a full-width field below the bar.
- Menu button has `aria-expanded`, `aria-controls`, and an accessible label that describes state.
- Escape closes the sheet; focus returns to the trigger; route change closes it.
- The nav may be sticky at the top with a solid `#FFFFFF` surface and a 1 px bottom border. No
  backdrop blur is required.

### 3.2 Container and spacing tokens

```text
--page-bg: #F5F3F6
--surface: #FFFFFF
--ink: #38323F
--accent: #7482A4
--accent-deep: #667493
--accent-soft: #B6A2B6
--border: #EAE7EC
--muted: #77727B (derived existing semantic text)
--grid-gap: 16px desktop / 12px tablet / 12px mobile
--section-gap: 20px desktop / 16px tablet/mobile
--content-max: 1320px
--content-inset: 32px desktop / 24px tablet / 16px mobile
```

Use a restrained 60–30–10 hierarchy: about 60% page background/light field, 30% white work surfaces,
and 10% FitPilot accents for active states, heroes, calls to action, progress, and Rocco support.
Supporting `#B6A2B6` is a quiet secondary accent only; it must not become a purple theme.

### 3.3 Shared card and interaction grammar

- Every card aligns to the grid’s column lines. No arbitrary floating offsets or staggered masonry.
- Card headings sit at the top-left with content below; metric values are left aligned unless a
  circular progress control already has a centered value as part of its existing interaction.
- Links and buttons retain their existing labels and routes. Do not add arrow glyphs to every link.
- Linked cards may lift 2 px on fine-pointer hover; buttons use a 100–160 ms press response with a
  subtle `scale(0.97)` active state. Specify transform/background/border transitions rather than
  `transition: all`.
- Popovers and menus originate from their trigger. Modals remain centered. Use crisp custom easing,
  for example `cubic-bezier(0.23, 1, 0.32, 1)` for entry/press feedback.
- No scroll-triggered fade-up of every card, parallax, tilt, carousel, or infinite decorative loop.
- Hero entrance is one page-load opacity/short translate sequence when motion is allowed; it must not
  hide content under reduced motion.
- Under `prefers-reduced-motion: reduce`, remove large translations, zoom, rotation, and decorative
  motion; retain focus-ring, color, loading, and short opacity transitions (≤200 ms). JS-driven
  behavior must use a live `matchMedia('(prefers-reduced-motion: reduce)')` listener.

## 4. Six page blueprints

The notation `span 3 / 6 / 3` means 12-column spans in the listed order. These are placement targets,
not new components.

### 4.1 Dashboard — reference-faithful 3–6–3

```text
TOP NAV
COMPACT GREETING / NUTRITION OVERVIEW BAND
┌──────────────┬──────────────────────────┬────────────┐
│ utility 3    │ primary work 6            │ stack 3    │
│              │                            │            │
├──────────────┼──────────────────────────┼────────────┤
│ lower 5      │ lower 4                   │ lower 3    │
└──────────────┴──────────────────────────┴────────────┘
```

Placement:

- `DashboardHero`: top overview band, 12 columns, compact height. Keep the Rocco dashboard image,
  existing focus copy, remaining calorie/protein values, and “View Today’s Plan” action. The hero is
  visually quieter than today’s existing full-width gradient: solid deep accent surface, image fully
  visible at the right, no crop of ears/head.
- `NutritionOverview` + `MacroCard`: adjacent compact overview metrics in the same band or a directly
  attached 4-up metric strip; preserve all four Calories/Protein/Carbs/Fat values.
- `DashboardCalendar`: left utility rail, span 3, first card in the main row.
- `TodayWorkoutCard` and `WeeklyActivityCard`: central working area, span 6, stacked or split within
  the central area according to their actual content; keep workout action and weekly activity data.
- `TodayPlanCard` and `TodaySummaryCard`: right rail, span 3, stacked with equal left/right edges.
- Lower asymmetric row: `TodaySummaryCard` may remain in the right stack if its content is compact;
  if the populated state is taller, move only its visual placement to the lower span 3 slot. No content
  is duplicated.
- `DashboardSkeleton` mirrors this geometry: hero band, metric strip, 3/6/3 row, lower row.
- Error state stays centered in the same content container with the existing retry action; it is not
  replaced by an empty decorative card.

### 4.2 Workouts — hero + exercise workspace + split/history rail

```text
TOP NAV
┌───────────────────────────────┬──────────────┐
│ WorkoutHero, span 8           │ Split, span 4│
├───────────────────────────────┼──────────────┤
│ TodayExerciseList, span 8     │ QuickSession │
│                               │ Preview, 4   │
├───────────────────────┬───────┴──────────────┤
│ RecentWorkouts, 6     │ Motivation, 3 + rail │
└───────────────────────┴──────────────────────┘
```

- `WorkoutHero`: primary 8-column hero; retain Rocco workout image, routine/session metrics,
  start/continue/manage/create/edit actions. Use the same primary-panel radius and a deep accent
  surface; keep the full mascot visible.
- `WorkoutSplitCard`: 4-column right rail aligned to hero top; preserve change/create split and
  routine actions.
- `TodayExerciseList`: prominent 8-column workspace directly below hero; search stays in the top nav
  or page-local compact field as currently wired. Exercise selection opens `ExerciseDetailsModal`.
- `QuickSessionPreview`: 4-column right rail, below split; “open full screen” retains its current
  active-workout action.
- `RecentWorkouts`: lower 6-column history panel. Preserve history rows, search filtering, and
  `RecentWorkoutDetailsModal` behavior.
- `WorkoutMotivationCard`: lower 3–4-column supporting card; it is the smallest expressive panel and
  must not compete with the exercise workspace.
- `WorkoutSkeleton` and `WorkoutErrorState` inherit the same spans and shared card geometry.
- Existing `ActiveWorkoutModal`, create/edit split/routine modals, and rest alarm behavior remain
  route-level overlays and do not become cards.

### 4.3 Meals — parser-led 8–4 with calendar and history support

```text
TOP NAV
┌────────────────────────────────┬────────────┐
│ MealHero, span 8               │ Calendar 4 │
├────────────────────────────────┼────────────┤
│ AIMealParser, span 8           │ Nutrition 4│
├────────────────────────────────┼────────────┤
│ TodayMealsList, span 8         │ Actions 4  │
├────────────────────────────────┴────────────┤
│ MealHistoryPanel, full width / 8–4 by state │
└─────────────────────────────────────────────┘
```

- `MealHero`: 8-column hero with the original `rocco-meal-hero.png`, AI parser action, and existing
  copy/features. Keep Rocco contained and readable; no mascot crop on narrow desktop.
- `MealCalendar`: right 4-column utility panel at the hero’s top edge; date changes preserve current
  query/state behavior.
- `AIMealParser`: the dominant 8-column work panel directly below hero. Preserve textarea, parse,
  loading, retry/reset, meal type selection, and `ParsedMealPreview`.
- `DailyNutritionOverview`: right 4-column panel with current rings/metrics; preserve the existing
  `TodayIntakeCard`/`NutritionSummary` semantics where they are rendered by current states.
- `TodayMealsList`: 8-column content list. Preserve sort, empty state, meal image, select, delete,
  AI parse, and manual log actions.
- `QuickMealActions` and `MealTips`: right rail, stacked and compact.
- `MealHistoryPanel`: full-width lower section because its weekly and history tables need readable
  row width; do not squeeze into a 3-column rail.
- `SmartMealModal`, `ManualMealModal`, `MealDetailsModal`, and `DeleteMealConfirmModal` remain modal
  workflows. `MealSkeleton` and `MealErrorState` mirror hero/parser/rail geometry.

### 4.4 AI Coach — 8–4 conversation workspace

```text
TOP NAV
┌───────────────────────────────┬──────────────┐
│ CoachHero, span 8             │ Context 4    │
├───────────────────────────────┼──────────────┤
│ CoachChat, span 8             │ Capabilities │
│                               │ + Suggested  │
└───────────────────────────────┴──────────────┘
```

- `CoachHero`: 8 columns, retaining `rocco-coach-hero.png`, context metrics, and Start Chat action.
- `CoachContextCard`: 4-column right rail aligned to hero; preserve context rows and live error/retry
  behavior.
- `CoachChat`: dominant 8-column workspace. The message list is the visual anchor; the composer stays
  attached to its bottom edge and remains reachable without a separate page shell.
- `CoachMessageList`, `CoachMessageBubble`, `CoachFormattedMessage`, `CoachEmptyState`, and
  `CoachQuickPrompts` remain inside the chat workspace. Preserve avatar assets and streaming/error
  states.
- `CoachCapabilities` and `SuggestedPrompts`: 4-column right stack, using compact secondary panels;
  preserve click-to-prompt actions.
- `CoachHeroSkeleton`, `CoachContextSkeleton`, `CoachSkeleton`, and `CoachErrorState` retain their
  current state contracts and use the same spans.

### 4.5 Progress — goal hero, 8–4 analytics, compact check-ins

```text
TOP NAV
┌───────────────────────────────┬──────────────┐
│ ProgressHero, span 8          │ QuickCheckIn │
│                               │ span 4       │
├───────────────────────────────┼──────────────┤
│ Goal/Weight/BodyFat/Latest    │ ThisWeek 4   │
│ analytics, span 8             │ Milestones 4 │
├───────────────────────────────┴──────────────┤
│ RecentCheckIns, full width                   │
└──────────────────────────────────────────────┘
```

- `ProgressHero`: 8 columns, retain Rocco progress image, goal metrics, and Log Check-In action.
- `QuickCheckInCard`: 4-column right panel, aligned to hero top; keep the form, validation, submit,
  and existing success/error toast behavior.
- `GoalProgressCard`, `WeightTrendCard`, `BodyFatTrendCard`, and `LatestCheckInCard`: 8-column
  analytics field. Use a 2×2 subgrid only when each chart/card retains readable minimum width.
- `ProgressLineChart` stays inside trend cards; no new chart type or decorative chart animation.
- `ThisWeekCard` and `MilestonesInsights`: 4-column right stack, aligned with the analytics field.
- `RecentCheckIns`: full-width lower table/list to preserve search, delete, view-all, retry, and log
  actions. `AllCheckInsModal` and `DeleteProgressLogConfirmModal` remain overlays.
- `ProgressSkeleton`, `ProgressEmptyState`, and `ProgressErrorState` follow hero/form/analytics
  geometry without changing their state copy.

### 4.6 Settings — asymmetric form bento

```text
TOP NAV
┌───────────────────────────────┬──────────────┐
│ SettingsHero, span 8          │ AccountSummary│
│                               │ span 4        │
├──────────────────────┬────────┴──────────────┤
│ AccountInformation 4 │ ProfileInformation 4 │
├──────────────────────┼──────────────────────┤
│ GoalsNutrition 4     │ Preferences 4         │
├──────────────────────┴──────────────┬───────┤
│ Security, span 8                    │ Goal  │
│                                     │ + quick│
└─────────────────────────────────────┴───────┘
```

- `SettingsHero`: 8 columns; preserve Rocco settings image, goal/unit/workout/email metrics, and
  Review Preferences action.
- `AccountSummaryCard`: 4-column right panel at hero top.
- `AccountInformationCard` and `ProfileInformationCard`: paired 4-column form cards. Keep avatar
  upload/remove and profile save behavior intact.
- `GoalsNutritionCard` and `PreferencesCard`: paired 4-column form cards; keep every field and
  existing mutation/toast contract.
- `SecurityCard`: 8-column lower form card; `PasswordField` remains its own field primitive.
- `GoalSnapshotCard` and `SettingsQuickActions`: 4-column right rail. Quick actions scroll/focus the
  existing target sections; they do not create new navigation.
- `SettingsSkeleton` and `SettingsErrorState` mirror the same arrangement.

## 5. Component preservation matrix

Every existing authenticated dashboard component has a destination. “Re-style only” means the JSX,
props, data flow, and actions stay intact while the parent placement and shared visual tokens change.

| Existing component(s) | Proposed destination | Preservation requirement |
| --- | --- | --- |
| `MainDashboardLayout` | Authenticated shell with `AppTopNav`, shared container, and outlet | Keep auth boundary and outlet context; replace only sidebar placement model |
| `AppSidebar` | Retired from proposed layout; behavior decomposed into top-nav account/menu behavior | Preserve six links, logout confirmation, token clearing, query clear, and navigation semantics; do not reintroduce a sidebar |
| `PageHeader`, `getFirstName` | Top-nav-adjacent page context row / compact title slot | Preserve titles, subtitles, avatar fallback, search values/placeholders, and submit behavior |
| `PageShell` | Unused legacy shell; do not expand scope | No new page shell introduced |
| `GlobalToast`, `Toast` | Global overlay layer | Preserve toast content, positions, and actions |
| Dashboard hero/overview: `DashboardHero`, `NutritionOverview`, `MacroCard` | Dashboard top band | Preserve focus copy, nutrition values, links, and all four macro metrics |
| Dashboard panels: `DashboardCalendar`, `TodayWorkoutCard`, `WeeklyActivityCard`, `TodayPlanCard`, `TodaySummaryCard` | Dashboard 3–6–3 main/lower grid | Preserve calendar navigation, workout links, weekly activity, plan links, and summary values |
| `DashboardContent`, `DashboardSkeleton` | Dashboard page composition/state mirror | Preserve loading/data boundaries; layout only changes |
| Workout hero/workspace: `WorkoutHero`, `TodayExerciseList`, `WorkoutExerciseImage` | Workout 8-column hero and exercise workspace | Preserve routine/session state, exercise selection, search, images, and all start/continue actions |
| Workout rail/history: `WorkoutSplitCard`, `QuickSessionPreview`, `RecentWorkouts`, `WorkoutMotivationCard` | Workout 4-column rail and lower row | Preserve split management, active-session open, history details, and motivation content |
| `WorkoutContent`, `WorkoutSkeleton`, `WorkoutErrorState` | Workout grid/state mirror | Preserve query/error/loading contracts |
| Workout modals: `ActiveWorkoutModal`, `ChangeWorkoutSplitModal`, `CreateWorkoutRoutineModal`, `CreateWorkoutSplitModal`, `EditWorkoutRoutineModal`, `ExerciseDetailsModal`, `RecentWorkoutDetailsModal` | Centered modal layer above the grid | No modal becomes a card; preserve all form and workout-session actions |
| Meal hero/parser: `MealHero`, `AIMealParser`, `MealTypeSelector`, `ParsedMealPreview`, `SmartInputPreview` | Meals 8-column hero/parser workspace | Preserve AI parse, meal type, preview, reset, and log actions |
| Meal content: `TodayMealsList`, `MealImage`, `MealEmptyState`, `MealDateNavigator` | Meals 8-column list and its local controls | Preserve sorting, image fallback, empty state, date navigation, select/delete/log actions |
| Meal rail: `MealCalendar`, `DailyNutritionOverview`, `TodayIntakeCard`, `NutritionSummary`, `QuickMealActions`, `MealTips` | Meals 4-column right stack | Preserve all date, nutrition, quick action, and tip content |
| `MealHistoryPanel` | Full-width lower history section | Preserve weekly nutrition and history data, loading/unavailable states |
| `MealContent`, `MealSkeleton`, `MealErrorState` | Meals grid/state mirror | Preserve refs used for scroll/focus and query behavior |
| Meal modals: `SmartMealModal`, `ManualMealModal`, `MealDetailsModal`, `DeleteMealConfirmModal` | Centered modal layer | Preserve parse/manual/detail/delete functionality and confirmation behavior |
| Coach hero/context: `CoachHero`, `CoachContextCard`, `CoachContextSkeleton`, `CoachHeroSkeleton` | Coach 8–4 top row | Preserve Rocco image, context metrics, retry state, and Start Chat action |
| Coach workspace: `CoachChat`, `CoachMessageList`, `CoachMessageBubble`, `CoachFormattedMessage`, `CoachComposer`, `CoachEmptyState`, `CoachQuickPrompts` | Coach 8-column chat workspace | Preserve message rendering/streaming, composer keyboard behavior, prompts, avatars, retries, and errors |
| Coach rail: `CoachCapabilities`, `SuggestedPrompts` | Coach 4-column stack | Preserve capability/prompt actions and context-derived copy |
| `CoachContent`, `CoachSkeleton`, `CoachErrorState` | Coach grid/state mirror | Preserve chat/context loading and error contracts |
| Progress hero/check-in: `ProgressHero`, `QuickCheckInCard` | Progress 8–4 top row | Preserve goal metrics, check-in fields, submit, and validation |
| Progress analytics: `GoalProgressCard`, `WeightTrendCard`, `BodyFatTrendCard`, `LatestCheckInCard`, `ProgressLineChart` | Progress 8-column analytics field | Preserve chart data, trend range, values, and log check-in actions |
| Progress rail/lower: `ThisWeekCard`, `MilestonesInsights`, `RecentCheckIns`, `ProgressLogCollection` | Progress 4-column rail plus full-width check-in list | Preserve list search/filter, delete, view-all, retry, and log actions |
| `ProgressContent`, `ProgressSkeleton`, `ProgressEmptyState`, `ProgressErrorState` | Progress grid/state mirror | Preserve empty/error/loading states and page refs |
| Progress modals: `AllCheckInsModal`, `DeleteProgressLogConfirmModal` | Centered modal layer | Preserve view-all and delete confirmation flows |
| Settings hero/account: `SettingsHero`, `AccountSummaryCard` | Settings 8–4 top row | Preserve Rocco image, account meta, goal/unit/workout/email values, and preference action |
| Settings forms: `AccountInformationCard`, `ProfileInformationCard`, `GoalsNutritionCard`, `PreferencesCard`, `SecurityCard` | Settings asymmetric form grid | Preserve every field, mutation, save/loading state, avatar behavior, password behavior, and toast |
| Settings rail: `GoalSnapshotCard`, `SettingsQuickActions` | Settings 4-column right rail | Preserve anchor navigation and focus behavior |
| Settings fields: `SettingsTextField`, `SettingsSelectField`, `SettingsNumberField`, `PasswordField` | Same forms, shared control tier | Preserve labels, validation, focus targets, and input semantics |
| `SettingsContent`, `SettingsSkeleton`, `SettingsErrorState` | Settings grid/state mirror | Preserve settings query and mutation boundaries |
| Existing hero assets: `rocco-dashboard.png`, `rocco-workout-hero.png`, `rocco-meal-hero.png`, `rocco-coach-hero.png`, `rocco-progress-hero.png`, `rocco-settings-hero.png` | Each page’s hero panel | Keep original asset, proportions, alt text, and recognizable head/ears; no mobile hiding or unsafe crop |

Out of scope and unchanged: auth pages, onboarding, not-found, mobile app, server, AI service, API
contracts, persisted data, Tailwind/package dependencies, and deployment configuration.

## 6. Responsive layout plan

| Width | Navigation | Grid/container | Hero and cards | Guardrails |
| --- | --- | --- | --- | --- |
| 1440–1920 | Full horizontal nav; account cluster right | `max-width: 1320px`, 12 columns, 16 px gaps, 32 px inset | Reference proportions preserved; 3–6–3 or 8–4 | Keep a stable reading width; do not stretch panels to the viewport edge |
| 1024–1279 | Full nav if it fits; otherwise compact nav + top sheet | 12 columns, 14–16 px gaps, 24 px inset | Keep 3–6–3 on Dashboard; 8–4 on work pages | Reduce search width before reducing content; no horizontal overflow |
| 768–1023 | Compact top bar; menu opens top sheet; search collapses | 6 columns, 12–14 px gaps, 20–24 px inset | Hero full width; primary/rail becomes 4–2 or 6 stack by content | Charts receive a minimum readable width; rows stack by task priority |
| 430–767 | Logo + current page + menu/avatar; top sheet full width | 1 column, 12 px gap, 16 px inset | Hero is full width; Rocco uses `object-contain`, width ≤45%, text never under image | Full-width buttons, 44 px controls, no clipped mascot, no fixed-height panels that hide content |
| 360–429 | Same as mobile; menu is keyboard/focus managed | 1 column, 12 px gap, 16 px inset | One readable card per row; charts can scroll internally only if unavoidable | Test at 360 px and 320 px for overflow/collision; preserve visible headings and action order |

Mobile stacking order is always task-first: hero/action, primary workspace, current-day/list content,
then history/support. Right-rail panels move below the primary workspace; they do not become hidden,
carousels, or tabs. Rocco hero images must remain visible on mobile, with enough bottom padding to keep
controls clear of the illustration.

Use `min-width: 0` on all grid children, `overflow-wrap: anywhere` for long user-provided strings,
and container-query or content-aware subgrids where a card’s internal layout needs to change. Avoid
hard-coded heights for chat, forms, lists, and error states.

## 7. Motion and accessibility plan

Motion is supportive, not decorative. The proposed grammar is:

- One initial hero reveal per route, 180–260 ms opacity plus a maximum 8 px translate on the hero
  container only. No staggered card cascade.
- Fine-pointer hover: linked cards lift 2 px; images inside cards may scale 1.02 within an overflow
  frame only when the image is already a meaningful part of the component.
- Press: buttons and menu triggers use 100–160 ms transform feedback; visible focus rings always win
  over hover styling.
- Menus/popovers scale from their trigger edge starting at 0.97, never from `scale(0)`; modals remain
  centered.
- Loading spinners remain because they communicate progress. Existing `animate-spin` is allowed as
  essential feedback.
- No auto-playing dashboard chart loops, marquees, parallax, 3D mascot motion, or scroll-jacked scenes.

Reduced-motion behavior follows the accessible-animation tier model:

- Tier 1 removed: large slides, zooms, rotation, parallax, smooth-scroll hijacking, and any viewport-
  scale animation.
- Tier 2 softened: hero/menu entry becomes opacity-only and ≤200 ms.
- Tier 3 retained: color, focus rings, loading indicators, and short opacity transitions.

Keyboard requirements: skip link first in tab order; top-sheet menu exposes state; Escape closes it and
returns focus; all controls have names; all routes remain reachable without hover; charts and lists do
not rely on color alone; mascot images retain useful alt text; decorative icons are hidden from the
accessible name when redundant.

## 8. Visual fidelity checklist for Phase 01

Compare rendered captures at 1440×900, 1280×800, 1024×768, 768×1024, 430×932, and 390×844.

- The main work surface is centered and has equal left/right edges.
- Desktop Dashboard reads as compact overview → 3–6–3 main row → asymmetric lower row.
- Top navigation sits on the same container line as card content; no sidebar remains.
- Primary panel radius measures about 20 px; secondary about 16 px; nested controls about 11 px.
- No card uses a generic 24/32 px radius without a tier rationale.
- Card gaps are compact and consistent: 16 px desktop, 12–14 px smaller screens.
- White card surfaces and subtle borders dominate; shadows are rare and low contrast.
- FitPilot palette is preserved: `#F5F3F6`, `#FFFFFF`, `#38323F`, `#7482A4`, `#667493`, `#B6A2B6`.
- Reference blue/purple/orange/green accents are absent from product styling.
- Each page’s original Rocco hero is visible, proportionate, and not cropped at the head/ears.
- No content, metric, feature, action, modal, API path, or state has been added or removed.
- Loading, empty, error, success, modal, and chat states preserve their existing behavior.
- At 360–430 px, no horizontal overflow, clipped chart, overlapping mascot, or unreachable control exists.
- All non-inline controls are at least 44 px tall or have an equivalent accessible hit area.
- Reduced motion removes large movement but keeps useful state feedback.
- The result reads as FitPilot using a reference-derived system, not as a crypto dashboard clone or a
  generic SaaS card template.

## 9. Implementation handoff for Phase 01+

Roadmap clarification: Phase 00 is the approved visual blueprint. Phase 01 is the responsive
architecture, fluid typography, and implementation-preparation phase documented in
`PHASE_01_RESPONSIVE_DESIGN_SYSTEM_PLAN.md`. Phase 02 is the first phase authorized to modify the
frontend implementation. Subsequent phases cover visual refinement, responsive QA, and regression
validation.

Recommended sequence after Phase 01 approval; no implementation is performed in Phase 00 or Phase 01:

1. In Phase 02, add shared design tokens/classes in `client/src/index.css` and establish the authenticated
   container/card primitives without changing API or page data contracts.
2. In Phase 02, refactor `client/src/layouts/MainDashboardLayout.tsx` to render the top navigation. Move the
   existing `AppSidebar` logout/link logic into the top-nav pattern, preserving behavior and modal use.
3. In Phase 02, refactor `client/src/components/layout/PageHeader.tsx` into the compact page-context/search slot;
   keep `getFirstName`, avatar fallback, search props, and accessible labels.
4. In Phase 02, implement Dashboard first in `client/src/components/dashboard/DashboardContent.tsx` and its child
   layout classes, using the 3–6–3 reference structure. Keep all child components and data props.
5. In Phase 02, apply the shared grid to `WorkoutContent.tsx`, `MealContent.tsx`, `CoachContent.tsx`,
   `ProgressContent.tsx`, and `SettingsContent.tsx`, then tune page-specific spans listed above.
6. In Phase 02, update skeleton and error layouts in each page family so loading/error states retain the same
   silhouette as content states.
7. In Phase 02, perform the motion/accessibility pass: focus return for the top sheet, active/press states,
   reduced-motion gating, and no-hover touch behavior.
8. After Phase 02 changes, run only relevant web checks requested for the implementation phase. At minimum, build and lint the
   client after changes; add browser visual checks at the six fidelity sizes. Do not alter mobile,
   server, AI service, lockfiles, or deployment files unless separately approved.

Primary affected files for Phase 02 are:

```text
client/src/index.css
client/src/layouts/MainDashboardLayout.tsx
client/src/components/layout/AppSidebar.tsx       # logic extraction/retirement, not deletion of behavior
client/src/components/layout/PageHeader.tsx
client/src/components/dashboard/DashboardContent.tsx
client/src/components/workout/WorkoutContent.tsx
client/src/components/meal/MealContent.tsx
client/src/components/coach/CoachContent.tsx
client/src/components/progress/ProgressContent.tsx
client/src/components/settings/SettingsContent.tsx
client/src/components/*/*Hero.tsx                 # visual treatment only, preserve assets/props
client/src/components/*/*Skeleton.tsx
client/src/components/*/*ErrorState.tsx
```

Do not modify route files, hooks, services, server code, AI prompts, database access, or mobile code
for this redesign. Any route/contract change discovered during implementation must stop for impact
review before proceeding.

## 10. Phase 00 approval gate

This blueprint is ready for implementation review when the team agrees that:

- the screenshot was actually inspected and the measurements above are acceptable as the first visual
  calibration;
- the top navigation replacement is approved without a sidebar fallback;
- the radius tiers and compact 12-column geometry are approved;
- the six page span plans preserve every existing component and action;
- Rocco heroes remain present and visible at all breakpoints;
- the current FitPilot palette and authenticated font remain the system foundation;
- Phase 01 will implement only visual restructuring and responsive/motion/accessibility behavior.

Phase 00 stops here. No dashboard redesign code has been implemented by this document.
