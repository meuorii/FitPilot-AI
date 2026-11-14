# FitPilot AI Mobile Roadmap

Status reflects repository evidence as of 2026-11-14. Phase 1 documentation is prepared; no mobile app has been initialized.

| Phase | Status | Objective and deliverables | Depends on / gate |
|---|---|---|---|
| 1. Project Audit & Architecture | **Complete (documentation)** | Repository and feature audit; API/security review; SDK 54 / Expo Go assessment; architecture, risks, readiness, and this roadmap. | Complete. Confirm the team's SDK 54 support horizon and choose real test devices before implementation. |
| 2. Mobile Foundation & Design System | Not started | Create isolated `mobile/` Expo Router app on SDK 54; configure app identity, tokens, native primitives, API base configuration, query client, navigation shell, asset catalog, and device workflow. | Phase 1; compatible Expo Go or an agreed development-build path. Accept only after Android/iOS shell launch, routing, theme, safe areas, and SDK diagnostics are documented. |
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
- Target SDK 54 specifically. Its verified baseline is Expo 54.0.38 / React 19.1.0 / React Native 0.81.5. Prefer the New Architecture because Reanimated 4 requires it.
- Route all mobile data and AI requests through the existing Express API. Do not expose the internal FastAPI key.
- Keep API state in TanStack Query; reserve Zustand for transient cross-screen UI state. Backend remains authoritative.
- Store the access token in SecureStore. No refresh or server-side revocation endpoint exists today; session lifetime is the current seven-day token.
- Use Expo Router with unauthenticated, verification, onboarding, authenticated tabs, nested detail routes, and a modal/full-screen workout route. Preserve native back behavior and re-check server active session on resume.
- Reuse the existing Rocco art. Optimize copies only during implementation if profiling shows they are too large; do not alter character art.

## Blockers and deferred decisions

- **Before release planning:** Expo Go SDKs must match the project; SDK 54 is archived, and device availability could not be exercised in this Windows environment. Confirm the preferred SDK 54-compatible Android/iOS test route and longer-term SDK support policy.
- **Before Phase 3:** choose product behavior for token expiry and whether a future backend refresh/revoke contract is authorized; fix client type assumptions in mobile parsing without changing the server silently.
- **Before Phase 5:** determine whether `/meals/parse-ai` (legacy Qwen) or `/meals/parse` (table/local DB/optional AI layered parser) is canonical for each entry point.
- **Before Phase 6:** define whether rest alarms need to work while backgrounded/terminated; current web AudioContext/vibration behavior cannot be carried over.
- Credential rotation, backend hardening, exact mobile designs, offline write queueing, health integrations, push notifications, store submission, and deployment changes are deferred. They require separate implementation scope or product decisions.
