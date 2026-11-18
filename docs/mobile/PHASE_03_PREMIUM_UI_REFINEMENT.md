# Phase 3 Premium UI Refinement

**Date:** 2026-11-18  
**Status:** Implemented; device acceptance remains pending.

## Executive summary

Integrated the supplied eleven Rocco PNGs into the Phase 3 asset registry and redesigned their placement across authentication and onboarding. Form screens now use the dedicated portrait artwork at contained, form-proportional sizes. About You uses the new activity artwork instead of the removed legacy image paths. The existing white-first FitPilot theme, API behavior, auth/session state machine, onboarding calculations, and route guards are preserved. No Phase 4 surface was started.

## Skill direction and review

- `emil-design-eng`: treated the welcome press as feedback, kept the reaction on the whole static image, and rejected a pose crossfade because the poses have visibly different hand positions and character scale. Existing fades are limited to first entry; tap and selection feedback remain brief.
- `mobile-native` and `expo-native-ui`: retained native scrolling, keyboard avoidance, safe-area wrappers, input/autofill settings, touch-sized actions, and native Router transitions.
- `ui-ux-pro-max`: the design-system search resolved the white/blue-gray fitness brand into an energetic but restrained direction. Its generic marketing showcase pattern was not applied to these task-focused native screens. The existing tokens remain authoritative.
- `frontend-design`: preserved FitPilot's white, charcoal, and blue-gray identity; gave each screen a content-specific composition instead of repeating a hero-card-form template.
- `expo-design-system`: reused the existing theme, Rocco registry, form controls, progress component, and shared primitives; no second token system or dependency was added.
- `expo-animation` / `animate-expo`: the welcome reaction is a short transform response; existing idle animation remains cancellable on blur/background and disabled for reduced motion. Existing OTP shake/digit feedback and goal haptics remain scoped to user-visible state changes.
- `vercel-react-native-skills`: static asset imports, `expo-image` contain rendering, shared image primitive, and native state updates are retained.
- `impeccable`: launcher context could not run because its engine install requires network and a user-profile cache write. Manual workflow used: read project context and craft floor; critique focused on task hierarchy, repeated card treatment, asset framing, and state/accessibility coverage. This was code/artwork review, not a rendered-device critique.

## Screen decisions

| Screen | Chosen composition and reason | Asset and interaction |
| --- | --- | --- |
| Authentication Welcome | Spacious centered character moment, then headline/copy and two clear account actions; the first screen's job is introduction. | `welcome.png`, up to 320×240 contain, proportionally reduced on narrow screens. Whole image receives a restrained press response and changes the encouragement line. The alternate pose is registered but not swapped because the arm pose and visible scale do not align closely enough for a stable crossfade. |
| Login | Left-aligned portrait and heading above a compact, keyboard-scrollable credential form; speed of entry takes priority over a large hero. | `login.png`, 176×176 contain, preserving the waist-up artwork, ears, and paws. Existing visible labels, focus sequencing, inline errors, pending state, and accurate password-reset limitation remain. |
| Registration | Compact left-aligned art/heading with the four-field form taking the visual and vertical priority. | `register.png`, 150×150 contain. Existing name/email/password/confirmation validation, visibility toggles, autofill, submit, and login navigation remain. |
| Email Verification | Dedicated verification illustration above a focused six-position code interaction and recovery actions. | `email-verification.png`, 156×156 contain. It already includes a clipboard; the redundant decorative mail badge was removed. Numeric paste/autofill, resend cooldown, retry feedback, and server validation remain. |
| Onboarding Welcome | Progress first, spacious 4:3 artwork, left-aligned explanatory copy, and a bottom continuation action. This differentiates guided setup from account marketing. | `onboarding-welcome.png`, up to 320×240 contain, reduced proportionally on narrow screens. Continue still opens About You. |
| About You | Data-entry-first scroll with grouped profile fields and vertically stacked activity choices; descriptions remain readable on narrow screens. | Four activity assets share a 62×78 contain frame. Each option retains its label, explanation, frequency, selected radio state, and selection haptic. Validation and backend calculation are unchanged. |
| Your Goals | Text-led selectable goal rows with recommendation, reason, and backend-returned targets; information density belongs to the task. | No extra mascot. Existing calculated values, selection, save retry, and prior-step recovery remain. |
| Plan Summary | Completion illustration, heading, one grouped target summary, then Dashboard action. Metrics are derived only from saved profile values. | `plan-summary.png`, 144×180 contain. Existing missing-target fallback and completion navigation remain. |

## Asset audit

All assets are static Metro imports in `rocco-assets.ts`; alpha-channel decoding confirmed non-opaque pixels in every file. Pixel dimensions and visible non-transparent bounds:

