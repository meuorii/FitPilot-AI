# FitPilot AI Mobile

An independently managed native Expo app alongside `client/`, `server/`, and `ai-service/`. This project targets Expo SDK 58 (React Native 0.88 / React 19.3) and uses Expo Router, TypeScript, and the React Native New Architecture. It is not a WebView wrapper.

## Local setup

1. Install Node.js 20.19.4 or newer and npm. From this directory run:

   ```powershell
   npm install
   Copy-Item .env.example .env.local
   ```

2. Set `EXPO_PUBLIC_API_BASE_URL` in `.env.local` to the existing Express API prefix ending in `/api/v1`. Keep secrets out of all `EXPO_PUBLIC_` variables. The client validates this prefix before making requests and reports configuration errors separately from connection failures.

   For a local backend, start `server/` in a separate terminal with `npm run dev` and use the actual `Listening: 0.0.0.0:<PORT>` line from its output. The source default is port `10000`; `.env` or a process environment override may change it. On Windows, confirm the listener and test `http://127.0.0.1:<PORT>/health`. Then test `http://<WINDOWS_LAN_IP>:<PORT>/health` using the private IPv4 address for the active Wi-Fi/Ethernet adapter. `/health` is at the host root; the mobile API base itself must end in `/api/v1`.

   For a physical iPhone or BlueStacks on the same LAN, set the base URL to `http://<WINDOWS_LAN_IP>:<PORT>/api/v1` and test that same health URL in the device browser first. Do not use `localhost`: it refers to the device. BlueStacks routing differs from Android Studio Emulator; use the Windows LAN address only after the BlueStacks browser can reach it. `10.0.2.2` is the standard host-loopback alias for the Android Studio Emulator ([Android documentation](https://developer.android.com/studio/run/emulator-networking-address)) and should not be assumed to work in BlueStacks. Metro's `--lan` or `--tunnel` option only affects the JavaScript bundle connection, not the app's Express API connection.

   If Windows health checks work but a device cannot connect, check that the device and computer share a reachable network and that Windows Firewall permits the backend port on the Private profile. Do not disable the firewall or expose the port on Public networks. After editing `.env.local`, stop Metro and restart it with `npm run start:clear -- --go --lan` so Expo bundles the new public URL.

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
