import React, { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { palette } from "../../theme";

export function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  secondary,
  disabled,
  icon,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "danger";
  secondary?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  style?: any;
}) {
  const isSecondary = secondary || variant === "secondary";
  const isDanger = variant === "danger";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        isSecondary ? styles.buttonSecondary : isDanger ? styles.buttonDanger : styles.buttonPrimary,
        pressed && !disabled ? styles.buttonPressed : undefined,
        disabled ? styles.buttonDisabled : undefined,
        style,
      ]}
    >
      <View style={styles.buttonContent}>
        {icon}
        <Text style={[
          styles.buttonLabel, 
          isSecondary ? styles.buttonLabelSecondary : styles.buttonLabelPrimary
        ]}>
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
  buttonDanger: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
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
    color: "#FFFFFF",
  },
  buttonLabelSecondary: {
    color: palette.text,
  },
});
