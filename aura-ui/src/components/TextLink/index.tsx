import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { palette } from "../../theme";

export function TextLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Text style={styles.link}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    color: palette.primary,
    fontWeight: "700",
  },
});
