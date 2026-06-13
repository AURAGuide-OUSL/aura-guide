import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { palette, commonStyles } from "../../theme";
import { AppCard } from "../../components/AppCard";
import { ScreenHeader } from "../../components/ScreenHeader";
import { calendarEvents } from "../../../src-native/mockData";

export function CalendarScreen({ onBack }: { onBack: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <ScreenHeader title="Calendar" subtitle="Schedule and upcoming track events" onBack={onBack} />

      <AppCard style={commonStyles.stackMd}>
        <View style={styles.calendarGrid}>
          {Array.from({ length: 31 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.calendarDay,
                i === 14 ? { backgroundColor: palette.primary, borderColor: palette.primary } : undefined,
              ]}
            >
              <Text style={{ color: i === 14 ? palette.surface : palette.text, fontWeight: "700" }}>{i + 1}</Text>
            </View>
          ))}
        </View>
      </AppCard>

      <View style={commonStyles.stackMd}>
        {calendarEvents.map((event: { id: React.Key | null | undefined; month: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; day: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; title: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; time: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }) => (
          <AppCard key={event.id} style={styles.eventRow}>
            <View style={styles.eventTimeBox}>
              <Text style={styles.eventMonth}>{event.month}</Text>
              <Text style={styles.eventDay}>{event.day}</Text>
            </View>
            <View style={commonStyles.flexOne}>
              <Text style={commonStyles.cardBodyStrong}>{event.title}</Text>
              <View style={styles.eventMeta}>
                <Ionicons name="time-outline" size={14} color={palette.muted} />
                <Text style={commonStyles.helperText}>{event.time}</Text>
              </View>
            </View>
          </AppCard>
        ))}
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
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  calendarDay: {
    width: "13.5%",
    aspectRatio: 1,
    minWidth: 42,
    borderRadius: 14,
    backgroundColor: "#F8FBFF",
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: "center",
    justifyContent: "center",
  },
  eventRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  eventTimeBox: {
    width: 52,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 12,
    backgroundColor: palette.surfaceMuted,
  },
  eventMonth: {
    fontSize: 10,
    fontWeight: "800",
    color: palette.primary,
    textTransform: "uppercase",
  },
  eventDay: {
    fontSize: 20,
    fontWeight: "800",
    color: palette.text,
  },
  eventMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
});
