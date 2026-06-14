import React from "react";
import { StyleSheet, View } from "react-native";
import { palette } from "../../theme";

export function ProgressBar({ value, color = palette.primaryMuted }: { value: number; color?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${clamped}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(148, 163, 184, 0.28)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
});
