import React, { ReactNode, useMemo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "../../theme/ThemeContext";

export function PickerField({
  label,
  selectedValue,
  onValueChange,
  children,
}: {
  label: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}) {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        inputGroup: { gap: 8 },
        inputLabel: { fontSize: 14, fontWeight: "700", color: colors.text },
        pickerWrapper: {
          height: 52,
          borderRadius: 16,
          backgroundColor: colors.surfaceMuted,
          borderWidth: 1,
          borderColor: colors.border,
          justifyContent: "center",
        },
        picker: {
          marginHorizontal: 8,
          color: colors.text,
          backgroundColor: "transparent",
          borderWidth: 0,
          ...(Platform.OS === "web" ? ({ paddingRight: 28 } as any) : {}),
        },
      }),
    [colors],
  );

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={[
            styles.picker,
            Platform.OS === "web"
              ? ({
                  appearance: "none",
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  outlineWidth: 0,
                } as any)
              : null,
          ]}
          dropdownIconColor={colors.primary}
        >
          {children}
        </Picker>
      </View>
    </View>
  );
}
