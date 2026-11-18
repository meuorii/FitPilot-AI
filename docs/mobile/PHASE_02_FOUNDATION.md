# FitPilot AI Mobile — Phase 2 Foundation

**Status:** Implemented; migrated to SDK 58 — final compatibility and device validation pending  
**Updated:** 2026-11-14

## Outcome

An independently managed native Expo application now lives at `mobile/`. The original implementation targeted Expo SDK 54 with React Native 0.81.5, React 19.1.0, Expo Router 6, and New Architecture. The foundation includes the design tokens, native primitives, five-tab shell, route placeholders, Rocco asset catalog, TanStack Query provider, secure token storage abstraction, and typed HTTP transport boundary. It does not implement backend login, onboarding forms, or fitness features.

## SDK 58 migration addendum (2026-11-14)

The current manifest, lockfile, and installed root dependency tree are SDK 58; this is not a package reinstall from an unverified manifest. See [`EXPO_SDK_58_MIGRATION.md`](EXPO_SDK_58_MIGRATION.md) for the resolved versions, compatibility repairs, current check results, and iPhone launch steps. The current project config resolves SDK 58.0.0 and has no explicit `sdkVersion` override. Device validation remains pending.

The SDK-aware status check reports Expo Go compatibility, and the Android Metro export passes. Physical device rendering, touch behavior, text scaling, safe-area insets, and tab navigation remain unverified because this Windows host has no ADB, emulator, connected Android device, or iOS Simulator.

## Repository baseline and preservation

- Repository root is the current `app/` directory. Existing `client/`, `server/`, and `ai-service/` remain separate applications; no root workspace was added.
- `mobile/` owns its `package.json` and `package-lock.json`. There is no checked-in `ios/` or `android/` folder.
- The official `default@sdk-54` Expo Router template was used. Its routes were moved into `src/app/`, and starter screens/components were replaced with FitPilot foundation code.
- Root `AGENTS.md` and `PLANS.md` were already untracked Phase 1 planning files; both were preserved and updated for the mobile implementation. Existing untracked `.gitignore` and `skills-lock.json` were left untouched.
- No web, Express, Supabase, FastAPI, production environment, database, or credential configuration was changed.

## Actual project structure

```text
mobile/
├── AGENTS.md
├── assets/images/
│   ├── fitpilot.png
│   └── rocco/                       # all eight original PNGs
├── src/
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── (auth)/                  # login/register placeholders
│   │   ├── (verification)/          # email placeholder
│   │   ├── (onboarding)/            # welcome/about/goals/summary placeholders
│   │   └── (app)/
│   │       ├── _layout.tsx
│   │       ├── (tabs)/              # Home, Workouts, Meals, Progress, AI Coach
│   │       └── settings/index.tsx
│   ├── components/
│   │   ├── feedback/                # loading/error/offline/empty/skeleton
│   │   ├── layout/                  # AppScreen and placeholder layouts
│   │   ├── mascot/                  # asset map, RoccoImage, AppPageHero
│   │   └── ui/                      # text, button, card, badge, divider, icon button
│   ├── lib/
│   │   ├── api/api-client.ts
│   │   ├── auth/                    # SecureStore and bootstrap state
│   │   ├── providers/app-providers.tsx
│   │   └── query/                   # QueryClient and native lifecycle/network bridge
│   └── theme/                       # semantic palette, type, spacing, radius
├── .env.example
├── app.json
├── package.json
├── package-lock.json
└── tsconfig.json
```

## SDK and dependencies

Resolved versions from the mobile package tree:

| Package | Resolved version | Use |
|---|---:|---|
| `expo` | 54.0.38 | SDK 54 runtime |
| `react-native` | 0.81.5 | SDK 54 native runtime |
| `react` | 19.1.0 | UI runtime |
| `expo-router` | 6.0.24 | File-based routes and JS tabs |
| `react-native-reanimated` | 4.1.7 | Template dependency; no custom animation added |
| `react-native-worklets` | 0.5.1 | Reanimated 4 support / New Architecture |
| `react-native-gesture-handler` | 2.28.0 | Expo Router/native gesture foundation |
| `expo-image` | 3.0.11 | Rocco image rendering |
| `expo-secure-store` | 15.0.8 | Encrypted OS-backed token storage |
| `expo-haptics` | 15.0.8 | Button selection feedback |
| `react-native-safe-area-context` | 5.6.0 | Native safe-area layout |
| `@expo/vector-icons` | 15.0.3 | Ionicons tab and state icons |
| `@react-native-community/netinfo` | 11.4.1 | Network reachability for query reconnection |
| `@tanstack/react-query` | 5.107.1 | Server-state foundation |

`expo-linear-gradient`, `react-native-svg`, `lucide-react-native`, Zustand, React Hook Form, and Zod were not added: the shell has no need for them yet, Ionicons are already available through Expo, and current local form state does not justify extra libraries. The starter’s unused `expo-symbols` and `expo-web-browser` direct dependencies were removed. `@expo/ui` was not used because its cross-platform universal package guidance applies to SDK 56+, while this app is pinned to SDK 54. Standard Expo Router `Tabs` are used; no SDK 56 NativeTabs APIs were copied.

