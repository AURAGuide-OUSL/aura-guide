import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "../../theme/ThemeContext";

export function TextLink({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        link: {
          color: colors.primary,
          fontWeight: "800",
          fontSize: 14,
          textDecorationLine: "underline",
        },
      }),
    [colors],
  );

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="link"
      accessibilityLabel={label}
      style={({ pressed }) => (pressed ? { opacity: 0.75 } : undefined)}
    >
      <Text style={styles.link}>{label}</Text>
    </Pressable>
  );
}
