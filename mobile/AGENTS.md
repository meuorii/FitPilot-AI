# FitPilot AI Mobile Engineering Instructions

## Scope and architecture

- This directory is an independently managed native client beside `client/`, `server/`, and `ai-service/`. Keep changes to this app unless the task explicitly includes another service.
- Use React Native 0.88, React 19.3, TypeScript, Expo SDK 58, Expo Router 58, and the New Architecture. The web client remains supported and the Express API remains the authority for shared account data.
- Treat this app as native UI. Do not use WebViews, DOM elements, browser storage, CSS/Tailwind, or browser-only APIs for application screens.
- Route files live only in `src/app/`. Shared components, features, API/auth/query code, theme tokens, and utilities live in their corresponding `src/` siblings.

## SDK and dependencies

- SDK 58 compatibility is a release gate. Check the installed `expo` version, `npx --yes @expo/agent-cli@latest install --fix` only when diagnostics identify drift, the dependency check, and Expo Doctor before adding native dependencies. Use SDK 58 versioned docs and its bundled native module manifest.
- Prefer Expo Go-compatible modules included in SDK 58. SDK 58 uses the modern React Native architecture; do not restore legacy-architecture flags. Verify iPhone Expo Go distribution separately because App Store Expo Go may not include SDK 58.
- On physical iPhone development, Expo Go and Expo CLI must be signed in to the same Expo account. Check with the agent CLI `whoami`; credentials are local and must never be copied into documentation or chat.
- Use `npx --yes @expo/agent-cli@latest install <package>` for Expo-managed dependencies so package versions match SDK 58. Avoid unnecessary packages and root workspaces.
- Keep native app configuration in `app.json`; do not run prebuild or add `ios/` / `android/` directories unless a task explicitly requires them.
- Expo Router's SDK 58 exports are the navigation integration boundary. Keep route registration in the existing Router layouts and preserve regular five-tab navigation unless the task explicitly changes it.
- For iPhone validation, start a fresh SDK 58 Metro session from this directory with `npx --yes @expo/agent-cli@latest start -- --clear --go --lan`; use a newly generated QR or URL and confirm the installed Expo Go build actually targets SDK 58.

## UI and brand

- Keep colors, spacing, radii, and typography centralized in `src/theme/`. Repeated values belong in tokens.
- Use native primitives and Expo Router native stacks/tabs. Respect safe areas, Android back behavior, iOS navigation behavior, scalable text, touch targets, keyboard placement, and screen-reader labels.
- Reuse the original Rocco illustrations from `assets/images/rocco/`. Preserve proportions and identity; use `contain` and do not cover Rocco with text or controls.
- Keep screens focused and mobile-first. Every enabled control must work. Provide intentional loading, error, offline, empty, and content states where data is introduced.
- Keep motion purposeful, light, and compatible with reduced-motion preferences. Do not animate routine tab changes or add complex choreography before Phase 8.

## Backend, auth, and data

- The Express API is the only public backend boundary for account and AI features. Never call FastAPI directly or expose internal AI keys, Supabase service credentials, or JWT signing keys in the app or `EXPO_PUBLIC_` variables.
- Configure only the public API base URL through `EXPO_PUBLIC_API_BASE_URL`. Local development on a physical device must use a LAN-reachable host; the phone's `localhost` is the phone.
- Use native `fetch`, typed errors, cancellation, and timezone values matching existing client behavior. Verify every response type against current server controllers before feature implementation; frontend types alone are not authoritative.
- Use TanStack Query for server state and targeted invalidation. Avoid automatic retries for mutations. Do not persist or queue sensitive server data/offline writes without defined server idempotency semantics.
- Store access tokens only through the `expo-secure-store` abstraction. Do not implement refresh or server-side logout assumptions: the current API has no refresh rotation or revocation endpoint. Hydrated token presence is not proof that the backend session is still valid.

## Quality and preservation

- Use strict TypeScript, explicit nullable states, and focused components. Avoid unnecessary global state and premature abstractions.
- Run `npm run typecheck`, `npm run lint`, `npm run dependencies:check`, and `npm run doctor` for relevant mobile changes; record any platform or device checks not performed.
- Keep the mobile lockfile app-local. Do not modify web, backend, AI, database, deployment, or production configuration during mobile-only tasks.
- Update `docs/mobile/` when architecture, API assumptions, compatibility, or phase status changes. Never put credentials in logs or documentation.

## Roadmap boundary