The installed Expo agent CLI reported SDK `54.0.38`, and Expo Go compatibility with zero native compatibility reasons. `npx @expo/agent-cli install --check` reported dependencies up to date. The template’s agent CLI downloaded its current SDK 58 documentation cache, so those docs were not used for SDK decisions. Expo’s `sdk-54` native-module manifest and version-matched package diagnostics were authoritative.

## Design foundation

- The native palette carries the existing blue-gray brand accent (`#7482A4`) and FitPilot ink (`#38323F`) into a restrained light surface system, with a system-aware dark palette.
- Color roles, status colors, 4-point spacing, rounded surface radii, and display/page/section/body/caption/metric type variants are centralized in `src/theme/`.
- Contrast-sensitive text and primary controls use a stronger blue-gray role; muted text is darkened to maintain at least 4.5:1 on the light background. UI still needs physical-device review under platform dynamic type.
- Native components include `AppScreen`, `AppText`, `AppButton`, `AppCard`, `AppIconButton`, `AppDivider`, `AppBadge`, `AppSectionHeader`, loading/error/offline/empty states, and `AppSkeleton`.
- `AppScreen` uses `react-native-safe-area-context`; tab screens defer top/bottom safe areas to the native navigators, while standalone auth/onboarding and settings screens account for system insets.
- Buttons have visible pressed/disabled/loading states and selection haptics. No ornamental animation was introduced; native stack transitions remain the default.
- `AppPageHero` lays heading/description and a contained Rocco illustration side-by-side where width permits, switching to a compact vertical layout on narrow screens. It includes optional eyebrow/action/background props for later page variants.
- FitPilot’s existing `client/public/fitpilot.png` mark is copied for icon/splash configuration. It is a 1254×1254 RGBA source; validate alpha handling and final opaque store-icon requirements during release preparation.

## Routes and preview behavior

- Root stack: `src/app/_layout.tsx`; grouped screens are registered for auth, verification, onboarding, and main app.
- The five bottom tabs use SDK 54-compatible Expo Router `Tabs`: Home, Workouts, Meals, Progress, and AI Coach. A header action pushes Settings onto the app stack; native back returns to the previous tab.
- Auth placeholders provide Login and Registration routes. Verification uses a distinct email route. Onboarding has Welcome → About You → Goals → Plan Summary with native stack/back behavior.
- Development `/` redirects directly into the tab shell and the Home screen labels this as a development preview with no connected account. Route preview controls exist only under `__DEV__`. No login success is simulated, no token is fabricated, and no fitness data is shown.
- Non-development `/` redirects to the login placeholder until Phase 3 adds real authentication and route guards.
- Placeholder feature screens clearly identify their roadmap phase and contain no fake data or business feature behavior.

## API, query, and authentication boundaries

- `EXPO_PUBLIC_API_BASE_URL` is the only API configuration value. `.env.example` contains host and port placeholders; replace them with the actual reachable Express address ending in `/api/v1`. Physical-device development must use a device-reachable LAN host instead of `localhost`. See [PHASE_03_LOCAL_API_CONNECTIVITY_FIX.md](PHASE_03_LOCAL_API_CONNECTIVITY_FIX.md) for the current investigation and limitations.
- `apiRequest<T>` uses native `fetch`, an AbortController timeout (15 seconds by default), caller cancellation, JSON/FormData request handling, bearer injection from SecureStore, defensive response parsing, status-preserving `ApiError`, and `x-timezone-offset-minutes` matching the web client (`-new Date().getTimezoneOffset()`). It allows HTTP only for private/loopback development hosts and requires HTTPS otherwise. It normalizes the backend `message` field without promoting raw exception `error` values to user copy.
- This is transport infrastructure only. No dashboard/meal/workout/coach/progress/settings endpoint implementations or guessed response contracts were added. Feature code must validate actual server responses before declaring types.
- TanStack Query defaults: 30-second stale time, 10-minute garbage collection, at most one transient query retry, no retry for HTTP client errors, no mutation retry, reconnect refetch, and app-foreground focus integration. NetInfo drives connectivity; server data remains authoritative and no cache persistence/offline write queue is configured.
- `secureTokenStore` reads/writes/deletes one access-token key in `expo-secure-store`, rejects web/unavailable storage, and never falls back to AsyncStorage or browser storage. `AuthBootstrapProvider` distinguishes `hydrating`, `signedOut`, `signedIn` (token is present only; not yet server-validated), and `storageUnavailable`.
- No login, refresh token, token rotation, server logout, credential persistence flow, or profile restoration is implemented. The backend’s current seven-day JWT/no-refresh contract remains a Phase 3 product/integration concern.

## Rocco asset catalog

All original PNGs were copied byte-for-byte from `client/src/assets/images/` into `mobile/assets/images/rocco/`. The reusable `RoccoImage` uses `expo-image`, fixed typed variants, `contain`, and accessible descriptions or decorative semantics. It loads only the chosen source in a screen; Metro includes all static assets in the app bundle.

