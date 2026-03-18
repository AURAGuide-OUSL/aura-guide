import { StyleSheet } from "react-native";

export const palette = {
  background: "#F3F7FC",
  surface: "#FFFFFF",
  surfaceMuted: "#EAF1FB",
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  secondary: "#7C3AED",
  text: "#0F172A",
  muted: "#64748B",
  border: "#D7E3F4",
  success: "#16A34A",
  warning: "#D97706",
  danger: "#DC2626",
  info: "#0EA5E9",
  chipBlue: "#DBEAFE",
  chipPurple: "#EDE9FE",
  chipGreen: "#DCFCE7",
  chipYellow: "#FEF3C7",
};

export const cardShadow = StyleSheet.create({
  shadow: {
    shadowColor: "#1E3A8A",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
});
