# FitPilot AI repository guidance

## Architecture and boundaries

- This repository contains separately managed `client/` (React/Vite), `server/` (Express/TypeScript), and `ai-service/` (FastAPI/Python) applications. There is no root package workspace. Preserve that arrangement unless a separately approved architecture change says otherwise.
- `mobile/` is an independently managed Expo SDK 58 native client beside the existing web, Express, and FastAPI applications. The web app remains supported and the backend remains authoritative for shared account data.
- Keep changes within the requested application or documentation scope. Do not reorganize apps, introduce a shared package, or edit unrelated user work.

## Preservation and API safety

- Treat deployed API behavior, Supabase tables and access, authentication, verification, fitness calculations, workout sessions, nutrition parsing, and AI prompts as compatibility-sensitive contracts.
- Before changing a route, response shape, validation rule, or persisted field, inspect all callers and document the impact. Do not infer an endpoint or schema from a frontend type alone.
- Never put Supabase service credentials, JWT signing keys, or internal AI credentials in a client bundle or `EXPO_PUBLIC_` variable. Never copy environment-file values into documentation, logs, or examples.
- Do not change production configuration, database state, credentials, or deployment behavior without explicit scope.

## Mobile requirements

- The planned application is native React Native with Expo Router, TypeScript, and Expo SDK 58 unless the user explicitly changes the target. Follow the SDK 58 dependency manifest and versioned documentation; do not install latest versions by habit.
- Keep the new app independently buildable under `mobile/`; native dependencies belong in that app. Do not introduce WebViews as the screen architecture or force web-only APIs into native code.
- Preserve FitPilot's brand and existing Rocco illustrations. Mobile layouts must be designed for safe areas, touch, system text scaling, platform back behavior, and accessible labels.
- Secure mobile credentials with `expo-secure-store`; browser storage APIs are not a native persistence strategy.

## Engineering and documentation

- Use strict TypeScript, explicit API contracts, consistent loading/error/empty/content states, and narrow feature modules. Prefer the existing backend and established project libraries over unnecessary dependencies.
- Document architectural decisions, verified compatibility, known gaps, and migration risks in `docs/mobile/` as the mobile work proceeds.
- Run only checks relevant to the requested change. Do not add or run tests unless requested; report checks that were not run accurately.
- Preserve existing formatting and conventions where practical. Avoid unrelated changes to web, server, AI service, lockfiles, secrets, or deployment files.