| Asset | Dimensions | Visible bounds (x,y–x,y) | Notes |
| --- | ---: | --- | --- |
| `welcome.png` | 1448×1086 | 33,0–1361,1085 | Full-body, 4:3; nearly fills height. |
| `interactive-welcome.png` | 1448×1086 | 256,0–1332,1067 | Full-body, narrower visible silhouette and raised arm; not aligned for image swapping. |
| `login.png` | 1254×1254 | 0,0–1207,1253 | Waist-up; ears/arms approach edges. Contain only. |
| `register.png` | 1254×1254 | 0,0–1237,1253 | Waist-up; broad pose approaches edges. Contain only. |
| `email-verification.png` | 1254×1254 | 0,0–1207,1253 | Full-body with clipboard, no separate envelope. |
| `onboarding-welcome.png` | 1448×1086 | 0,0–1419,1085 | Full-body, 4:3. |
| `activity-sedentary.png` | 205×256 | 24,6–193,246 | Near portrait, 7% horizontal transparent margin. |
| `activity-lightly-active.png` | 205×256 | 19,4–186,251 | Near portrait, approximately 9% horizontal margin. |
| `activity-moderately-active.png` | 192×256 | 22,6–173,245 | Near portrait, approximately 11% horizontal margin. |
| `activity-very-active.png` | 194×256 | 12,4–182,241 | Near portrait; slightly wider silhouette, matched by equal display height. |
| `plan-summary.png` | 1122×1402 | 25,0–1083,1401 | Portrait celebration artwork. |

All source files use RGBA PNG with actual transparent pixels. No artwork was modified. Presentation uses `expo-image` with `contentFit="contain"`; the square portrait sources are rendered square, while 4:3 and portrait sources receive matching display ratios.

## Motion and functionality

No animation package or backend change was introduced. The existing Reanimated entrance helper honors reduced-motion settings. Welcome's idle float is cancelled on route blur, app background, and unmount; its tap response translates/scales the full illustration rather than deforming the PNG. Verification still shakes only its code group on error and retains paste/autofill behavior. Goal/activity selection feedback remains state-specific. Expo Router owns screen transitions.

Auth endpoint calls, request/response shapes, SecureStore, hydration, guards, verification handoff, draft persistence, server-derived target values, profile save, and Dashboard completion routing were not changed.

## Modified files

- `mobile/src/components/mascot/rocco-assets.ts`
- `mobile/src/app/(auth)/welcome.tsx`
- `mobile/src/app/(auth)/login.tsx`
- `mobile/src/app/(auth)/register.tsx`
- `mobile/src/app/(verification)/email.tsx`
- `mobile/src/app/(onboarding)/welcome.tsx`
- `mobile/src/app/(onboarding)/about-you.tsx`
- `mobile/src/app/(onboarding)/plan-summary.tsx`
- `docs/mobile/PHASE_03_PREMIUM_UI_REFINEMENT.md`
- `PLANS.md`

## Validation

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed. |
| `npm run test:auth` | Passed, 5/5 existing tests. |
| `npm run dependencies:check` | Not clean: SDK manifest reports Expo 58.0.25 vs `~58.0.26` and Expo Router 58.0.31 vs `~58.0.32`. Versions were not changed because this visual task explicitly forbids upgrading Expo. Initial local run also encountered cache `EPERM`. |
| Expo Doctor | 19/20 checks passed; the only failure is the same two patch-level dependency mismatches. |
| iOS Metro export | Passed; 1,798 modules bundled. |
| Android Metro export | Passed; 1,793 modules bundled. |
| Physical device / rendered screenshot critique | Not performed in this Windows session. |
| Live API auth and onboarding | Not performed; no account or backend data was changed. |

## Known limitations and device checklist

The welcome art pair is not pose-aligned, so only the default image is shown; the tap response uses whole-image motion. Physical review is still required for compact-screen crop safety, keyboard visibility, Dynamic Type, VoiceOver/TalkBack order, reduced motion, status/navigation bars, and image sharpness. The art is not clipped by the component, but the portrait assets themselves extend close to their transparent canvas edges, so preserve `contain` if sizing changes.

On an SDK 58-compatible Expo Go device, walk Welcome → Register → Verification, then sign in, restore session, complete all onboarding steps, and reach Dashboard using an authorized development/staging account. Repeat with large text, reduced motion, dark device appearance, keyboard open, and Android back navigation. Do not use production account writes for this check.

## Phase 4 readiness

**READY WITH CONDITIONS.** Phase 3 visual work is implemented and local source checks pass. Expo patch drift and physical-device/safe-backend acceptance remain open. Phase 4 remains not started.

## 60/30/10 refinement

The original centered form layouts left space above the portraits and exposed their waist-level source edge. Login and Registration now end the contained portrait at the start of the rounded form surface. Verification uses the same structure with a compact clipboard illustration and clearance below the artwork. The form column is capped on wide screens and scrolls with keyboard avoidance on compact screens.

The existing theme owns the palette. `#F5F3F6` is the main canvas, `#DCD6DE` defines illustrated and grouped surfaces, and `#7482A4` marks progress. These are visual proportions. White on the brand accent measures 3.84:1, so primary buttons retain `#596783` with white labels at 5.69:1. Secondary copy was darkened for the tinted surfaces.

Authentication Welcome frames the interactive full-body Rocco. Onboarding Welcome uses the same tint behind its dedicated illustration. About You gives each activity image a consistent tile. Goals preserve the radio marker and stable border width as selection changes. Plan Summary groups saved values on the tinted surface. Native navigation and existing form, OTP, and API handlers carry through.

Entrance motion uses a brief opacity fade and skips it when Reduce Motion is enabled. Authentication inputs are presented together. Device review remains pending for keyboard scrolling, larger text, screen readers, artwork edges, and touch feedback on BlueStacks and iPhone.

Refinement checks passed: npm run typecheck, npm run lint, npm run test:auth (5/5), and separate Android and iOS Expo Metro exports. Dependencies did not change. The native exports were checked with dotenv loading disabled, so they do not verify a live API connection.
