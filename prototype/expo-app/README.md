# NestQuest — Expo (React Native) App

This folder contains the **React Native + Expo SDK 54** application. It runs on **web**, **iOS**, and **Android** from a single codebase.

## Requirements

- **Node.js** ≥ 20.19 (required for Expo SDK 54)
- **npm** or **yarn** or **pnpm**

## Setup

```bash
cd expo-app
npm install
```

## Run

- **Web (development):**  
  `npm run web`  
  or  
  `npx expo start --web`

- **Web (production build):**  
  `npm run build:web`  
  Output is in `dist/` (static files you can host anywhere).

- **iOS simulator:**  
  `npm run ios`  
  or  
  `npx expo start --ios`

- **Android emulator:**  
  `npm run android`  
  or  
  `npx expo start --android`

- **Generic dev server (then choose platform):**  
  `npm start`  
  Then press `w` for web, `i` for iOS, `a` for Android.

## Tech stack

| Item        | Version / choice |
|------------|------------------|
| Expo SDK    | **54**           |
| React       | 19.1.0          |
| React Native| 0.81             |
| React Native Web | 0.21.0   |
| Routing     | Expo Router (file-based) |

## Project layout

- `app/` – Expo Router screens (`_layout.tsx`, `index.tsx`, `quiz.tsx`, etc.)
- `assets/` – Images and static assets (see `assets/README.md` for required files)
- `app.json` – Expo config (name, slug, web/iOS/Android settings)

## Relation to the Next.js app

- The **Next.js** app lives in the parent `prototype/` folder (pages, API routes, Tailwind, etc.).
- This **Expo** app is a separate React Native codebase that uses Expo SDK 54 and can:
  - Share API endpoints (e.g. `fetch` to the Next.js or any backend).
  - Reuse business logic by copying or symlinking modules (e.g. calculations, types) into `expo-app/`.

To have the **web app build** use this Expo app for web:

1. Run `npm run build:web` inside `expo-app`.
2. Serve the generated `expo-app/dist/` folder (e.g. with any static host).
3. Optionally point your main domain or a subdomain to this static build instead of the Next.js build.

## Assets

See `assets/README.md` for adding app icon, splash, and favicon. Until then, the app runs without custom icons.
