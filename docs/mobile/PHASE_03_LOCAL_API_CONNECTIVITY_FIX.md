# Phase 3 Local API Connectivity Investigation

**Date:** 2026-11-18
**Status:** Code and setup corrections implemented; Windows loopback/LAN checks pass; BlueStacks/iPhone app verification remains pending.

## Summary

The registration screenshot shows the generic connection message, but it does not identify which network layer failed. The source and current workstation state do explain why the message could be misleading:

- `mobile/.env.example` pointed at `http://localhost:5000/api/v1`. Port 5000 matches the non-secret `PORT=5000` setting in this checkout's `server/.env`, but `localhost` is device-local on an iPhone or Android runtime and cannot identify the Windows host from those devices.
- Initially, there was no `mobile/.env.local` in this workspace, and `EXPO_PUBLIC_API_BASE_URL` was unset in the current shell.
- The API client called its URL validator inside the same catch block as `fetch`, so a missing or malformed environment URL was mislabeled as a transport failure.
- Initially no Node process or listener was found on ports 5000 or 10000. After starting the existing Express dev server, its startup log reported `0.0.0.0:5000`; health requests to both `127.0.0.1:5000` and the active Wi-Fi interface (`192.168.0.xxx`, redacted because it is a local address) succeeded and identified the FitPilot Node.js backend. Requests in the sandbox could not see the listener; the permitted host-level check succeeded.

The current project setup had two concrete defects for a device run: no app-local Expo URL was configured in this workspace, and the sample pointed at device-local `localhost`. The API client also mislabeled missing/invalid configuration as a connection failure. An ignored, machine-local `.env.local` has now been configured to use the verified active LAN host and port with `/api/v1`; the private URL is intentionally omitted from tracked documentation. Because the Expo bundle and environment from the screenshot's exact run were not available, that earlier attempt's loaded URL cannot be independently recovered.

## Backend and route findings

- `server/src/server.ts` binds Express to `0.0.0.0` and logs the runtime port when it starts.
- `server/src/config/env.ts` defaults `PORT` to `10000`; the non-secret `server/.env` currently sets `PORT=5000`. A process environment override can still change the effective value.
- `GET /health` is at the root path, not under `/api/v1`.
- Authentication routes are mounted at `/api/v1/auth`; mobile `POST /auth/register` correctly combines with a base URL ending in `/api/v1`.
- Express was started for verification and logged `0.0.0.0:5000`. Windows loopback and LAN `GET /health` both returned `status: online` and `FitPilot AI Node.js Engine` on that port. The server was stopped after the checks. The `server/.env` setting is the active configured port for this run.
- The startup log reported the optional AI service offline; its URL was redacted. Registration is served by Express and does not call that AI service.
- BlueStacks and iPhone browser/app checks were not available in this session. No firewall rules were changed.

## Implementation

`mobile/src/lib/api/api-client.ts` now validates configuration before the transport catch and returns `ApiError` code `API_CONFIGURATION_ERROR` for missing, malformed, credential-bearing, incorrectly prefixed, or disallowed HTTP URLs. It separately represents timeouts, transport failures, HTTP responses, and invalid successful response bodies. Development diagnostics include only a category, sanitized origin/route, status, and exception type; they never log request bodies, credentials, or headers.

`mobile/src/lib/auth/auth-api.ts` now gives configuration, transport, timeout, and invalid-response failures distinct user-facing messages. Existing HTTP status and backend error-code handling is retained. Registration behavior, request body, validation, verification handoff, and form data retention are unchanged.

`mobile/.env.example` now uses host/port placeholders instead of suggesting localhost:5000. An ignored `mobile/.env.local` contains this machine's verified development URL and is excluded from Git. `mobile/README.md` documents how to identify the actual Express port, verify `/health`, use a reachable Windows LAN address from a physical device, distinguish BlueStacks from Android Studio Emulator routing, and restart Metro after changing Expo environment configuration.

## Local setup

1. Start Express and record the actual `0.0.0.0:<PORT>` line. Do not rely only on the source default.
2. From Windows, check `http://127.0.0.1:<PORT>/health`; then check `http://<WINDOWS_LAN_IP>:<PORT>/health` using the active private network interface.
3. In `mobile/.env.local`, set `EXPO_PUBLIC_API_BASE_URL=http://<WINDOWS_LAN_IP>:<PORT>/api/v1` for a development device on the same LAN. Replace the placeholders with real values; never use them literally. For a remotely hosted API, use its HTTPS `/api/v1` URL.
4. Test `/health` in the BlueStacks or iPhone browser before testing the app. BlueStacks routing was not verified here; do not assume Android Studio Emulator's `10.0.2.2` address works in BlueStacks.
5. Restart Metro with `npm run start:clear -- --go --lan` after changing `.env.local`. Metro's LAN/tunnel setting does not tunnel the Express API.
6. If only Windows checks pass, inspect local network isolation and a narrowly scoped Windows Firewall rule for the Private profile. Do not disable the firewall or expose the port publicly.

## Validation and remaining gate

| Check | Result |
|---|---|
| Backend bind, default port, health and auth route source | Confirmed: `0.0.0.0`, source default `10000`, `GET /health`, and `/api/v1/auth/register`. |
| Non-secret server port setting | `server/.env` sets `PORT=5000`; Express startup also confirmed the active listener on port 5000. |
| Windows health checks | Passed after starting Express: `127.0.0.1:5000/health` and the active Wi-Fi host address `:5000/health` both returned the FitPilot backend identity. Port 10000 is not the current configured port. |
| TypeScript | Passed: `npm run typecheck`. |
| Lint | Exit 0: `npm run lint`; two duplicate-import warnings in the untouched `src/app/(onboarding)/welcome.tsx`. |
| Existing auth tests | Passed: `npm run test:auth`, 5/5. |
| Dependency check | Exit 0 using Expo's local bundled map; network access was unavailable, so live version validation is unreliable. |
| Expo Doctor | Not run; no dependencies or native configuration changed. |
| BlueStacks / physical iPhone / registration request | Not run; no device session was available. A registration POST was deliberately not issued, so no account was created. |

No account data was created or changed. The client change is validated statically, but the end-to-end network path remains open.

**Readiness: READY WITH CONDITIONS.** The configuration/error fix and Windows loopback/LAN health checks pass. BlueStacks and physical iPhone browser/app checks, plus registration using an authorized development account, remain necessary before declaring the mobile flow fully verified.