| Asset | Size | Destination |
|---|---:|---|
| `rocco-dashboard.png` (1122×1402, alpha) | 1.54 MB | Home foundation hero |
| `rocco-workout-hero.png` (1122×1402, alpha) | 1.92 MB | Workouts placeholder hero |
| `rocco-meal-hero.png` (1448×1086, alpha) | 1.49 MB | Meals placeholder hero |
| `rocco-coach-hero.png` (1122×1402, alpha) | 1.51 MB | AI Coach placeholder hero |
| `rocco-coach-avatar.png` (1254×1254, opaque) | 2.14 MB | Auth placeholder avatar |
| `rocco-progress-hero.png` (1122×1402, alpha) | 1.59 MB | Progress placeholder hero |
| `rocco-settings-hero.png` (1223×1286, alpha) | 1.48 MB | Settings placeholder hero |
| `rocco-logout-wave.png` (1024×1536, alpha) | 2.06 MB | Catalogued for future account flow |

Total copied mascot PNGs are approximately 13.7 MB. The source illustrations have transparent margins and edge-near ears/arms; the component uses `contain` and does not destructively crop them. Per-route selection avoids decoding every image on every screen, but Metro bundles each static asset. Optimize visually identical copies only after profiling in a later performance pass.

## Security and reliability notes

- No server secrets, signing keys, service-role keys, or internal AI credentials exist in mobile environment files or code. All AI access must remain behind authenticated Express routes.
- SecureStore gives device-protected token persistence but does not solve the backend’s seven-day expiry or absent refresh/revocation contract. Phase 3 must define expired-token UX and server profile validation.
- `npm install` and `npm audit` reported 24 advisories total (1 low, 18 moderate, 5 high). `npm audit --omit=dev` still reported 19 in the production dependency tree (1 low, 13 moderate, 5 high), including `expo-router` and its transitive query-string parser. Npm suggested fixes requiring Expo/Router major versions around SDK 58; no audit fix was applied because that would violate the SDK 54 pin. Review compatible patches/advisory exposure before a store release.
- The project uses the current official brand mark as an RGBA app-icon/splash source. App Store icon alpha constraints and actual launch appearance were not validated on a native build.
- API host configuration is intentionally missing in `.env.example`; network requests cannot be made until a public base URL is set. The current Phase 2 shell does not issue any requests.

## Development and validation

Use Node 20.19.4+ and npm (the current host runs Node 26.12.1 / npm 11.20.0). From `mobile/`:

```powershell
npm install
Copy-Item .env.example .env.local
npm start -- --go --lan
# or: npm start -- --go --tunnel
npm run typecheck
npm run lint
npm run dependencies:check
npm run doctor
npx @expo/agent-cli export --platform android
```

LAN requires the phone and development computer to reach each other. Tunnel mode only routes Metro; it does not make a local Express API reachable. On this host Android device startup is blocked because `adb`/Android SDK and a connected emulator/device are absent; iOS Simulator is unavailable on Windows. A compatible Go binary is not installed or verified. The safe device plan is Android Expo Go selected at <https://expo.dev/go> for SDK 54 and the iOS App Store Expo Go for SDK 54, then run `npm start -- --go --lan` and scan the QR code.

| Check | Result |
|---|---|
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npx @expo/agent-cli install --check` | Passed — dependencies up to date |
| `npx @expo/agent-cli doctor` | Passed — 18/18 checks, no issues |
| `npx @expo/agent-cli status --json` | Passed — SDK 54.0.38, Expo Go compatible; no device or native directories |
| `npx @expo/agent-cli dev --android --go --lan --plan --json` | Passed — plan is Expo Go over LAN; no device was attached |
| `npx @expo/agent-cli export --platform android` | Passed — Metro/Hermes bundle generated at approximately 4.1 MB after correcting a local copy-path issue and Windows compiler permission |
| `npx @expo/agent-cli export --platform ios` | Passed — Metro/Hermes bundle generated at approximately 4.1 MB; this is not simulator execution |
| Android/iOS on-device smoke, navigation, accessibility, safe-area, dynamic type | Not run — no compatible device/simulator on this host |

The bundle export proves route/module resolution and asset inclusion; it is not proof of device rendering or interaction behavior.

## Phase 3 handoff

Before Phase 3 acceptance, install a matching SDK 54 Expo Go on a physical Android and iOS test device (or agree an iOS build route), launch the shell, visit all five tabs, push/back from Settings, inspect Rocco and system insets, and test large text. Before writing auth calls, reconcile `verify-email.next_step`, profile restoration, verification errors, and the backend’s seven-day JWT with current Express controllers. Keep refresh/revocation and any backend changes outside mobile scope unless separately authorized.

Official version guidance: [Expo SDK 54 release](https://expo.dev/sdk/54), [SDK 54 bundled native modules](https://github.com/expo/expo/blob/sdk-54/packages/expo/bundledNativeModules.json), [Expo Go version matching](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/), [development-build tradeoffs](https://docs.expo.dev/develop/development-builds/faq/).
