# FitPilot AI Mobile — Phase 3 Authentication & Onboarding

**Status:** Implemented — ready with conditions  
**Updated:** 2026-11-15  
**Scope:** `mobile/` native client and mobile documentation only. No web, Express, AI service, database, credential, or deployment behavior was changed.

## Architecture summary

- Extended the existing SecureStore and API foundation. The access token is stored only through `secureTokenStore`; login and verification responses do not become authenticated until token persistence succeeds.
- `AuthBootstrapProvider` owns one session state machine: hydration, signed out, verification pending, authenticating, session/profile check, incomplete onboarding, post-save plan summary, signed in, session unavailable, storage unavailable, and confirmed session expiry.
- A cold start reads SecureStore and validates any stored token with `GET /profile/me` before exposing authenticated routes. A transient network or server failure keeps the credential and shows retry; a confirmed authentication rejection clears the local credential and query cache.
- Expo Router `Stack.Protected` guards the auth, verification, onboarding, and app route groups. The old `__DEV__` redirect into tabs was removed. The five existing tabs and route hierarchy remain in place.
- Account changes cancel queries and clear the full TanStack Query cache. A revision check prevents an old profile response from restoring a session after logout or account change.
- Onboarding draft, calculated options, selected goal, and post-save summary are in-memory feature state. They survive route changes and backgrounding while the process remains alive, but are intentionally not persisted after process termination. Passwords and OTPs are never persisted.

## Verified backend contracts used

The implementation was checked against the Express route/controller behavior, not only the web TypeScript declarations. All calls use the existing `EXPO_PUBLIC_API_BASE_URL` and require the configured URL to end in `/api/v1`.

| Endpoint | Mobile behavior |
|---|---|
| `POST /auth/register` | Sends trimmed `full_name`, normalized `email`, and the untouched password. Accepts a verification-required response; does not store a token. |
| `POST /auth/login` | Sends normalized email and password. `EMAIL_NOT_VERIFIED` is routed to verification. A successful token is stored before profile reconciliation. |
| `POST /auth/verify-email` | Sends email and exactly six digits. Accepts both `next_step: onboarding` and `next_step: dashboard`; then reconciles with `/profile/me`, which determines the route. |
| `POST /auth/resend-verification` | Sends only the email. Generic success is preserved, including the unknown-email response. A local 30-second tap cooldown is UX only; it is not represented as server-side rate limiting. |
| `GET /profile/me` | Authenticated cold-start/session validation and profile restoration. Server onboarding and email-verification status are authoritative. |
| `POST /profile/calculate-goals` | Authenticated. Sends the validated About You values and displays only well-formed goal options and metrics returned by Express. |
| `PATCH /profile/me` | Authenticated. Sends the selected goal, baseline values, target weight from the selected server option, and `is_onboarded: true`. The saved response must confirm onboarding before the summary appears. |

The backend verification response can point to either the Dashboard or Onboarding; the web type only allowed Onboarding. The mobile parser supports both values and uses the fetched profile as the final authority. Goal calculation is behind `authenticateUser`, even though it is a calculation-only request.

Known server error codes mapped to contextual guidance include `EMAIL_NOT_VERIFIED`, `EMAIL_ALREADY_VERIFIED`, `INVALID_VERIFICATION_CODE_FORMAT`, `INVALID_VERIFICATION_CODE`, `VERIFICATION_CODE_EXPIRED`, `NO_ACTIVE_VERIFICATION_CODE`, and `EMAIL_SERVICE_UNAVAILABLE`. HTTP 401/403/409/429/503 and server/transport failures receive separate user-facing messages; server exception details are not shown for 5xx responses.

## Authentication and session flow

1. Root navigation holds on a branded initialization screen while SecureStore and `/profile/me` resolve.
2. Verified login and verification responses are defensively parsed. The token is written to SecureStore before profile fetch and route selection.
3. Login and verification route from the reconciled profile, not a possibly stale client assumption. Registration never authenticates the user.
4. A network timeout or 5xx during session validation retains the token and exposes Retry and local sign-out actions. A confirmed 401/invalid profile clears SecureStore and account cache, then routes to Login with a session-expired message.
5. Logout uses a native confirmation, clears TanStack Query state and SecureStore, then removes authenticated navigation history through route guards. If secure deletion fails, the user is told cleanup is incomplete and can retry.

The backend issues seven-day JWTs. There is no refresh-token, rotation, server-side revocation, or password-reset endpoint. The client does not invent those contracts or claim server-side logout. A protected 401 is the authoritative expiration signal; there is no client-side signature validation.

## OTP experience

The screen uses one native numeric `TextInput` with six visual positions, avoiding focus choreography between separate inputs. It accepts paste and the platform one-time-code autofill hint, strips non-digits, and limits input to six digits. Verification codes remain only in component memory and are cleared on success or failure. The server's ten-minute expiry remains authoritative. Resend success explains that older codes may stop working; the local cooldown does not claim to be server security.

## Onboarding behavior

