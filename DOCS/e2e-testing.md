# E2E Testing (Maestro + Expo Dev Client)

This project’s E2E tests validate **real user flows** (seed → dashboard → open task/questions) against the React Native UI while keeping the app in the **Expo managed workflow**.

## Table of contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Build and install the Dev Client](#build-and-install-the-dev-client)
- [Run E2E flows](#run-e2e-flows)
- [What the suite covers](#what-the-suite-covers)
- [Troubleshooting](#troubleshooting)

## Overview

- **Runner**: Maestro
- **App under test**: Expo **Development Client** built with EAS
- **Flows**: `e2e/maestro/`

## Prerequisites

- Install Maestro (recommended via Homebrew): `brew install maestro`
- Install EAS CLI: `yarn global add eas-cli`
- Expo/EAS configured for builds (see `https://docs.expo.dev/build/introduction/`)

## Build and install the Dev Client

The E2E flows assume the **development client** is installed on your simulator/emulator.

- Android: `yarn e2e:build:android`
- iOS: `yarn e2e:build:ios`

## Run E2E flows

- Android: `yarn e2e:maestro:android`
- iOS: `yarn e2e:maestro:ios`
- Default: `yarn e2e`

## What the suite covers

The initial suite is intentionally small and high-signal:

- Seed + verify dashboard (via Seed screen, deterministic cleanup, coordinated seed)
- Begin a task → assert Questions screen opens
- Offline/online smoke (Android-only best-effort airplane mode toggle)

## Troubleshooting

- **Selectors not found**: flows rely on `testID` constants in `src/constants/testIds.ts` and must run against a **Dev Client**, not Expo Go.
- **Alert dialogs**: seed flows use native `Alert` dialogs; if button text changes, update the Maestro YAML steps that tap `OK` / `Delete All`.
- **Bundle identifier mismatch**: flows use `appId: com.orion.tasksystem`. If you change identifiers in `app.json`, update the Maestro YAML files under `e2e/maestro/`.

# E2E Testing (Maestro + Expo Dev Client)

This project’s E2E tests are designed to validate **real user flows** (seed → dashboard → open task/questions) against the actual React Native UI while keeping the app in the **Expo managed workflow**.

## Table of contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Build and install the Dev Client](#build-and-install-the-dev-client)
- [Run E2E flows](#run-e2e-flows)
- [What the suite covers](#what-the-suite-covers)
- [Troubleshooting](#troubleshooting)

## Overview

- **Runner**: Maestro (black-box UI automation).
- **App under test**: Expo **Development Client** built with EAS.
- **Where flows live**: `e2e/maestro/`

## Prerequisites

- **Maestro** installed locally (recommended via Homebrew):
  - `brew install maestro`
- **EAS CLI** installed:
  - `yarn global add eas-cli`
- An Expo account configured for EAS builds (see Expo docs at `https://docs.expo.dev/build/introduction/`).

## Build and install the Dev Client

The E2E flows assume you have the development client installed on your simulator/emulator.

- **Android**:
  - `yarn e2e:build:android`
- **iOS**:
  - `yarn e2e:build:ios`

After the build completes, install the generated artifact on your target device (Android emulator / iOS simulator).

## Run E2E flows

Run platform-specific suites:

- **Android**:
  - `yarn e2e:maestro:android`
- **iOS**:
  - `yarn e2e:maestro:ios`

Run the default suite:

- `yarn e2e`

## What the suite covers

Flows are intentionally small and high-signal:

- **Seed + verify dashboard**: navigates via the menu, clears prior state, seeds coordinated data, and asserts that the dashboard renders.
- **Begin a task + questions navigation**: starts a task from the dashboard and asserts the questions screen loads.
- **Offline/online smoke (Android only)**: best-effort airplane mode toggle to shake out obvious network/offline issues.

## Troubleshooting

- **Maestro can’t find elements**: ensure you’re running a **Dev Client build** (not Expo Go) and that you’re on the expected screen. The flows rely on stable `testID` selectors defined in `src/constants/testIds.ts`.
- **Seed flows hang**: the seed screen shows native `Alert` dialogs that must be dismissed. The flows already tap `OK`; if you changed alert button text, update the flows.
- **App id mismatch**: flows use `appId: com.orion.tasksystem`. If you change bundle identifiers in `app.json`, update the Maestro YAML files under `e2e/maestro/`.