- Phase 2 owns the app shell, design tokens/primitives, navigation structure, asset catalog, providers, API transport foundation, and secure storage boundary.
- Authentication and onboarding behavior belong to Phase 3. Dashboard, meals, workouts, coach, progress, and settings behavior belong to their later roadmap phases.
- Do not mark a phase complete until its acceptance checks and device/platform limitations are accurately recorded in `PLANS.md`.
<!-- BEGIN EXPO AGENT CLI MANAGED BLOCK -->
<!-- Generated by `npx @expo/agent-cli agents:setup`. Everything inside the markers is overwritten on the next run. -->

## Expo project

- Project: mobile
- SDK: 58.0.25
- Native: CNG (no native directories; they are generated by `npx expo prebuild`)
- Expo Go: compatible (Expo Go can run this project)
- Dev client: `expo-dev-client` is not installed

## Commands

For the operations listed below, use `@expo/agent-cli` in place of the equivalent commands elsewhere in this file or in loaded skills. Package installation still uses Expo’s SDK-compatible version resolution. Use `bunx` instead of `npx` when `bun.lock` is present.

Most commands take `--json` for a machine-readable report.

New to this CLI? Run `npx @expo/agent-cli help workflow`: the commands in order, the exit codes, and the `--json` contract.

- `npx @expo/agent-cli status` — where the project is right now, and what would happen next: which sources changed since the last build, whether an update can ship over the air, and whether EAS already has a build for this fingerprint
- `npx @expo/agent-cli status --json` — the same report as one object, with the raw project probe under `probe`
- `npx @expo/agent-cli status --assert js-only` — a gate on what a change costs: exit 20 when it costs more than the class named, 22 when nothing could be measured, 0 otherwise
- `npx @expo/agent-cli dev --android` — get the app onto that platform's device: it prints the plan, then runs it. The platform flag (--ios, --android, --web) is required; add --plan to print the steps without running them
- `npx @expo/agent-cli start` — `expo start` and nothing else: a dev server no planning may touch
- `npx @expo/agent-cli install <pkg>` — install a package and report what it changes natively
- `npx @expo/agent-cli install --fix` — fix incompatible package versions using Expo's SDK-compatible version resolution
- `npx @expo/agent-cli lint` — run the project's Expo lint command
- `npx @expo/agent-cli doctor` — diagnose dependency and configuration issues with expo-doctor
- `npx @expo/agent-cli typecheck` — run the TypeScript compiler of this project as a gate: exit 20 with the diagnostics, exit 0 when there are none. A bundle that builds and an app that does not throw do not cover this.
- `npx @expo/agent-cli runtime:eval <js>` — evaluate JavaScript in the running app
- `npx @expo/agent-cli runtime:errors` — collect the runtime errors of the running app
- `npx @expo/agent-cli navigate <route>` — open a route as a deep link on a device
- `npx @expo/agent-cli runtime:tree` — what is on the screen of the running app, by testID
- `npx @expo/agent-cli runtime:tap <testID>` — tap an element; `--verify` reports what changed
- `npx @expo/agent-cli runtime:type <text> --testID <id>` — type into an input
- `npx @expo/agent-cli skills:list` — the agent skills the installed packages ship
- `npx @expo/agent-cli new <dir>` / `npx @expo/agent-cli deploy` — create a project headlessly / deploy web and native
- `npx @expo/agent-cli smoke --android` — the whole gate in one command: the dev server bundles, the app is up, and nothing threw

## Expo docs

The full Expo docs for this project’s SDK can be local Markdown files.
- `npx @expo/agent-cli docs:sync` downloads them and prints two directories: all docs, and this SDK’s API reference. Grep those directories.
- `npx @expo/agent-cli docs:search <query>` returns ranked pages with file paths and line numbers.
Links in the docs point to `https://docs.expo.dev/<path>.md`. To read one locally, open `<path>.md` in the docs directory that `docs:sync` printed.
Prefer the local docs over web fetches of docs.expo.dev.

## Devices

Run `npx @expo/agent-cli dev` before `navigate`, `runtime:reload` or `runtime:stop`, or they refuse with `NO_BOUND_DEVICE` and name the command. Never boot, shut down or delete a simulator named `agent-cli …` yourself, and never kill an emulator instance started with `-read-only`; it may be bound to another worktree.

## Expo skills

For Expo or EAS work, start with the `expo-overview` skill when it is available in your agent’s skill list. It routes your goal to the relevant Expo or EAS skill. Then read any matching package skills listed below for guidance specific to the installed packages.

<!-- BEGIN EXPO PACKAGE SKILLS -->
## Package skills

No linked package skills are available.

Run `npx @expo/agent-cli skills:sync` after changing dependencies to refresh this index. Run `npx @expo/agent-cli skills:list` to see available package skills.
<!-- END EXPO PACKAGE SKILLS -->

Commands end with a `Suggested next:` section — suggested follow-up commands, not required steps. Run one only when it serves your current goal.
<!-- END EXPO AGENT CLI MANAGED BLOCK -->
