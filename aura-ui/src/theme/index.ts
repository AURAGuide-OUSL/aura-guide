import { Platform, StyleSheet } from "react-native";

export const lightPalette = {
  background: "#F8FAFC",
  backgroundAccent: "#F1F5F9",
  surface: "#FFFFFF",
  surfaceMuted: "#F1F5F9",
  primary: "#4F46E5",
  primaryMuted: "#818CF8",
  primaryDark: "#3730A3",
  secondary: "#7C3AED",
  accent: "#0D9488",
  text: "#0F172A",
  muted: "#64748B",
  border: "rgba(148, 163, 184, 0.2)",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
  chipBlue: "#E0E7FF",
  chipPurple: "#EDE9FE",
  chipGreen: "#D1FAE5",
  chipYellow: "#FEF3C7",
  cardBg: "#FFFFFF",
  headerBg: "#FFFFFF",
};

export const darkPalette = {
  background: "#0F172A",
  backgroundAccent: "#1E293B",
  surface: "#1E293B",
  surfaceMuted: "#334155",
  primary: "#6366F1",
  primaryMuted: "#818CF8",
  primaryDark: "#4F46E5",
  secondary: "#A78BFA",
  accent: "#2DD4BF",
  text: "#F8FAFC",
  muted: "#94A3B8",
  border: "rgba(255, 255, 255, 0.1)",
  success: "#34D399",
  warning: "#FBBF24",
  danger: "#F87171",
  info: "#60A5FA",
  chipBlue: "#312E81",
  chipPurple: "#4C1D95",
  chipGreen: "#064E3B",
  chipYellow: "#78350F",
  cardBg: "#1E293B",
  headerBg: "#0F172A",
};

export const palette = { ...lightPalette };

export const setTheme = (isDark: boolean) => {
  const newPalette = isDark ? darkPalette : lightPalette;
  Object.assign(palette, newPalette);
};

export const cardShadow = StyleSheet.create({
  shadow:
    Platform.OS === "web"
      ? ({
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        } as any)
      : {
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        },
});

export const commonStyles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  stackMd: {
    gap: 16,
  },
  stackSm: {
    gap: 12,
  },
  stackXs: {
    gap: 8,
  },
  progressSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  helperText: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: palette.text,
    letterSpacing: -0.3,
  },
  cardBody: {
    color: palette.muted,
    lineHeight: 22,
    marginTop: 4,
    fontSize: 14,
  },
  cardBodyStrong: {
    color: palette.text,
    fontWeight: "700",
    fontSize: 15,
    lineHeight: 22,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
