import React, { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { palette } from "../../theme";

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  rightAction,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: ReactNode;
}) {
  return (
    <View style={styles.screenHeader}>
      <View style={styles.screenHeaderRow}>
        <View style={styles.screenHeaderTitleRow}>
          {onBack ? (
            <Pressable onPress={onBack} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={20} color={palette.text} />
            </Pressable>
          ) : null}
          <View>
            <Text style={styles.screenTitle}>{title}</Text>
            {subtitle ? <Text style={styles.screenSubtitle}>{subtitle}</Text> : null}
          </View>
        </View>
        {rightAction}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenHeader: {
    marginBottom: 6,
  },
  screenHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  screenHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: palette.text,
  },
  screenSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: palette.muted,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: palette.border,
  },
});
