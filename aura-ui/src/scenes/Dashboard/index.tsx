import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { palette, commonStyles } from "../../theme";
import { AppCard } from "../../components/AppCard";
import { Badge } from "../../components/Badge";
import { ProgressBar } from "../../components/ProgressBar";
import { ScreenHeader } from "../../components/ScreenHeader";
import { TextLink } from "../../components/TextLink";
import { UserProfile, Route } from "../../types";
import {
  dashboardStats,
  todayPlan,
  recommendations,
} from "../../../src-native/mockData";
import { api } from "../../api/api";

function formatToday() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function getPriorityColors(priority: "High" | "Medium" | "Low") {
  switch (priority) {
    case "High":
      return { backgroundColor: "#FEE2E2", textColor: palette.danger };
    case "Medium":
      return { backgroundColor: palette.chipYellow, textColor: palette.warning };
    default:
      return { backgroundColor: palette.chipGreen, textColor: palette.success };
  }
}

function getCategoryColor(category: string) {
  if (category === "Technical") {
    return { backgroundColor: palette.chipPurple, textColor: palette.secondary };
  }
  if (category === "Academic") {
    return { backgroundColor: palette.chipBlue, textColor: palette.primary };
  }
  if (category === "Soft Skills") {
    return { backgroundColor: "#FCE7F3", textColor: "#BE185D" };
  }
  return { backgroundColor: palette.surfaceMuted, textColor: palette.muted };
}

