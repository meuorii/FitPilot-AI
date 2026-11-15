# FitPilot AI Mobile Roadmap

Status reflects repository evidence as of 2026-11-14. Phase 1 is documented and Phase 2's native foundation is implemented; physical-device validation is pending.

| Phase | Status | Objective and deliverables | Depends on / gate |
|---|---|---|---|
| 1. Project Audit & Architecture | **Complete (historical)** | Repository and feature audit; API/security review; original SDK 54 / Expo Go assessment; architecture, risks, readiness, and this roadmap. | Historical assessment retained; its Expo Go distribution assumptions were superseded by current SDK 58 guidance. |
| 2. Mobile Foundation & Design System | **Implemented — device validation pending** | Independent Expo Router app under `mobile/`; SDK 58 / RN 0.88 / React 19.3 / New Architecture; semantic theme, reusable native UI, five tabs, route placeholders, Rocco assets, TanStack Query, SecureStore boundary, API transport, and development preview. | TypeScript, lint, Expo dependency validation, Expo Doctor (20/20), and iOS/Android Metro exports pass. Confirm launch and visible UI on a physical iPhone using an SDK 58 Expo Go distribution before marking complete. |
| 3. Authentication & Onboarding | Not started | Native registration, verification, login, secure token hydration, logout, profile restoration, and onboarding steps using existing API contracts. | Phase 2; resolve verify-email response typing and agree how seven-day non-refreshing JWT sessions should behave. Accept after success/failure/retry and cold-start navigation flows are exercised. |
| 4. Dashboard & Rocco Hero | Not started | Native dashboard, nutrition summaries, workout/weekly summary, date awareness, and responsive reuse of Rocco. | Phases 2–3; API timezone semantics understood. Accept with server totals, loading/error/empty, refresh, and narrow-device layout checks. |
| 5. Meals & AI Meal Logging | Not started | Native date/history views, manual and editable parser flows, meal details/deletion, and confirmed persistence. | Phases 2–4; select parser route deliberately and preserve response distinctions. Accept with parsing, edit-before-save, duplicate-submit protection, deletion, and retry checks. |
| 6. Workouts & Active Sessions | Not started | Native exercise library, routines/splits, active-session recovery, set editing, rest timer, completion/history. | Phases 2–4; define foreground/background timer expectations and preserve server session lifecycle. Accept with app interruption/recovery, set mutation, completion, abandonment, and timing checks. |
| 7. AI Coach, Progress & Settings | Not started | Coach context/chat, progress charts/check-ins, account/profile/preferences/security settings. | Phases 2–3; confirm unsupported mutations or contract drift before promising parity. Accept with chat errors, log edit/delete, settings save failures, and privacy checks. |
| 8. Motion, UX Polish & Performance | Not started | Accessibility, platform polish, purposeful motion/haptics, image/performance refinement, reduced motion, long-content behavior. | Phases 3–7; assess in release builds on supported low-end Android and iOS hardware. Accept only after device feel and accessibility review. |
| 9. Integration Testing & Final QA | Not started | End-to-end parity, backend integration, regression, release readiness, operational notes. | Phases 1–8; device matrix, test accounts, API access, and QA plan. Accept after documented Android/iOS flows and web/backend preservation checks. |

## Recommended skill routing

- **Phase 1:** `expo-overview`, `expo-project-structure`, `expo-web-to-native`, `vercel-react-native-skills`, `expo-router`, `expo-data-fetching`.
- **Phase 2:** `expo-overview`, `expo-project-structure`, `expo-design-system`, `expo-native-ui`, `expo-router`, `vercel-react-native-skills`.
- **Phase 3:** `expo-data-fetching`, `expo-router`, `expo-native-ui`.
- **Phase 4:** `expo-data-fetching`, `expo-native-ui`, `expo-design-system`, `vercel-react-native-skills`.
- **Phase 5:** `expo-data-fetching`, `expo-native-ui`, `expo-router`.
- **Phase 6:** `expo-data-fetching`, `expo-native-ui`, `expo-router`, `expo-animation`, `animate-expo`, `vercel-react-native-skills`.
- **Phase 7:** `expo-data-fetching`, `expo-native-ui`, `expo-router`, `expo-design-system`.
- **Phase 8:** `expo-animation`, `animate-expo`, `vercel-react-native-skills`, `ui-ux-pro-max`, `impeccable`.
- **Phase 9:** `expo-overview`, `expo-data-fetching`, `vercel-react-native-skills`, `ui-ux-pro-max`, `impeccable`.

