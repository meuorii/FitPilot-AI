# Pre-Phase 4 UI Refinement

**Date:** 2026-11-15  
**Status:** Implemented; physical-device review remains pending.

## Executive summary

FitPilot AI Mobile now uses a fixed white-first appearance, including under system Dark Mode. Signed-out users see an interactive Rocco welcome screen with real registration and sign-in actions. Login, registration, verification, and the four existing onboarding screens use clearer hierarchy and reduced-motion-aware entrances. Authentication, SecureStore, route guards, API contracts, onboarding calculations, and phase numbering remain in place. No Dashboard, Workouts, Meals, Progress, or AI Coach behavior was added.

## Verified cause of dark appearance

Before this refinement, `mobile/app.json` requested `userInterfaceStyle: "automatic"`. `useAppColors()` selected `palette.dark` when `useColorScheme()` reported Dark Mode, and `AppProviders` selected React Navigation's `DarkTheme` in the same condition. The native splash config also specified a dark launch background. Those system-dependent selectors caused the app to change appearance with the device.

## Light-theme changes

- `userInterfaceStyle` is now `light`; the static native splash has a white background and no dark variant.
- The light palette is authoritative in `useAppColors()` and the navigation provider. The application background is white and the secondary surface is the existing soft neutral; brand, text, border, and semantic colors remain centralized.
- React Navigation uses `DefaultTheme` with FitPilot tokens, and the status bar uses dark content.
- Root, authentication, onboarding, safe-area, and tab surfaces inherit the fixed palette. No active `useColorScheme()` theme selection remains.

## Interactive welcome and session routing

The native splash remains static and minimal. After initialization, `src/app/(auth)/welcome.tsx` provides the interactive React Native experience. It uses existing Rocco artwork, a restrained idle float that stops when the route loses focus or the app backgrounds, a light haptic and a short live-announced encouragement on tap, and working actions for account creation and sign-in. Reduced-motion preference disables the float and press scaling.

The root route still waits for the auth provider. A signed-out or expired session now redirects to the Welcome route; verified returning sessions still go directly to their existing onboarding or authenticated destination. Verification, incomplete onboarding, session-unavailable retry, storage recovery, and protected route guards retain their existing state-machine behavior. There is no fixed startup delay.

## Authentication and onboarding UI

- Login and registration retain their API calls, validation, error mapping, abort handling, pending state, SecureStore handoff, and verification redirect. Existing fields remain scrollable with password-manager/autofill support and return-key progression.
- Auth headings and Rocco placement now have a clearer hierarchy and controlled entrance. Registration uses a smaller Rocco treatment to preserve form space.
- Shared fields now show a focused border and keep field errors adjacent to their inputs. Button loading and disabled states remain intact.
- Verification retains one numeric input for six visual positions, preserving paste and one-time-code autofill. Entered digits fade in, an invalid code gives a brief OTP-group shake unless reduced motion is enabled, and a failed resend preserves the entered code. The server remains authoritative for code validity and expiry.
- Onboarding's four current screens use the light tokens and restrained entrance transitions. Goal selection includes selection haptics; calculations, profile writes, in-memory draft, and completion state are unchanged.

## Animation implementation

`src/components/motion/entrance.tsx` centralizes short Reanimated `FadeInUp` screen-content entrances and respects the system reduced-motion setting. Continuous movement is limited to Rocco's whole-image float, runs on Reanimated's UI runtime, and is cancelled on blur/background/unmount. OTP digit feedback and the localized error shake use opacity/transform. No animation dependency was added. Navigation retains native stack transitions; tabs do not animate.

The entrance, tap, and idle motion are intended as first-use delight and interaction feedback. Their feel, interruption quality, accessibility focus, and haptic timing still require real-device review.

## Session and backend preservation

No changes were made to Express, Supabase, FastAPI, the web client, auth request/response contracts, credentials, SecureStore, token verification, or backend-derived fitness targets. Existing auth routes and route guards remain the navigation boundary. A cast to Expo Router's `Href` is used for the new redirect because the generated local `.expo/types/router.d.ts` predates the new route; the emitted iOS and Android bundles both resolve the route.

## Modified files

- `mobile/app.json`
- `mobile/src/theme/colors.ts`
- `mobile/src/lib/providers/app-providers.tsx`
- `mobile/src/app/_layout.tsx`, `mobile/src/app/index.tsx`
- `mobile/src/app/(auth)/_layout.tsx`, `welcome.tsx`, `login.tsx`, `register.tsx`
- `mobile/src/app/(verification)/email.tsx`
- `mobile/src/app/(onboarding)/welcome.tsx`, `about-you.tsx`, `goals.tsx`, `plan-summary.tsx`
- `mobile/src/components/ui/app-text-field.tsx`
- `mobile/src/components/motion/entrance.tsx`
- `docs/mobile/PRE_PHASE_04_UI_REFINEMENT.md`, `PLANS.md`

No dependency or lockfile changes were made.

## Validation results

| Check | Result |
|---|---|
| `npm run typecheck` | Passed |
| `npm run lint` | Passed without warnings |
| `npm run test:auth` | Passed: 5/5 existing auth/onboarding validation tests |
| `npm run dependencies:check` | Passed: dependencies up to date |
| `npx --yes @expo/agent-cli@latest doctor --json` | Passed: 20/20 checks |
| Expo iOS export | Passed; 1,791 modules bundled |
| Expo Android export | Passed; 1,786 modules bundled |
| Physical iPhone / Android interaction | Not run from this Windows session |
| Live development/staging API flows | Not run; no account or backend data was changed |
| Rendered screenshot review, Dynamic Type, VoiceOver/TalkBack, reduced-motion device review | Pending physical-device validation |

The first local cache/export attempts received Windows access-denied errors. Re-running the Expo validation with approved cache access passed. Expo Go's native launch artwork may not reflect an `app.json` splash change until the matching native app distribution is rebuilt; the in-app welcome itself is a regular Expo Router screen and is included in both bundles.

## Outstanding issues and device checklist

Use the SDK 58-compatible Expo Go distribution and a development/staging account when available. Verify launch under iPhone Dark Mode, Welcome → Register/Login and back navigation, Rocco tap/haptics, keyboard and password autofill, verification paste/autofill/resend/failure recovery, onboarding selection and step navigation, logout, saved-session restoration, session retry, reduced motion, small-screen layout, and larger Dynamic Type. Repeat applicable checks on Android for system-bar and back behavior. Do not make production account changes during this review.

## Phase 4 readiness

**READY WITH CONDITIONS.** The requested pre-Phase 4 code refinement is implemented, TypeScript/lint/auth checks pass, SDK diagnostics pass, and both platform bundles export. The visual and interaction acceptance gates on physical devices and a safe staging auth flow remain open. Phase 4 remains **Not started** and must stay separate until those checks are confirmed.
