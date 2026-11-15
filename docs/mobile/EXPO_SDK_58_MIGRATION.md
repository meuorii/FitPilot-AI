# Expo SDK 58 Migration Report

**Date:** 2026-11-14  
**Status:** SDK dependency/configuration checks and iOS/Android Metro exports pass; physical iPhone runtime validation is pending Expo CLI account sign-in and device confirmation.

## Summary and root cause

The supplied working tree already contains an SDK 58 manifest, lockfile, and installed dependency tree. The previous Expo Go error stated that a project served to the phone required SDK 54. That message cannot be reproduced from the current checked-out project: the active `mobile/` directory resolves Expo `58.0.25`, and Expo config reports SDK `58.0.0` with no `sdkVersion` override. The exact historical cause is not proven because the prior QR/session was unavailable. A stale SDK 54 Metro session or old QR/recent project is the likely explanation, but remains an inference rather than a verified cause.

The existing SDK 58 runtime packages were retained. Expo's SDK-aware checks identified three mismatched development packages (`@types/react`, `eslint-config-expo`, and TypeScript); the Expo installer aligned them and synchronized the mobile lockfile. The TypeScript run exposed a few current RN/Expo typing issues and those were repaired narrowly. Expo's documented setup command regenerated the managed agent metadata for SDK 58. Process command lines could not be inspected due Windows access denial, so no unrelated process was stopped and no prior stale session was confirmed.

## Current resolved versions

Observed from `npm ls` under `mobile/` and direct package resolution:

| Package | Resolved |
|---|---:|
| `expo` | 58.0.25 (project SDK config: 58.0.0) |
| `react` | 19.3.0 |
| `react-native` | 0.88.1 |
| `expo-router` | 58.0.31 |
| `react-native-reanimated` | 4.7.1 |
| `react-native-worklets` | 0.13.0 |
| `react-native-gesture-handler` | 3.3.0 |
| `react-native-screens` | 4.30.1 |
| `react-native-safe-area-context` | 5.11.1 |
| `expo-image` | 58.0.18 |
| `expo-secure-store` | 58.0.3 |
| `expo-haptics` | 58.0.8 |
| `expo-constants` | 58.0.16 |
| `expo-linking` | 58.0.17 |
| `expo-font` | 58.0.12 |
| `expo-splash-screen` | 58.0.14 |
| `expo-status-bar` | 58.0.5 |
| `expo-system-ui` | 58.0.7 |
| `@react-native-community/netinfo` | 12.0.1 |
| `@types/react` | 19.3.0 |
| `eslint-config-expo` | 58.0.4 |
| TypeScript | 6.0.3 |
| TanStack Query | 5.107.1 |

The lockfile root matches `package.json`; `npm ls` showed one root resolution for each requested Expo/React package. SDK runtime packages did not need replacement; only the three Expo SDK-aligned development package ranges and lock entries changed.

## Configuration and compatibility repairs

- `npx expo config --json` resolves the correct mobile project path, app slug, Router entry (`expo-router/entry` from the manifest), SDK `58.0.0`, iOS/Android platforms, and expected Router/SecureStore/Splash Screen plugins. There is no stale `sdkVersion` override.
- Removed `newArchEnabled` because SDK 58 uses the modern architecture by default and Expo Doctor rejects the obsolete field. Removed Android `edgeToEdgeEnabled` because the current config schema rejects it; SDK 58 owns this platform default.
- Kept regular Expo Router five-tab navigation and the existing route groups. Updated the navigation theme import to `expo-router/react-navigation`, the SDK 56+ supported Router export.
- Fixed current RN 0.88 type errors: nullable tab icon colors use the FitPilot accent fallback, Rocco static Metro assets use the numeric static-resource type accepted by Expo Image, and initial nullable `AppState.currentState` is handled without passing `null` into an event callback. Updated auth bootstrap initialization to satisfy the current React lint rule while preserving the same SecureStore-derived states.
- PNG artwork, route tree, theme tokens, query/runtime providers, NetInfo integration, API transport, and SecureStore abstraction are retained.
- `mobile/AGENTS.md` has SDK 58 instructions and a regenerated SDK 58 CLI-managed metadata block.

## Checks and current results

