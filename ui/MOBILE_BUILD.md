# Aura Guide – Mobile Build Guide

This project uses **Capacitor 6** to wrap the Vite/React web app into native Android and iOS binaries.

---

## 1. Requirements

### Common
- Node.js 18+
- npm 9+
- Capacitor CLI (installed automatically via `npm install`)

### Android
- Android Studio (latest)
- Android SDK Platform 34 + Build Tools
- Java JDK 11+
- Android 10 (API 29) device/emulator or higher

### iOS (macOS only)
- macOS 13+
- Xcode (latest)
- CocoaPods (`sudo gem install cocoapods`)
- Apple Developer account for App Store distribution

---

## 2. Initial Setup

```bash
cd ui
npm install

# optional helper
./setup-mobile.sh
```

The helper script will:
1. Build the web assets (`npm run build`)
2. Add Android/iOS platforms (adds `android/` & `ios/`)
3. Run `npx cap sync`

> If you prefer manual steps: `npm run build`, `npx cap add android`, `npx cap add ios` (macOS), then `npx cap sync`.

---

## 3. Building Android APK (Android 10+)

Android configuration in `capacitor.config.ts` enforces:
- `minVersion: 29` (Android 10 / API 29)
- `releaseType: 'APK'`

### Steps
```bash
# Build web + sync native platforms
npm run build:mobile

# Open Android Studio
npm run build:android
```

In Android Studio:
1. Wait for Gradle sync.
2. Select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
3. APK location: `android/app/build/outputs/apk/debug/app-debug.apk`.

### Release APK
```bash
cd android
./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk
```

> Generate / configure a keystore before release builds (`keytool -genkey`). Update Gradle signingConfig or let Android Studio sign via **Build > Generate Signed Bundle / APK**.

---

## 4. Building iOS IPA (iOS 13+)

```bash
npm run build:mobile
npm run build:ios   # opens Xcode
```

In Xcode:
1. Choose a Team under **Signing & Capabilities**.
2. Select a physical device or simulator.
3. **Product > Run** for dev build.
4. **Product > Archive** for App Store/TestFlight.

Exported IPA is generated via the Organizer window.

---

## 5. Frequently Used npm Scripts

| Script | Purpose |
| --- | --- |
| `npm run build` | Web production build (Vite) |
| `npm run build:mobile` | Build web + `npx cap sync` |
| `npm run build:android` | Build+sync then open Android Studio |
| `npm run build:ios` | Build+sync then open Xcode |
| `npm run android:dev` | Build+sync then run on Android device/emulator |
| `npm run ios:dev` | Build+sync then run on iOS device/simulator (macOS) |
| `npm run sync` | Sync compiled web assets into native shells |

---

## 6. Troubleshooting

### Android
- **Gradle sync fails**: `cd android && ./gradlew clean`
- **SDK missing**: install required SDK platforms from Android Studio.
- **Device below Android 10**: not supported (minVersion 29).

### iOS
- **Pod install errors**: `cd ios/App && pod deintegrate && pod install`
- **Code signing**: ensure valid Apple ID + provisioning profiles.
- **Derived data issues**: `rm -rf ~/Library/Developer/Xcode/DerivedData`

---

## 7. Notes
- Native folders (`android/`, `ios/`) are ignored by Git—generate them locally when needed.
- Never commit keystores or provisioning profiles. Add them to a secure storage solution.
- Update versions in `package.json`, `capacitor.config.ts`, Android `build.gradle`, and iOS `Info.plist` before release.

Happy shipping! 🚀

