# Draft: FitPilot Mobile Agent Instructions

Move this file to `mobile/AGENTS.md` when Phase 2 creates the app. It is planning guidance, not an active app configuration yet.

## Scope and compatibility

- Build a fully native React Native app using TypeScript, Expo SDK 54, and Expo Router. Keep the existing web app, Express backend, Supabase data, and FastAPI service intact.
- SDK 54 compatibility is a gate: use SDK 54’s bundled module manifest and matching Expo installer versions. Do not copy SDK 55+ or current `latest` APIs without checking the SDK 54 reference.
- Prefer Expo Go-compatible dependencies for the first shell. Record when a feature needs a development build; never silently upgrade the SDK or install arbitrary native dependencies.
- Keep native dependencies in this app’s own `package.json`; keep root/client/server lockfiles unchanged.

## Routes and native UI

- Expo Router route files only belong in `src/app/`; put reusable components, feature logic, types, hooks, assets and utilities in sibling directories.
- Separate auth, email verification, onboarding, authenticated tabs, nested feature routes, full-screen active workout, and modal/confirmation flows. Use native stacks/tabs and preserve predictable back behavior and deep-link redirects after auth hydration.
- Use native React Native primitives and SDK-supported platform controls; no WebView screen shell, DOM elements, Tailwind classes, browser APIs, or desktop layout porting. Adapt iOS and Android conventions while retaining FitPilot’s established visual identity.
- Respect safe areas, scalable text, keyboard dismissal/avoidance, minimum touch size, accessibility labels/roles, contrast, and reduced-motion preference. Every visible control must work and every data screen must represent loading, error, empty, and content states.
- Keep the design tokens centralized. Do not scatter raw brand values or introduce dependencies for small one-off behavior.

## Rocco assets

- Reuse the existing Rocco character illustrations; do not redraw, recolor, crop into identity loss, or regenerate the mascot.
- Prefer `expo-image` for screen assets, responsive `contain` bounds, and explicit placement that keeps face/limbs clear of text and CTAs. Lazy-load per route and optimize only as visually identical copies after evidence of performance need.

## API, state and security

- Express remains the sole public API source for account data and AI. Never call FastAPI directly or include internal service keys, JWT signing keys, or Supabase service credentials in mobile configuration.
- Use native `fetch`, typed/validated request and response contracts based on backend controllers/schemas, HTTPS configuration, Bearer auth, request cancellation, safe error handling, and clear date/timezone rules.
- Store access tokens with `expo-secure-store`. Hydrate before route guards; never use `localStorage`, `sessionStorage`, or AsyncStorage for tokens. No refresh/logout-revocation API exists, so do not invent a refresh flow. Clear secure auth and user-scoped query cache on logout or definitive auth failure.
- TanStack Query owns server state and targeted invalidation; Zustand is only for transient client UI state. Do not persist or replay offline writes until endpoint idempotency and conflict semantics are defined. Avoid automatic retries for non-idempotent POSTs.
- Keep user-visible drafts on failed saves and disable repeat submits while pending. Never treat AI-generated estimates as persisted until the user can review/edit and confirms.

## Motion and performance

- Keep motion purposeful and infrequent; use SDK-compatible Reanimated and Gesture Handler only when needed, obey New Architecture requirements, keep gesture/scroll work on UI runtime, and honor reduced motion.
- Do not animate routine tab changes. Use native navigation transitions. Avoid per-frame React updates, unvirtualized long lists, oversized repeated images, and unnecessary memoization/abstraction.
- Timers must recover from timestamps and server state after app resume. Do not claim terminated/background alarm reliability without platform implementation and device testing.

## Expo Go and delivery gates

- Check package compatibility and native-module availability against SDK 54 before adding a dependency. Verify the actual matching Expo Go build; the store build may target a different SDK.
- A feature requiring app-specific native configuration, custom native code, health integration, remote push, or production universal links must be recorded as development-build/platform work.
- Expo Go is for iteration, not release performance validation. Before a phase is complete, record real device/platform paths exercised, meaningful failures/retries, accessibility, and unresolved limitations.
- Keep changes focused, document architecture/API decisions, and do not modify existing backend behavior, production settings, database schema, or secrets without explicit scope.
