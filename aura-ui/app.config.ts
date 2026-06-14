import { ExpoConfig, ConfigContext } from "expo/config";

/**
 * Expo app config. API URLs for mobile/APK builds come from EXPO_PUBLIC_* in `.env`
 * (see `.env.example`). Cleartext HTTP is enabled for local/LAN development backends.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "AURA Guide",
  slug: "aura-guide",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  platforms: ["android", "ios", "web"],
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    aiAgentBaseUrl: process.env.EXPO_PUBLIC_AI_AGENT_BASE_URL,
  },
  android: {
    package: "com.entgra.auraguide",
    usesCleartextTraffic: true,
  },
  ios: {
    bundleIdentifier: "com.entgra.auraguide",
    infoPlist: {
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
      },
    },
  },
  web: {
    bundler: "metro",
  },
  plugins: ["expo-asset"],
});
