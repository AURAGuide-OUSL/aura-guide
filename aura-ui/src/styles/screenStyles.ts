import { Dimensions, Platform, StyleSheet } from "react-native";
import { useMemo } from "react";
import { useTheme } from "../theme/ThemeContext";

const { width: SCREEN_W } = Dimensions.get("window");

export const screenPadding = Math.min(20, Math.max(14, SCREEN_W * 0.045));

export const responsive = {
  heroTitle: SCREEN_W < 360 ? 24 : SCREEN_W < 400 ? 26 : 28,
  sectionTitle: SCREEN_W < 360 ? 17 : 18,
};

export const screenStyles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: screenPadding,
    paddingTop: 14,
    paddingBottom: Platform.OS === "ios" ? 112 : 100,
    gap: 16,
  },
});

/** Scroll content style that respects dark/light theme background. */
export function useScreenScrollStyle(extra?: object) {
  const { colors } = useTheme();
  return useMemo(
    () => [screenStyles.scrollContent, { backgroundColor: colors.background }, extra],
    [colors, extra],
  );
}
