# Cool Blue-Gray Design System Migration

**Date:** 2026-11-18  
**Status:** Implemented; physical-device review remains pending.

## Scope and approach

Updated the existing `mobile/src/theme/colors.ts` source of truth and preserved the `useAppColors()` semantic interface. The migration changes color assignments only, with small component-state adjustments to make the approved palette readable and accessible. It does not change routing, authentication, onboarding persistence or calculations, API behavior, feature scope, mascot artwork, motion, haptics, dependencies, or the light-only appearance.

## Old-to-new semantic mapping

| Role | Previous | Current |
|---|---|---|
| Main canvas | `#F5F3F6` | `#F5F7FB` |
| Secondary surface | `#DCD6DE` | `#D9E1EE` |
| Primary CTA | `#596783` | `#5A729D` |
| Selected/strong brand | `#7482A4` | `#445A82` |
| Pressed brand | `#4C5873` | `#384A6A` |
| Primary text | `#38323F` | `#1F2A3D` |
| Secondary text | `#595460` | `#465368` |
| Muted text | `#595460` | `#5F6C82` |
| Border/divider | `#E2DFE7` / `#ECEAF1` | `#E3E8F1` |
| Interactive control outline | `#E2DFE7` | `#5F6C82` |
| Focus | `#344F85` | `#445A82` |
| Disabled surface | `#AAA6B0` | `#E3E8F1` with `#5F6C82` text |
| Skeleton | `#E7E4EB` | `#E3E8F1` |

The approved brand, neutral, and semantic scales are exported from the existing theme entry point. Existing semantic property names remain available; additional semantic roles were added for subtle/pressed surfaces, accessible controls, and semantic light/strong variants. Screens continue to consume semantic tokens rather than numeric palette entries.

## Components and surfaces

- Shared button variants now use brand-500 primary, a tinted secondary action, and an accent quiet action. Pressed, loading, and disabled states retain accessible foregrounds.
- Text fields retain white surfaces with visible focus/error borders and an explicit disabled treatment. OTP and onboarding selection controls use a stronger neutral outline on unselected states.
- The app canvas, navigation theme, tab selection, launch splash, and Android adaptive-icon background use the new cool blue-gray foundation. The established five-tab routing and status-bar style remain unchanged.
- Authentication, onboarding, authenticated placeholders, cards, badges, and feedback already consume shared tokens, so they inherit the migrated palette. Rocco assets and layouts are untouched.

## Contrast review

Calculated WCAG contrast ratios for key text/control pairings:

| Pairing | Ratio | Result |
|---|---:|---|
| White on CTA `#5A729D` | 4.85:1 | Passes normal-text target |
| `#1F2A3D` on canvas `#F5F7FB` | 13.44:1 | Passes |
| `#465368` on secondary surface `#D9E1EE` | 5.91:1 | Passes |
| `#5F6C82` on secondary surface `#D9E1EE` | 4.04:1 | Fails normal-text target; not used as ordinary secondary copy on tinted groupings |
| `#5F6C82` control outline on white / tint | 5.31:1 / 4.04:1 | Passes non-text target |
| Success strong on success light | 4.75:1 | Passes |
| Error strong on error light | 5.53:1 | Passes |
| Information strong on information light | 6.06:1 | Passes |

The supplied warning strong `#9F6B12` reaches 4.33:1 on `#FFF8EA`. The semantic `warning` text role uses the approved neutral-800 foreground `#2F3C50` (10.55:1); amber warning base/strong colors remain available for indicators and larger visual marks. Neutral-600 is used for muted text instead of the lighter neutral-500 to keep ordinary labels legible. The approved `#C8D2E1` border remains available for decorative/low-emphasis separation; interactive control outlines use neutral-600 to meet the non-text contrast target.

## Validation

| Check | Result |
|---|---|
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npm run test:auth` | Passed, 5/5 existing tests |
| `npm run dependencies:check` | Passed using the local SDK manifest; online well-known versions endpoint unavailable, so remote version validation was unreliable |
| `npm run doctor` | Unverified: `npx expo-doctor@latest` could not download in this network-restricted session |
| Expo agent CLI | Unavailable: fetching `@expo/agent-cli@latest` stalled with network disabled; local Expo CLI used for exports |
| Android Expo export | Passed; 1,794 modules bundled |
| iOS Expo export | Passed; 1,799 modules bundled |
| Physical-device and screenshot review | Not performed in this session |

## Device review still needed

On SDK-58-compatible Expo Go or a development build, check compact screens, large system text, disabled fields/buttons, focus and error borders, tab/header/safe-area surfaces, and device Dark Mode (the app remains fixed light). Repeat on iOS and Android, including Android system navigation appearance. No device was available here. Expo's installed config schema marks the legacy `androidNavigationBar` property deprecated and ineffective; no misleading config was added. Android's system navigation bar therefore remains a device-check item.

## Preservation

All modifications are in the existing mobile theme, mobile shared UI/config, and this report. No web, server, AI service, API contract, database, dependency, lockfile, roadmap phase, or Git history changes were made. Phase 4 remains unstarted.
