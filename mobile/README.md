# FitPilot AI Mobile

An independently managed native Expo app alongside `client/`, `server/`, and `ai-service/`. This project targets Expo SDK 58 (React Native 0.88 / React 19.3) and uses Expo Router, TypeScript, and the React Native New Architecture. It is not a WebView wrapper.

## Local setup

1. Install Node.js 20.19.4 or newer and npm. From this directory run:

   ```powershell
   npm install
   Copy-Item .env.example .env.local
   ```

2. Set `EXPO_PUBLIC_API_BASE_URL` in `.env.local` to the existing Express API prefix ending in `/api/v1` (for example, `https://api.example.com/api/v1`). Keep secrets out of all `EXPO_PUBLIC_` variables. The client validates this prefix before making requests.

3. Start Expo Go mode:

   ```powershell
   npm start -- --go --lan
   ```

   Use a physical device and computer on the same network. The Expo Go app must include SDK 58. For physical iPhone development, sign in to Expo CLI and Expo Go with the same Expo account (`npx --yes @expo/agent-cli@latest login`; verify with `npx --yes @expo/agent-cli@latest whoami`). Follow Expo's current iPhone distribution instructions for SDK 58; the App Store Expo Go may lag behind. Android builds can be selected at <https://expo.dev/go>. If LAN discovery is blocked, use `npm start -- --go --tunnel`. A tunnel only connects Metro; the phone still needs an API URL it can reach.

   On a physical device, `localhost` points to that device. For a local Express server, use the development computer's private LAN address; development builds permit private-LAN HTTP URLs in `apiRequest`, though OS/network policy may require an HTTPS tunnel. Production builds require HTTPS.

## Validation

```powershell
npm run typecheck
npm run lint
npm run dependencies:check
npm run doctor
npx --yes @expo/agent-cli@latest export --platform ios
npx --yes @expo/agent-cli@latest export --platform android
```

Clear Metro's cache when troubleshooting:

```powershell
npm run start:clear -- --go --lan
```

`npm run android` / `npm run ios` start Expo and request a connected local simulator/device; this Windows host has no Android SDK/ADB or iOS Simulator. Do not run prebuild for this foundation. The app remains in Expo Go / CNG mode with no checked-in native folders.

## Development preview

In development, `/` opens the five-tab preview shell. Its banner and route shortcuts clearly label the preview; no login is simulated, no token is created, and no user fitness values are fabricated. Non-development `/` redirects to the login placeholder until Phase 3 implements authentication.

See [`../docs/mobile/PHASE_03_AUTH_ONBOARDING.md`](../docs/mobile/PHASE_03_AUTH_ONBOARDING.md) for the current authentication and onboarding behavior and device limitations.
