# FitPilot AI Mobile Architecture Proposal

## Direction

Maintain `mobile/` as a standalone Expo application beside `client/`, `server/`, and `ai-service/`. The current target is React Native 0.88, TypeScript, Expo SDK 58, and Expo Router. Do not move existing apps into a workspace or replace the Vite web client. Keep the existing Express API and Supabase records authoritative for both clients. Route all AI usage through authenticated Express APIs.

```text
app/
├── client/                    # Existing Vite web client
├── server/                    # Existing Express API
├── ai-service/                # Existing private FastAPI service
├── mobile/                    # Proposed in Phase 2; independent Expo app
│   ├── assets/                # Rocco artwork and app assets
│   ├── src/
│   │   ├── app/               # Expo Router route files only
│   │   ├── components/        # Reusable native UI
│   │   ├── features/          # Auth, dashboard, meals, workouts, etc.
│   │   ├── lib/               # API client, query client, secure auth
│   │   ├── hooks/             # Cross-feature hooks only
│   │   ├── theme/             # Brand tokens and component foundations
│   │   ├── types/             # API/domain types and validation schemas
│   │   └── utils/             # Platform-neutral helpers
│   ├── app.json
│   └── package.json
├── docs/mobile/
└── AGENTS.md
```

The structure is proposed, not present. Expo Router’s route directory stays routes-only; feature-owned screen UI belongs in `features/`. Keep native dependencies inside `mobile/package.json`. Do not extract shared packages initially: current reusable candidates are ordinary TypeScript, but cross-platform package costs and contract differences need evaluation during Phases 2–3.

## Phase 2 implementation status

The structure above is realized in `mobile/` with `src/app/` routes, native components, a semantic theme, API/auth/query foundations, and a standalone lockfile. The initial `features/` directories remain deferred until feature work exists; no empty feature modules or shared packages were created. The five-tab Expo Router shell and settings stack are implemented. See [`PHASE_02_FOUNDATION.md`](PHASE_02_FOUNDATION.md) and [`EXPO_SDK_58_MIGRATION.md`](EXPO_SDK_58_MIGRATION.md) for implementation history, current versions, validation, and pending device checks.

## Routes and navigation

Use Expo Router groups to separate auth and app flows. Route group names below are conceptual; exact route files are Phase 2 work.

```text
src/app/
├── _layout.tsx                  # providers, hydration/splash gate
├── (auth)/                      # login, register
├── (verification)/              # verification code and resend
├── (onboarding)/                # welcome, profile, goals, plan
└── (app)/
    ├── _layout.tsx              # authenticated stack + tab shell
    ├── (tabs)/
    │   ├── index.tsx            # Home
    │   ├── workouts/index.tsx
    │   ├── meals/index.tsx
    │   ├── progress/index.tsx
    │   └── coach/index.tsx
    ├── workouts/session/[id].tsx # full-screen active workout
    ├── meals/[id].tsx            # meal detail/edit if supported
    └── settings/                 # header-accessible settings/account routes
```

Keep the existing native stack and regular Expo Router `Tabs` with Home, Workouts, Meals, Progress, and AI Coach. Use SDK 58's Router exports and versioned APIs. Settings is reached from a stack header action. Define verification as a real route so code entry survives app lifecycle and back behavior is explicit. Keep the active workout in its own full-screen route with state keyed by server session ID; child details and destructive confirmation should use stack/modal presentation where supported. Every route remains reachable from deep links after auth hydration, then redirects to the right gate.

Back behavior: auth screens return to prior auth step; onboarding preserves entered draft when stepping backward; normal feature details pop to their originating tab; active workout back prompts/returns while retaining server session; modal confirmation can dismiss safely. Do not discard unsaved form data on a network error. Use native platform navigation and safe-area handling rather than custom browser-like chrome.

## State and API architecture

- **API base:** environment-driven public HTTPS Express base URL (no credentials in public config), checked at startup. Existing web’s production host is evidence for a candidate, not an environment policy; local-device development must use a reachable development URL rather than `localhost` from the phone.
- **API client:** native `fetch`, typed request/response and `ApiError` with HTTP status/code/request ID; parse JSON defensively and normalize inconsistent error envelopes. Attach `Authorization: Bearer` and the same timezone information as current services. Do not send internal AI credentials.
- **Authentication:** a small auth module owns SecureStore read/write/delete and a bootstrap state (`hydrating | signedOut | signedIn | expired`). Read SecureStore before protected-route decisions to avoid login/dashboard flashes. Keep user profile query-derived instead of duplicating a stale full user object in storage. On 401, clear the token and query cache, route to auth, and preserve recoverable drafts. There is no refresh/logout backend contract; plan for re-login after seven days and do not fabricate refresh behavior.
- **Server state:** TanStack Query v5 for dashboard, settings/profile, meals, workout catalogs/sessions/history, coach context, and progress. Use feature-owned query-key factories, cancellation-aware `fetch`, reasonable retry only for transient idempotent reads, stale content with non-blocking refresh errors, pull-to-refresh where useful, and explicit loading/error/empty/content states. Writes disable repeat taps, retain drafts on failure, and invalidate only affected features plus dashboard/coach where source indicates cross-feature impact.
- **Local state:** Zustand only for transient presentation state that genuinely crosses routes (e.g. ephemeral toast or unsaved local UI preference). Form drafts stay in form state; server records stay in Query. Do not queue offline writes until each mutation has an idempotency/duplicate strategy.
- **Types:** create a mobile API contract from verified server controllers and schemas. Existing client types are useful references, not authority. Pay particular attention to verify `next_step`, profile GET response, meal raw-row/list key differences, error bodies, progress pagination, and workout session start behavior. Validate AI output/editable values before persistence.
- **Uploads:** native image picker returns URI/file metadata, not browser `File`. Adapt multipart requests and verify field names/size/MIME rules for exercises (`image`) and avatar (`avatar`).

