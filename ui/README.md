
# Aura Guide Mobile App

Figma reference: https://www.figma.com/design/hI2O53XSRsikCfqz8zv4wq/Aura-Mobile-APP.

## Web Development

```bash
cd ui
npm install
npm run dev
```

## Mobile Builds (Android APK & iOS IPA)

The project ships with Capacitor 6 tooling.

### Quick Setup

```bash
cd ui
./setup-mobile.sh   # installs deps, builds, adds platforms, syncs
```

Manual equivalent:

```bash
npm install
npm run build
npx cap add android
npx cap add ios   # macOS only
npx cap sync
```

### Android (APK, Android 10+)

```bash
npm run build:android   # build + open Android Studio
```

Then in Android Studio: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.  
APK output: `android/app/build/outputs/apk/debug/app-debug.apk`.

For release APK/AAB use **Build > Generate Signed Bundle / APK** or run Gradle (`./gradlew assembleRelease`).

### iOS (IPA, iOS 13+)

```bash
npm run build:ios   # build + open Xcode (macOS)
```

Use **Product > Run** for dev builds and **Product > Archive** for distribution/TestFlight.

> Detailed steps live in [MOBILE_BUILD.md](./MOBILE_BUILD.md).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Web production build |
| `npm run build:mobile` | Build web + `npx cap sync` |
| `npm run build:android` | Build mobile + open Android Studio |
| `npm run build:ios` | Build mobile + open Xcode (macOS) |
| `npm run sync` | Sync compiled web assets to native shells |
| `npm run android:dev` | Build+sync then run on Android device/emulator |
| `npm run ios:dev` | Build+sync then run on iOS device/simulator |

## Requirements

- Node.js 18+, npm 9+
- Android Studio + SDK 34 (min SDK 29 / Android 10)
- macOS + Xcode + CocoaPods for iOS builds

## Project Layout

```
ui/
├── src/                 # React application
├── build/               # Vite output (fed into Capacitor)
├── capacitor.config.ts  # Capacitor settings
├── setup-mobile.sh      # Helper script
└── MOBILE_BUILD.md      # Detailed instructions
```
  