import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Calendar, ICalendarEventBase, Mode } from "react-native-big-calendar";

import { palette } from "../../theme";
import { useTheme } from "../../theme/ThemeContext";
import { ScreenHeader } from "../../components/ScreenHeader";
import { api } from "../../api/api";
import { screenPadding } from "../../styles/screenStyles";

export function CalendarScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const { height: windowH } = useWindowDimensions();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [mode, setMode] = useState<Mode>("month");
  /** Controls which period is visible (pager center). */
  const [focusDate, setFocusDate] = useState(() => new Date());
  /** Always “today” for highlighting the current calendar day / header accents. */
  const today = useMemo(() => new Date(), []);

  const load = useCallback(async () => {
    try {
      const data = await api.getTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      Alert.alert("Calendar load failed", (e as Error).message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const calendarEvents = useMemo(() => {
    return tasks
      .filter((task) => task.start_date_time && (task.status || "").toLowerCase() !== "completed")
      .map((task) => {
        const start = new Date(task.start_date_time);
        let end = task.end_date_time ? new Date(task.end_date_time) : new Date(start.getTime() + 60 * 60 * 1000);
        if (end.getTime() <= start.getTime()) {
          end = new Date(start.getTime() + 60 * 60 * 1000);
        }
        return {
          title: `Task · ${task.task}`,
          start,
          end,
          // Attach extra data for deletion
          id: task.id,
          origin: task.task_origin,
          taskName: task.task,
        };
      });
  }, [tasks]);

  const handleDeleteTask = (event: any) => {
    Alert.alert(
      "Delete Task",
      `Are you sure you want to delete "${event.taskName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.deleteTask(Number(event.id));
              load();
            } catch (e) {
              Alert.alert("Error", (e as Error).message);
            }
          },
        },
      ]
    );
  };

  const upcomingCount = tasks.filter((task) => (task.status || "").toLowerCase() !== "completed").length;
  const completedCount = tasks.filter((task) => (task.status || "").toLowerCase() === "completed").length;

  const navigate = (direction: -1 | 1) => {
    setFocusDate((prev) => {
      const d = new Date(prev);
      if (mode === "month") {
        d.setMonth(d.getMonth() + direction);
      } else if (mode === "week") {
        d.setDate(d.getDate() + direction * 7);
      } else {
        d.setDate(d.getDate() + direction);
      }
      return d;
    });
  };

  const goToday = () => setFocusDate(new Date());

  const rangeLabel = useMemo(() => {
    if (mode === "month") {
      return focusDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
    if (mode === "week") {
      const start = new Date(focusDate);
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
      return `${start.toLocaleDateString("en-US", opts)} — ${end.toLocaleDateString("en-US", {
        ...opts,
        year: "numeric",
      })}`;
    }
    return focusDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [focusDate, mode]);

  /** Reserve vertical space so week/day timelines are usable (not squeezed inside ScrollView). */
  const calendarBlockHeight = Math.max(340, Math.min(windowH - insets.top - insets.bottom - 220, 560));

  const calendarTheme = useMemo(
    () => ({
      palette: {
        primary: { main: colors.primary, contrastText: "#FFFFFF" },
        nowIndicator: colors.secondary,
        gray: {
          100: isDark ? colors.backgroundAccent : "#F1F5F9",
          200: isDark ? colors.border : "#E2E8F0",
          300: isDark ? colors.surfaceMuted : "#CBD5E1",
          500: colors.muted,
          800: colors.text,
        },
        moreLabel: colors.muted,
      },
      isRTL: false,
      typography: {
        xs: { fontSize: 10, color: colors.text },
        sm: { fontSize: 12, color: colors.text },
        xl: { fontSize: 13, color: colors.text },
        moreLabel: { fontSize: 11, color: colors.muted },
      },
      eventCellOverlappings: [
        { main: "#4F46E5", contrastText: "#FFFFFF" },
        { main: "#0891B2", contrastText: "#FFFFFF" },
        { main: "#059669", contrastText: "#FFFFFF" },
      ] as const,
      moreLabel: { color: colors.muted },
    }),
    [colors, isDark],
  );

  const onSwipeDateChange = useCallback((range: Date[]) => {
    if (range?.[0]) {
      setFocusDate(new Date(range[0]));
    }
  }, []);

  return (
    <GestureHandlerRootView style={[styles.flexOne, { paddingBottom: Math.max(insets.bottom, 8), backgroundColor: colors.background }]}>
      <View style={[styles.flexOne, styles.screenPad]}>
        <ScreenHeader title="Calendar" subtitle="Tasks on your timeline" onBack={onBack} />

        <View style={styles.modeRow}>
          {(["month", "week", "day"] as Mode[]).map((m) => (
            <Pressable
              key={m}
              onPress={() => {
                setMode(m);
                setFocusDate(new Date());
              }}
              style={[styles.modeChip, mode === m && styles.modeChipActive]}
            >
              <Text style={[styles.modeChipText, mode === m && styles.modeChipTextActive]}>{m[0].toUpperCase() + m.slice(1)}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.navCard}>
          <Pressable accessibilityLabel="Previous" onPress={() => navigate(-1)} style={styles.navCircle}>
            <Ionicons name="chevron-back" size={22} color={colors.primary} />
          </Pressable>
          <Text style={styles.navLabel} numberOfLines={2}>{rangeLabel}</Text>
          <Pressable accessibilityLabel="Next" onPress={() => navigate(1)} style={styles.navCircle}>
            <Ionicons name="chevron-forward" size={22} color={colors.primary} />
          </Pressable>
          <Pressable onPress={goToday} style={styles.todayChip}>
            <Text style={styles.todayChipText}>Today</Text>
          </Pressable>
        </View>

        <View style={[styles.calendarShell, { minHeight: calendarBlockHeight, backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Calendar
            key={`${mode}-${focusDate.toDateString()}-${isDark ? "dark" : "light"}`}
            theme={calendarTheme as any}
            events={calendarEvents}
            height={calendarBlockHeight}
            mode={mode}
            date={focusDate}
            activeDate={today}
            swipeEnabled
            showTime={mode !== "month"}
            weekStartsOn={1}
            minHour={6}
            maxHour={23}
            hourRowHeight={48}
            verticalScrollEnabled
            dayHeaderHighlightColor="rgba(79, 70, 229, 0.45)"
            weekDayHeaderHighlightColor="rgba(37, 99, 235, 0.2)"
            calendarCellTextStyle={() => ({ color: colors.text })}
            onChangeDate={onSwipeDateChange}
            onPressEvent={handleDeleteTask}
            calendarCellStyle={(date?: Date) => {
              if (!date) return {};
              const a = date;
              const t = today;
              const sameDay =
                a.getFullYear() === t.getFullYear() &&
                a.getMonth() === t.getMonth() &&
                a.getDate() === t.getDate();
              if (!sameDay) return {};
              return {
                backgroundColor: "rgba(129, 140, 248, 0.18)",
                borderRadius: mode === "month" ? 10 : 8,
              };
            }}
          />
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{upcomingCount}</Text>
            <Text style={styles.summaryCaption}>Active</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{completedCount}</Text>
            <Text style={styles.summaryCaption}>Completed</Text>
          </View>
          <Pressable onPress={load} style={styles.refreshFab}>
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const createStyles = (colors: typeof palette, isDark: boolean) =>
  StyleSheet.create({
  flexOne: { flex: 1 },
  screenPad: {
    paddingHorizontal: screenPadding,
    paddingTop: 8,
  },
  modeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  modeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modeChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  modeChipTextActive: {
    color: "#FFFFFF",
  },
  navCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  navCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.chipBlue,
  },
  navLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },
  todayChip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: isDark ? colors.primary : colors.text,
  },
  todayChipText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },
  calendarShell: {
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryValue: { fontSize: 26, fontWeight: "900", color: colors.primary },
  summaryCaption: { marginTop: 4, fontSize: 13, fontWeight: "600", color: colors.muted },
  summaryDivider: { width: 1, height: 40, backgroundColor: colors.border },
  refreshFab: {
    marginLeft: 8,
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
});