## Data synchronization and recovery

Both web and mobile read/write the same Supabase-backed data through Express. No offline write queue or local aggregate should become authoritative. On successful mutation, invalidate affected query keys and refetch server totals. Preserve cached query content during background errors; distinguish no records from not loaded. On reconnect/resume, refresh time-sensitive dashboard, meal day, and active workout queries.

Use local civil date keys (`YYYY-MM-DD`) for selected dates; use ISO timestamps for instants. Existing API uses `x-timezone-offset-minutes` for dashboard/meals/progress/coach boundaries and `timezone` for workout weekday resolution. Current offset-only boundary handling cannot represent future DST transitions robustly; send the device IANA timezone for workout schedule, and agree whether a future API enhancement is needed for historical date boundaries. Never compute nutrition/workout totals as mobile truth.

For mutations without API idempotency keys (meal logs, batch logs, set logs, check-ins), prevent double taps while pending and do not automatically retry POST after an ambiguous timeout. Refresh read state after uncertain results and ask for user recovery. Workout recovery is better supported: `GET /workouts/sessions/active` and `GET /sessions/:id` allow session restoration. Reconcile with server before reopening the session. Persist rest-timer start/end timestamps in screen/session state only if needed; monotonic foreground timer display is client UI, while logged set/session times remain server timestamps.

## Design-system foundation and Rocco

Phase 2 should inspect the actual web palette/type/spacing and reuse brand identity as tokens, not port Tailwind classes. Establish semantic colors, typography roles, spacing, radii, safe-area rules, dark-mode decision, and touch-target conventions once. Native controls should respect iOS and Android idioms; important numbers and chart trends need accessible text alternatives. Use Expo Image for bundled/remote imagery and constrain rendering to visible screens.

Reuse the eight existing PNG illustrations from `client/src/assets/images/` via copied mobile assets (or a deliberate asset pipeline in Phase 2); do not import source files across app build boundaries. `rocco-dashboard`, workout and progress are portrait 0.8 ratio; meals is wide 1.33; settings is near-square; coach hero is portrait; coach avatar is square without alpha; logout wave is tall. Use `contain` by default, safe text zones, responsive height, and separate image/text layout on narrow devices. Do not overlay primary actions on face/body. The dashboard source is transparent full-body art; more images need visual crop review. Consider optimized PNG/WebP equivalents only after confirming no identity/color/alpha changes and keeping originals.

## SDK 58 dependencies and device gates

Use the mobile app's SDK 58-compatible Expo installer resolution; current installed roots include Expo 58.0.25, Router 58.0.31, React Native 0.88.1, React 19.3.0, Reanimated 4.7.1, Worklets 0.13.0, and Gesture Handler 3.3.0. Check all Expo modules and peer requirements against the SDK 58 manifest before changing them. Keep dependencies and the lockfile inside `mobile/`. Expo Go compatibility does not prove production behavior; custom native modules, production app/universal links, remote push, and health integrations may require a development build.

Run SDK-aware dependency diagnostics before implementation acceptance. Expo's current guidance says the iOS App Store Expo Go stops at SDK 54; SDK 55 and later require an SDK-matched distribution such as EAS Go through TestFlight on a physical iPhone. Confirm that distribution and launch with a fresh Metro QR before calling device validation complete. Keep exact dependency resolution in the mobile package lock; do not make a root lock/workspace unless a later explicit decision justifies it.

## Phase 2 entry checklist

1. Keep SDK 58 as the mobile target unless a later supported-version decision changes it.
2. Confirm an SDK 58 Expo Go distribution for the physical iPhone; Expo Go App Store version alone is insufficient according to current mismatch guidance.
3. Keep `mobile/` independently managed; do not change web/server/AI package files or lockfiles.
4. Add the proposed app-local `AGENTS.md` from `MOBILE_AGENTS_DRAFT.md` after moving it into place.
5. Establish theme, route groups, providers, API URL config, secure auth boundary, query client, Rocco asset catalog, and loading/error/empty/content primitives.
6. Validate shell on actual devices and check Expo package compatibility; do not start business screens until the foundation passes.
7. Before Phase 3, agree auth expiry UX and align mobile contracts to actual controllers; before release harden default internal credentials through authorized backend/deployment work.

### Evidence links

- [Expo SDK 58 versioned docs](https://docs.expo.dev/versions/v58.0.0/)
- [Expo SDK upgrade walkthrough](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)
- [Expo Go SDK version mismatch guidance](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/)
- [Expo development builds FAQ](https://docs.expo.dev/develop/development-builds/faq/)
