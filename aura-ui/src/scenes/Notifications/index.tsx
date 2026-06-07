import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppCard } from "../../components/AppCard";
import { ScreenHeader } from "../../components/ScreenHeader";
import { SegmentedControl } from "../../components/SegmentedControl";
import { TextLink } from "../../components/TextLink";
import { NotificationItem } from "../../constants/appData";
import { useTheme } from "../../theme/ThemeContext";
import { commonStyles } from "../../theme";

function notificationTint(type: string, colors: ReturnType<typeof useTheme>["colors"]) {
  switch (type) {
    case "achievement":
      return { backgroundColor: colors.chipYellow, textColor: colors.warning, icon: "trophy-outline" as const };
    case "task":
      return { backgroundColor: colors.chipBlue, textColor: colors.primary, icon: "checkbox-outline" as const };
    case "ai":
      return { backgroundColor: colors.chipPurple, textColor: colors.secondary, icon: "sparkles-outline" as const };
    default:
      return { backgroundColor: colors.chipGreen, textColor: colors.success, icon: "calendar-outline" as const };
  }
}

export function NotificationsScreen({
  notifications,
  onBack,
  onMarkAllRead,
  onRefresh,
}: {
  notifications: NotificationItem[];
  onBack: () => void;
  onMarkAllRead: () => void | Promise<void>;
  onRefresh?: () => void | Promise<void>;
}) {
  const { colors } = useTheme();
  const [tab, setTab] = useState("All");
  const visibleNotifications = tab === "Unread" ? notifications.filter((item) => !item.read) : notifications;

  useEffect(() => {
    void onRefresh?.();
  }, [onRefresh]);

  return (
    <ScrollView contentContainerStyle={[styles.screenContent, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Notifications"
        subtitle="Tasks, coach insights, and milestones"
        onBack={onBack}
        rightAction={<TextLink label="Mark all read" onPress={() => void onMarkAllRead()} />}
      />

      <SegmentedControl options={["All", "Unread"]} value={tab} onChange={setTab} />

      <View style={commonStyles.stackMd}>
        {visibleNotifications.length === 0 ? (
          <Text style={{ color: colors.muted, fontWeight: "600" }}>No notifications yet. Check back after logging in or completing tasks.</Text>
        ) : null}
        {visibleNotifications.map((notification) => {
          const tint = notificationTint(notification.type, colors);
          return (
            <AppCard key={notification.id} style={commonStyles.stackMd}>
              <View style={styles.notificationRow}>
                <View style={[styles.notificationIcon, { backgroundColor: tint.backgroundColor }]}>
                  <Ionicons name={tint.icon} size={18} color={tint.textColor} />
                </View>
                <View style={commonStyles.flexOne}>
                  <Text style={[commonStyles.cardBodyStrong, { color: colors.text }]}>{notification.title}</Text>
                  <Text style={[commonStyles.cardBody, { color: colors.muted }]}>{notification.message}</Text>
                  <Text style={[commonStyles.helperText, { color: colors.muted }]}>{notification.time}</Text>
                </View>
                {!notification.read ? <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} /> : null}
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
    marginTop: 6,
  },
});
