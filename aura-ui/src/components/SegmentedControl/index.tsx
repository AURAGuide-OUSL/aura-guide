import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { cardShadow, palette } from "../../theme";

export function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.segment, active ? styles.segmentActive : undefined]}
          >
            <Text style={[styles.segmentLabel, active ? styles.segmentLabelActive : undefined]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  segmented: {
    flexDirection: "row",
    backgroundColor: palette.surfaceMuted,
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: palette.surface,
    ...cardShadow.shadow,
  },
  segmentLabel: {
    color: palette.muted,
    fontWeight: "700",
  },
  segmentLabelActive: {
    color: palette.primary,
  },
});