1. **Welcome:** Rocco-led introduction, progress, and Continue; no API request.
2. **About You:** age 13–100, height 100–250 cm, weight 30–350 kg; `male`/`female`; `sedentary`, `lightly_active`, `moderately_active`, or `very_active`. Activity-level illustrations are reused from the web assets as smaller mobile copies (256 px maximum dimension); web originals are unchanged.
3. **Your Goals:** server-returned options, server recommendation/default, returned recommendation reason, target weight, calorie and macro values. Changing any baseline input invalidates the derived options and selection.
4. **Plan Summary:** appears only after the profile PATCH confirms `is_onboarded`. It displays saved profile targets. If the app closes after save, the next session sees the completed server profile and enters the app rather than repeating onboarding.

The API, not React Native, calculates calories and macros. A save failure retains the selected goal for retry. A successful save updates auth/profile state and the relevant query cache before showing the summary.

## Native UI and accessibility

- Reused FitPilot theme tokens, `#7482A4` brand accent, shared buttons/text/cards, existing Rocco assets, safe-area wrapper, native stacks, and five-tab shell.
- Added a labeled text field with show/hide password control. Login and registration use email/name/password autofill hints, native keyboard types, visible labels and inline errors. Return keys move through the registration fields and submit from the final field.
- Forms scroll with the keyboard visible; actions remain in scroll content rather than fixed beneath the keyboard. Selection controls expose selected state and use touch-sized targets.
- No custom screen choreography was added; native stack transitions remain in control. Existing button haptic feedback is retained.
- New activity thumbnails preserve the source illustrations and transparency. Each is now about 60–67 KB; source web assets and existing Rocco files are unchanged.

## Security and known limitations

- The current seven-day JWT is a bearer credential in SecureStore. There is no refresh, server revocation, password recovery, or server-side logout endpoint.
- The Phase 1 audit identified insufficient login/verification rate-limit hardening. No backend security logic was changed. The client cooldown is not a substitute for server controls.
- Onboarding draft values are memory-only; force-quit recovery returns an incomplete account to onboarding from the server profile, not to the exact prior form step.
- No live backend integration was run. The configured example uses the existing public API host, but no production registration, verification, profile mutation, or test-account write was attempted.
- Physical iPhone rendering and interaction are not observable from this Windows session. Expo Go keyboard/autofill, safe-area, Dynamic Type, dark-mode, VoiceOver, back gesture, cold restart, and logout checks remain pending.

## Focused files

- `mobile/src/lib/auth/auth-api.ts` — typed request/response parsing and verified error mapping.
- `mobile/src/lib/auth/auth-provider.tsx` — hydration, session validation, expiry, storage recovery, logout, route state.
- `mobile/src/lib/auth/secure-token-store.ts` — existing SecureStore boundary; retained and used.
- `mobile/src/lib/api/api-client.ts` — existing transport extended with `/api/v1` validation and stale-token 401 callback.
- `mobile/src/lib/onboarding/onboarding-draft.tsx` — feature-scoped in-memory draft and goal selection.
- `mobile/src/app/_layout.tsx`, `mobile/src/app/index.tsx` — guarded route groups and startup decision.
- `mobile/src/app/(auth)/login.tsx`, `register.tsx`; `mobile/src/app/(verification)/email.tsx` — real auth forms and OTP.
- `mobile/src/app/(onboarding)/welcome.tsx`, `about-you.tsx`, `goals.tsx`, `plan-summary.tsx` — four onboarding steps.
- `mobile/src/app/(app)/settings/index.tsx` — scoped account display and local logout only.
- `mobile/src/components/ui/app-text-field.tsx`, `mobile/src/components/layout/onboarding-progress.tsx` — shared native controls.
- `mobile/src/lib/auth/auth-validation.ts`, `auth-validation.test.mjs` — pure validation/destination logic and focused tests.
- `mobile/assets/images/onboarding/` — optimized mobile copies of existing activity illustrations.
- `mobile/.env.example`, `mobile/README.md` — API prefix expectation.
- `PLANS.md` — roadmap status and gates.

## Validation record

Passed from `mobile/`:

- `npm run typecheck`
- `npm run lint`
- `npm run test:auth` — five tests for email normalization, required login fields, registration trimming/password preservation, onboarding numeric boundaries/enums, goal invalidation key, and routing destination.
- `npm run dependencies:check` — Expo dependencies are up to date.
- `npx --yes @expo/agent-cli@latest doctor --json` — 20/20 checks passed.
- `npx --yes @expo/agent-cli@latest export --platform ios`
- `npx --yes @expo/agent-cli@latest export --platform android`

Not run: live staging/production API flows, screenshot/render critique on an iPhone, physical-device keyboard/autofill/accessibility checks, and real cold-start/logout flows. No automated UI test framework existed; tests cover the extracted pure validation and destination functions.

## Phase 4 readiness

**READY WITH CONDITIONS.** Phase 3 code, static validation, and both platform bundles are complete. Do not start Phase 4 until the user confirms the iPhone acceptance flow and the authentication/onboarding integration is exercised against an authorized development or staging account. If only production is available, use a deliberately authorized test account and avoid destructive writes.
