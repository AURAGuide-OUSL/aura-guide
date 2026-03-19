import React, { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { palette } from "../../theme";

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
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={styles.picker}
          dropdownIconColor={palette.primary}
        >
          {children}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: palette.text,
  },
  pickerWrapper: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#F8FBFF",
    borderWidth: 1,
    borderColor: palette.border,
    justifyContent: "center",
  },
  picker: {
    marginHorizontal: 4,
    color: palette.text,
  },
});