| Check | Result |
|---|---|
| Git status | Existing user changes were present; files in this task scope were preserved and updated in place. |
| Node / npm | Node `v26.12.1`; npm `11.20.0`. |
| `npm ls expo react react-native expo-router ... --depth=0` | Passed; resolved versions listed above. |
| `node -p "require('expo/package.json').version"` | Passed: `58.0.25`. |
| `npx expo config --json` | Passed: project root is `mobile/`; SDK config `58.0.0`; no explicit sdkVersion override. |
| `npm run typecheck` | Passed after the SDK 58 type repairs. |
| `npm run lint` | Passed after updating auth bootstrap initialization for current React lint rules. |
| `npx --yes @expo/agent-cli@latest install --check --json` | Passed; no dependency mismatches. |
| `npx --yes @expo/agent-cli@latest doctor --json` | Passed: 20/20 checks. |
| `npx expo config --json` | Passed; `mobile/` root, SDK `58.0.0`, and no explicit `sdkVersion` override. |
| `npx --yes @expo/agent-cli@latest status --json` | Passed; project SDK `58.0.25`, Expo Go-compatible project probe, live server root matched, URL `exp://192.168.0.103:8081`; no device connected. |
| iOS Metro export with cache clear | Passed; bundled 1,778 modules and all eight Rocco PNGs. |
| Android Metro export with cache clear | Passed; bundled 1,773 modules and all eight Rocco PNGs. |
| Fresh Metro server | Running from `mobile/` with LAN URL `exp://192.168.0.103:8081`. |
| Expo account | Expo Go on the iPhone is signed in, while the local Expo CLI is not; physical iOS requires the same account on both. |
| Process inspection | Windows denied access to process command lines. No unrelated process was stopped; Expo confirms the running server matches `mobile/`. |
| Production `npm audit --omit=dev` | 3 moderate findings; 0 high/critical. The automated fix requires downgrading Expo to 52, so it was not applied. |
| Physical iPhone | Pending. The user reports Expo Go is signed in but the CLI is not; the workstation cannot inspect/control the iPhone. |

## iPhone SDK 58 Expo Go validation

Expo's current version-mismatch guide says the iOS App Store Expo Go stops at SDK 54; SDK 55 and later require an SDK-matched iPhone distribution, currently EAS Go through TestFlight. The user reports an SDK 58 Go installation, but its installed build cannot be verified from this workstation. Confirm that distribution is actually SDK 58 before scanning. Expo's account error also confirms that the iPhone Expo Go account is signed in while the local Expo CLI is not; physical iOS development requires the same account on both sides.

1. Close any prior Expo Go project and discard the old QR/recent link.
2. A fresh server is already running from `mobile/` and serving `exp://192.168.0.103:8081`. If it is no longer available, open a terminal at `C:\Users\fonti\OneDrive\Documents\fitpilot-ai\app\mobile` and run `npx --yes @expo/agent-cli@latest start -- --clear --go --lan`.
3. From `mobile/`, sign the local Expo CLI into the same account shown in Expo Go: `npx --yes @expo/agent-cli@latest login`. Complete the browser sign-in as the account used in Expo Go; do not put passwords or one-time codes in chat.
4. Verify the CLI identity with `npx --yes @expo/agent-cli@latest whoami`; it must match the account shown in Expo Go. Expo CLI reads credentials when Expo Go requests the project, so if the server is already running, tap **Try Again** on the iPhone. If you changed from another CLI account, restart Metro first.
5. Keep the iPhone and computer on a network that can reach each other, then open `exp://192.168.0.103:8081` in the SDK 58 Expo Go distribution (or scan the QR shown by Expo CLI). If LAN cannot connect, restart with `--tunnel`.
6. Confirm no incompatibility screen or red runtime error; verify the preview, Rocco hero, all five tabs, Settings push/back, safe-area insets, scalable text, and touch targets.
7. Report the actual result. Until this is done, device validation is not passed.

Metro tunnel connectivity is separate from API connectivity; a future API base URL must independently be reachable from the phone.

## Readiness and Phase 3 handoff

**Phase 2: READY WITH CONDITIONS.** SDK dependency validation, Expo Doctor, TypeScript, lint, and both platform exports pass. The live Metro server matches `mobile/`. Physical iPhone launch and the visual/navigation smoke test are still pending. Do not mark Phase 2 complete or start Phase 3 until the user confirms that an SDK 58 Expo Go distribution opens the app and the shell passes the walkthrough. No authentication or onboarding feature work was added.

## References

- [Expo SDK 58 documentation](https://docs.expo.dev/versions/v58.0.0/)
- [Expo SDK upgrade walkthrough](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)
- [Expo Go version mismatch guidance](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/)
- [Expo SDK 58 changelog](https://expo.dev/changelog/sdk-58)
