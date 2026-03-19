import React from "react";
import { StyleSheet, View } from "react-native";
import { palette } from "../../theme";

export function ProgressBar({ value, color = palette.primary }: { value: number; color?: string }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${value}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
});
