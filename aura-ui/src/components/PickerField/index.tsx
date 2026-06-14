import React, { Children, ReactElement, ReactNode, cloneElement, isValidElement, useMemo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "../../theme/ThemeContext";

function themedPickerItems(children: ReactNode, textColor: string): ReactNode {
  return Children.map(children, (child) => {
    if (isValidElement(child) && child.type === Picker.Item) {
      return cloneElement(child as ReactElement<{ color?: string }>, { color: textColor });
    }
    return child;
  });
}

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
  const { colors, isDark } = useTheme();
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
          overflow: "hidden",
        },
        picker: {
          marginHorizontal: 8,
          color: colors.text,
          backgroundColor: colors.surfaceMuted,
          borderWidth: 0,
          ...(Platform.OS === "web" ? ({ paddingRight: 28 } as any) : {}),
        },
      }),
    [colors],
  );

  const webSelectStyle =
    Platform.OS === "web"
      ? ({
          color: colors.text,
          backgroundColor: colors.surfaceMuted,
          colorScheme: isDark ? "dark" : "light",
        } as any)
      : null;

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={[styles.picker, webSelectStyle]}
          itemStyle={Platform.OS === "ios" ? { color: colors.text } : undefined}
          dropdownIconColor={colors.primary}
        >
          {themedPickerItems(children, colors.text)}
        </Picker>
      </View>
    </View>
  );
}
