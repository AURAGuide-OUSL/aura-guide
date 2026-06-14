import Constants from "expo-constants";
import { Platform } from "react-native";

type AppExtra = {
  apiBaseUrl?: string;
  aiAgentBaseUrl?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as AppExtra;

/** Android emulator: host machine loopback. */
const ANDROID_EMULATOR_HOST = "10.0.2.2";

function pickUrl(
  envValue: string | undefined,
  extraValue: string | undefined,
  webDefault: string,
  androidDefault: string,
): string {
  const trimmed = (envValue || extraValue || "").trim();
  if (trimmed) return trimmed;

  if (Platform.OS === "web") return webDefault;
  if (Platform.OS === "android") return androidDefault;
  // iOS simulator can reach localhost on the Mac host.
  return webDefault;
}

/**
 * Go REST API (auth, tasks, profile, CV extract, …).
 * Set EXPO_PUBLIC_API_BASE_URL in aura-ui/.env before `npm start` or `eas build`.
 */
export const CONFIG = {
  API_BASE_URL: pickUrl(
    process.env.EXPO_PUBLIC_API_BASE_URL,
    extra.apiBaseUrl,
    "http://localhost:8080",
    `http://${ANDROID_EMULATOR_HOST}:8080`,
  ),
  /** FastAPI AI agent (coach, CV analyse, interview, …). Port must match uvicorn. */
  AI_AGENT_BASE_URL: pickUrl(
    process.env.EXPO_PUBLIC_AI_AGENT_BASE_URL,
    extra.aiAgentBaseUrl,
    "http://localhost:8001",
    `http://${ANDROID_EMULATOR_HOST}:8001`,
  ),
};
