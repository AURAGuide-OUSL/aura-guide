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
```

## 8. Notes

- The old Vite web source is left in the repository for reference, but the Expo app now uses `App.tsx` and `src-native/`.
- The TypeScript config excludes the legacy `src/` folder so the Expo app can build cleanly without the old web-only files.
