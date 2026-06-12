import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { palette, commonStyles } from "../../theme";
import { AppCard } from "../../components/AppCard";
import { Badge } from "../../components/Badge";
import { ScreenHeader } from "../../components/ScreenHeader";
import { SegmentedControl } from "../../components/SegmentedControl";
import { TextLink } from "../../components/TextLink";
import { notificationSeed } from "../../../src-native/mockData";

function notificationTint(type: string) {
  switch (type) {
    case "achievement":
      return { backgroundColor: palette.chipYellow, textColor: palette.warning, icon: "trophy-outline" as const };
    case "task":
      return { backgroundColor: palette.chipBlue, textColor: palette.primary, icon: "checkbox-outline" as const };
    case "ai":
      return { backgroundColor: palette.chipPurple, textColor: palette.secondary, icon: "sparkles-outline" as const };
    default:
      return { backgroundColor: palette.chipGreen, textColor: palette.success, icon: "calendar-outline" as const };
  }
}

export function NotificationsScreen({
  notifications,
  onBack,
  onMarkAllRead,
}: {
  notifications: typeof notificationSeed;
  onBack: () => void;
  onMarkAllRead: () => void;
}) {
  const [tab, setTab] = useState("All");
  const visibleNotifications = tab === "Unread" ? notifications.filter((item) => !item.read) : notifications;

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <ScreenHeader
        title="Notifications"
        subtitle="Stay updated with your progress"
        onBack={onBack}
        rightAction={<TextLink label="Mark all read" onPress={onMarkAllRead} />}
      />

      <SegmentedControl options={["All", "Unread"]} value={tab} onChange={setTab} />

      <View style={commonStyles.stackMd}>
        {visibleNotifications.map((notification) => {
          const tint = notificationTint(notification.type);
          return (
            <AppCard key={notification.id} style={commonStyles.stackMd}>
              <View style={styles.notificationRow}>
                <View style={[styles.notificationIcon, { backgroundColor: tint.backgroundColor }]}>
                  <Ionicons name={tint.icon} size={18} color={tint.textColor} />
                </View>
                <View style={commonStyles.flexOne}>
                  <Text style={commonStyles.cardBodyStrong}>{notification.title}</Text>
                  <Text style={commonStyles.cardBody}>{notification.message}</Text>
                  <Text style={commonStyles.helperText}>{notification.time}</Text>
                </View>
                {!notification.read ? <View style={styles.unreadDot} /> : null}
              </View>
            </AppCard>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    gap: 16,
  },
  notificationRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  notificationIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.primary,
    marginTop: 6,
  },
});
