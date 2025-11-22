import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.auraguide.app',
  appName: 'Aura Guide',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  android: {
    minVersion: 29, // Android 10+
    targetVersion: 34,
    buildOptions: {
      releaseType: 'APK',
    },
  },
  ios: {
    minVersion: '13.0',
  },
  plugins: {
    StatusBar: {
      style: 'dark',
      backgroundColor: '#04297a',
    },
  },
};

export default config;

