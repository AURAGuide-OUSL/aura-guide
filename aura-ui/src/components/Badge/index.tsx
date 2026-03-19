import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function Badge({
  label,
  backgroundColor,
  textColor,
}: {
  label: string;
  backgroundColor: string;
  textColor: string;
}) {
  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