## Decisions recorded

- Keep web, Express API, and AI service in place; add a separately buildable native client.
- Phase 2 began on SDK 54 and has since been migrated in place to SDK 58. The current installed resolution is Expo 58.0.25, Expo Router 58.0.31, React 19.3.0, and React Native 0.88.1. The app remains a standalone npm project; no root workspace was introduced.
- Phase 2 includes an Expo Go development preview only. It bypasses no backend auth contract, creates no fake token, and is compiled out of production preview controls.
- The config resolves `sdkVersion: 58.0.0` and does not pin `sdkVersion` in `app.json`. TypeScript and lint now pass after narrow SDK 58 typing repairs; Expo dependency validation is up to date, Expo Doctor is 20/20, and both mobile platform exports pass. The Windows host cannot directly inspect the user's iPhone.
- Expo's current mismatch guidance says the App Store Expo Go stops at SDK 54; SDK 55+ needs an iPhone-compatible SDK-specific Expo Go distribution (currently through EAS Go/TestFlight). The user reports SDK 58 Expo Go is installed and signed in, but the local Expo CLI is not. Sign both into the same Expo account, then confirm a fresh on-device launch.
- `EXPO_PUBLIC_API_BASE_URL` remains intentionally unset in the sample environment; local device development must use a reachable Express URL. No mobile feature API calls or login flows are implemented yet.
- The earlier SDK 54 audit reported 24 npm advisories (including 5 high; 19 with dev dependencies omitted); this is historical and does not describe the SDK 58 tree. The current production-only audit reports 3 moderate advisories (Expo, @expo/fingerprint, and minimatch), with no high/critical findings; npm only offers a breaking Expo 52 downgrade as the automated fix. No downgrade or forced audit fix was applied.
- Current mobile target is SDK 58: Expo 58.0.25 / React 19.3.0 / React Native 0.88.1. Keep the New Architecture enabled; Reanimated 4 requires it and SDK 58 uses the modern architecture.
- Route all mobile data and AI requests through the existing Express API. Do not expose the internal FastAPI key.
- Keep API state in TanStack Query; reserve Zustand for transient cross-screen UI state. Backend remains authoritative.
- Store the access token in SecureStore. No refresh or server-side revocation endpoint exists today; session lifetime is the current seven-day token.
- Use Expo Router with unauthenticated, verification, onboarding, authenticated tabs, nested detail routes, and a modal/full-screen workout route. Preserve native back behavior and re-check server active session on resume.
- Reuse the existing Rocco art. Optimize copies only during implementation if profiling shows they are too large; do not alter character art.

## Blockers and deferred decisions

- **Phase 2 device gate:** Use an SDK 58-compatible Expo Go distribution on a physical iPhone (Expo's current guidance points to EAS Go/TestFlight for SDK 55+), sign in to Expo CLI with the same account as Expo Go, connect over LAN/tunnel, and verify launch, tab navigation, settings back behavior, Rocco rendering, safe areas, and text scaling. Device launch is not yet confirmed.
- **Before release planning:** decide whether Expo Go remains sufficient or whether a development build is required for app-specific native configuration and release parity.
- **Before Phase 3:** choose product behavior for token expiry and whether a future backend refresh/revoke contract is authorized; fix client type assumptions in mobile parsing without changing the server silently.
- **Before Phase 5:** determine whether `/meals/parse-ai` (legacy Qwen) or `/meals/parse` (table/local DB/optional AI layered parser) is canonical for each entry point.
- **Before Phase 6:** define whether rest alarms need to work while backgrounded/terminated; current web AudioContext/vibration behavior cannot be carried over.
- Credential rotation, backend hardening, exact mobile designs, offline write queueing, health integrations, push notifications, store submission, and deployment changes are deferred. They require separate implementation scope or product decisions.
