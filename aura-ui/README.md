# AURA Guide Expo Run Guide

This project has been converted into an Expo-based React Native app with web support, so you can run it in the browser.

## 1. Open the project folder

```bash
cd /home/nkavindya/EntgraRepo/Uni/aura-guide/aura-ui
```

## 2. Install dependencies

If this is your first time running the app, install the packages:

```bash
npm install
```

## 3. Start Expo

Run the Expo development server:

```bash
npm run start
```

Expo will show options for Android, iOS, and web.

## 4. Run the app in the browser

Use either of these approaches:

```bash
npm run web
```

Or, if `npm run start` is already running, press `w` in that terminal to open the web version.

## 5. What to expect

- Expo will bundle the React Native app for the browser using `react-native-web`.
- The browser usually opens automatically.
- If it does not, open the local URL shown in the terminal, which is usually `http://localhost:8081`.

## 6. If dependencies change later

Re-run:

```bash
npm install
```

## 7. Useful commands

```bash
npm run start
npm run web
npm run android
npm run ios
npm run typecheck
npm run build:apk    # EAS cloud build → Android APK
```

## 8. API URLs (physical device / APK)

Copy `.env.example` to `.env` and set your laptop's LAN IP:

```bash
cp .env.example .env
# EXPO_PUBLIC_API_BASE_URL=http://YOUR_LAN_IP:8080
# EXPO_PUBLIC_AI_AGENT_BASE_URL=http://YOUR_LAN_IP:8001
```

Before building an APK, also update the same URLs in `eas.json` (`build.preview.env`). See the root [`README.md`](../README.md) for the full mobile setup guide.

## 9. Notes

- The Expo app uses `App.tsx` and the `src/` folder. All screens load live data from the Go API and Python AI agent — there is no mock data layer.
- Android APK builds allow HTTP to LAN backends via `usesCleartextTraffic` in `app.config.ts`.
