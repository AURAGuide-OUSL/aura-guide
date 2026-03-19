import React, { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { palette } from "../../theme";

export function PrimaryButton({
  label,
  onPress,
  secondary,
  disabled,
  icon,
}: {
  label: string;
  onPress?: () => void;
  secondary?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        secondary ? styles.buttonSecondary : styles.buttonPrimary,
        pressed && !disabled ? styles.buttonPressed : undefined,
        disabled ? styles.buttonDisabled : undefined,
      ]}
    >
      <View style={styles.buttonContent}>
        {icon}
        <Text style={[styles.buttonLabel, secondary ? styles.buttonLabelSecondary : styles.buttonLabelPrimary]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  buttonPrimary: {
    backgroundColor: palette.primary,
  },
  buttonSecondary: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: "800",
  },
  buttonLabelPrimary: {
    color: palette.surface,
  },
  buttonLabelSecondary: {
    color: palette.text,
  },
});
