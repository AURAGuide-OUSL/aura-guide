import { useMemo } from "react";
import { useTheme } from "./ThemeContext";

/** Dynamic text colors for screens whose StyleSheet was created with a frozen light palette. */
export function useTextColors() {
  const { colors } = useTheme();
  return useMemo(
    () => ({
      text: { color: colors.text } as const,
      muted: { color: colors.muted } as const,
      primary: { color: colors.primary } as const,
      onPrimary: { color: "#FFFFFF" } as const,
      surfaceBg: { backgroundColor: colors.surface } as const,
      screenBg: { backgroundColor: colors.background } as const,
      border: { borderColor: colors.border } as const,
    }),
    [colors],
  );
}
