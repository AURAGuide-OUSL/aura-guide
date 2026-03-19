import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { palette, commonStyles } from "../../theme";
import { AppCard } from "../../components/AppCard";
import { Badge } from "../../components/Badge";
import { ProgressBar } from "../../components/ProgressBar";
import { ScreenHeader } from "../../components/ScreenHeader";
import { SegmentedControl } from "../../components/SegmentedControl";
import { PrimaryButton } from "../../components/PrimaryButton";
import {
  ongoingTasks,
  completedTasks,
} from "../../../src-native/mockData";

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

export function TasksScreen({ onNavigateCalendar }: { onNavigateCalendar: () => void }) {
  const [viewMode, setViewMode] = useState("List");
  const [listTab, setListTab] = useState("Today");

  const todayTasks = ongoingTasks.filter((task) => task.status === "In Progress");
  const upcomingTasks = ongoingTasks.filter((task) => task.status !== "In Progress");
  const completed = completedTasks;

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <ScreenHeader
        title="Tasks & Planner"
        subtitle="Manage your daily execution"
        rightAction={
          <Pressable onPress={onNavigateCalendar} style={styles.iconButton}>
            <Ionicons name="calendar-outline" size={20} color={palette.text} />
          </Pressable>
        }
      />

      <SegmentedControl options={["List", "Board"]} value={viewMode} onChange={setViewMode} />

      {viewMode === "List" ? (
        <>
          <SegmentedControl options={["Today", "Upcoming", "Completed"]} value={listTab} onChange={setListTab} />

          <View style={commonStyles.stackMd}>
            {(listTab === "Today" ? todayTasks : listTab === "Upcoming" ? upcomingTasks : completed).map((task) => {
              const priority = getPriorityColors(task.priority as any);
              const category = getCategoryColor(task.category);

              return (
                <AppCard key={task.id} style={commonStyles.stackMd}>
                  <View style={styles.cardHeaderSpace}>
                    <View style={commonStyles.flexOne}>
                      <Text style={commonStyles.cardTitle}>{task.title}</Text>
                      {task.description ? <Text style={commonStyles.cardBody}>{task.description}</Text> : null}
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={palette.muted} />
                  </View>

                  <View style={commonStyles.badgeRow}>
                    <Badge label={task.category} backgroundColor={category.backgroundColor} textColor={category.textColor} />
                    <Badge label={task.priority} backgroundColor={priority.backgroundColor} textColor={priority.textColor} />
                  </View>

                  <View style={commonStyles.progressSummaryRow}>
                    <Text style={commonStyles.helperText}>{task.status}</Text>
                    <Text style={commonStyles.helperText}>{task.dueLabel}</Text>
                  </View>
                  <ProgressBar value={task.progress} />
                </AppCard>
              );
            })}
          </View>
        </>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.boardRow}>
            {[
              { title: "To Do", items: upcomingTasks },
              { title: "In Progress", items: todayTasks },
              { title: "Done", items: completed },
            ].map((column) => (
              <View key={column.title} style={styles.boardColumn}>
                <Text style={styles.boardTitle}>{column.title}</Text>
                <View style={commonStyles.stackSm}>
                  {column.items.map((task) => (
                    <AppCard key={task.id} style={styles.boardCard}>
                      <Text style={commonStyles.cardTitle}>{task.title}</Text>
                      <Text style={commonStyles.cardBody}>{task.dueLabel}</Text>
                    </AppCard>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <PrimaryButton label="Add New Task" onPress={() => undefined} />
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
  cardHeaderSpace: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  boardRow: {
    flexDirection: "row",
    gap: 14,
    paddingVertical: 6,
  },
  boardColumn: {
    width: 230,
    gap: 10,
  },
  boardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: palette.text,
  },
  boardCard: {
    gap: 6,
  },
});