export function DashboardScreen({
  user,
  onNavigate,
  onSignOut,
}: {
  user: UserProfile;
  onNavigate: (route: Route) => void;
  onSignOut: () => void;
}) {
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    api.getTasks().then(setTasks).catch(() => undefined);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <ScreenHeader
        title={`Welcome back, ${user.firstName}!`}
        subtitle={formatToday()}
        rightAction={
          <View style={styles.headerActions}>
            <Pressable onPress={() => onNavigate("notifications")} style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={20} color={palette.text} />
            </Pressable>
            <Pressable onPress={onSignOut} style={styles.iconButton}>
              <Ionicons name="log-out-outline" size={20} color={palette.text} />
            </Pressable>
          </View>
        }
      />

      <View style={styles.statsRow}>
        {dashboardStats.filter((item) => item.label !== "Active Goals").map((item) => (
          <AppCard key={item.label} style={styles.metricCard}>
            <Ionicons name={item.icon as any} size={24} color={item.color} />
            <Text style={styles.metricValue}>{item.value}</Text>
            <Text style={styles.metricLabel}>{item.label}</Text>
          </AppCard>
        ))}
      </View>

      <View style={commonStyles.stackMd}>
        <AppCard style={commonStyles.stackSm}>
          <Text style={styles.sectionTitle}>Current career goal</Text>
          <Text style={commonStyles.cardBodyStrong}>{user.goal}</Text>
        </AppCard>

        <AppCard style={styles.primaryBanner}>
          <Text style={styles.bannerEyebrow}>AURA says...</Text>
          <Text style={styles.bannerBody}>
            Keep up the momentum. Your technical skills improved this week, so today is a good day to push on a more
            challenging problem.
          </Text>
        </AppCard>

        <AppCard style={commonStyles.stackMd}>
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionTitle}>Quick actions</Text>
          </View>
          <View style={commonStyles.stackSm}>
            <Pressable style={styles.quickAction} onPress={() => onNavigate("calendar")}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="calendar-outline" size={18} color={palette.primary} />
              </View>
              <View style={commonStyles.flexOne}>
                <Text style={styles.quickActionTitle}>Calendar</Text>
                <Text style={styles.quickActionSubtitle}>View your schedule and upcoming events</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={palette.muted} />
            </Pressable>

            <Pressable style={styles.quickAction} onPress={() => onNavigate("careerTrack")}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="rocket-outline" size={18} color={palette.primary} />
              </View>
              <View style={commonStyles.flexOne}>
                <Text style={styles.quickActionTitle}>Career track plan</Text>
                <Text style={styles.quickActionSubtitle}>Review your personalized roadmap</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={palette.muted} />
            </Pressable>
            <View style={styles.quickButtonRow}>
              <Pressable style={styles.quickButton} onPress={() => onNavigate("aiCoach")}>
                <Text style={styles.quickButtonText}>Go to Chat</Text>
              </Pressable>
              <Pressable style={styles.quickButton} onPress={() => onNavigate("tasks")}>
                <Text style={styles.quickButtonText}>View Tasks</Text>
              </Pressable>
            </View>
          </View>
        </AppCard>

        <AppCard style={commonStyles.stackMd}>
          <Text style={styles.sectionTitle}>AURA recommendations</Text>
          <Text style={commonStyles.cardBodyStrong}>{recommendations[0]?.title}</Text>
          <Text style={commonStyles.cardBody}>{recommendations[0]?.reason}</Text>
        </AppCard>

        <AppCard style={commonStyles.stackMd}>
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionTitle}>Today's plan</Text>
            <TextLink label="See calendar" onPress={() => onNavigate("calendar")} />
          </View>
          <View style={commonStyles.stackSm}>
            {todayPlan.map((item) => (
              <View key={`${item.time}-${item.task}`} style={styles.timelineRow}>
                <View style={[styles.timelineDot, item.completed ? styles.timelineDotDone : undefined]} />
                <View style={commonStyles.flexOne}>
                  <Text style={[styles.timelineTask, item.completed ? styles.timelineTaskDone : undefined]}>{item.task}</Text>
                  <Text style={styles.timelineTime}>{item.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </AppCard>

        <View style={styles.sectionHeadingRow}>
          <Text style={styles.sectionTitle}>Ongoing tasks</Text>
          <TextLink label="Open planner" onPress={() => onNavigate("tasks")} />
        </View>

        {tasks.slice(0, 5).map((task) => {
          const priority = getPriorityColors(task.priority as any);
          const category = getCategoryColor(task.category || "Technical");

          return (
            <AppCard key={task.id} style={commonStyles.stackMd}>
              <View style={styles.cardHeaderSpace}>
                <View style={commonStyles.flexOne}>
                  <Text style={commonStyles.cardTitle}>{task.task}</Text>
                  <Text style={commonStyles.cardBody}>{task.status}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={palette.muted} />
              </View>

              <View style={commonStyles.badgeRow}>
                <Badge label={task.category || "Technical"} backgroundColor={category.backgroundColor} textColor={category.textColor} />
                <Badge label={task.priority || "Medium"} backgroundColor={priority.backgroundColor} textColor={priority.textColor} />
              </View>

              <View style={commonStyles.progressSummaryRow}>
                <Text style={commonStyles.helperText}>{task.status}</Text>
                <Text style={commonStyles.helperText}>{(task.end_date_time || task.start_date_time || "").slice(0, 10)}</Text>
              </View>
              <ProgressBar value={task.status === "completed" ? 100 : task.status === "in_progress" ? 60 : 15} />
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
  headerActions: {
    flexDirection: "row",
    gap: 8,
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
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: 100,
    alignItems: "center",
    gap: 6,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "800",
    color: palette.text,
  },
  metricLabel: {
    textAlign: "center",
    color: palette.muted,
    fontSize: 12,
  },
  primaryBanner: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
    gap: 8,
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },
  bannerEyebrow: {
    color: "#BFDBFE",
    fontWeight: "700",
    textTransform: "uppercase",
    fontSize: 12,
    letterSpacing: 0.8,
  },
  bannerBody: {
    color: palette.surface,
    lineHeight: 22,
    fontSize: 16,
  },
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: palette.text,
  },
  quickAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#F8FBFF",
    borderWidth: 1,
    borderColor: palette.border,
  },
  quickActionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: palette.chipBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionTitle: {
    fontWeight: "700",
    color: palette.text,
  },
  quickActionSubtitle: {
    color: palette.muted,
    marginTop: 2,
  },
  quickButtonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  quickButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: palette.primary,
  },
  quickButtonText: {
    color: palette.surface,
    fontWeight: "700",
  },
  timelineRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 5,
    backgroundColor: "#CBD5E1",
  },
  timelineDotDone: {
    backgroundColor: palette.success,
  },
  timelineTask: {
    fontWeight: "700",
    color: palette.text,
  },
  timelineTaskDone: {
    color: palette.muted,
    textDecorationLine: "line-through",
  },
  timelineTime: {
    marginTop: 2,
    color: palette.muted,
  },
  cardHeaderSpace: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
});
