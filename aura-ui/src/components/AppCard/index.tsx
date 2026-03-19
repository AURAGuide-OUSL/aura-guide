import React, { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { cardShadow, palette } from "../../theme";

export function AppCard({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.card, cardShadow.shadow, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    padding: 18,
  },
});
