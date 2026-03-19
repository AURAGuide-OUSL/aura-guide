import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { palette, commonStyles } from "../../theme";
import { AppCard } from "../../components/AppCard";
import { Badge } from "../../components/Badge";
import { ProgressBar } from "../../components/ProgressBar";
import { ScreenHeader } from "../../components/ScreenHeader";
import {
  technicalSkills,
  softSkills,
  goals,
} from "../../../src-native/mockData";

export function GoalsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <ScreenHeader title="Goals & Progress" subtitle="Track your milestones and skill growth" />

      <View style={styles.statsRow}>
        {[
          { label: "Tasks Done", value: "12" },
          { label: "Hours", value: "24h" },
          { label: "Skills", value: "3" },
          { label: "Streak", value: "14" },
        ].map((item) => (
          <AppCard key={item.label} style={styles.smallMetricCard}>
            <Text style={styles.smallMetricValue}>{item.value}</Text>
            <Text style={styles.smallMetricLabel}>{item.label}</Text>
          </AppCard>
        ))}
      </View>

      <AppCard style={commonStyles.stackMd}>
        <Text style={styles.sectionTitle}>Technical skills</Text>
        <View style={commonStyles.stackMd}>
          {technicalSkills.map((skill) => (
            <View key={skill.name} style={commonStyles.stackXs}>
              <View style={commonStyles.progressSummaryRow}>
                <Text style={commonStyles.cardBodyStrong}>{skill.name}</Text>
                <Text style={commonStyles.helperText}>{skill.level}%</Text>
              </View>
              <ProgressBar value={skill.level} />
            </View>
          ))}
        </View>
      </AppCard>

      <AppCard style={commonStyles.stackMd}>
        <Text style={styles.sectionTitle}>Soft skills</Text>
        <View style={commonStyles.stackMd}>
          {softSkills.map((skill) => (
            <View key={skill.name} style={commonStyles.stackXs}>
              <View style={commonStyles.progressSummaryRow}>
                <Text style={commonStyles.cardBodyStrong}>{skill.name}</Text>
                <Text style={commonStyles.helperText}>{skill.level}%</Text>
              </View>
              <ProgressBar value={skill.level} color={palette.secondary} />
            </View>
          ))}
        </View>
      </AppCard>

      <View style={commonStyles.stackMd}>
        {goals.map((goal) => (
          <AppCard key={goal.id} style={commonStyles.stackMd}>
            <Text style={commonStyles.cardTitle}>{goal.title}</Text>
            <Text style={commonStyles.cardBody}>
              {goal.current} of {goal.target}. Deadline: {goal.deadline}.
            </Text>
            <View style={commonStyles.badgeRow}>
              <Badge label={goal.category} backgroundColor={palette.chipBlue} textColor={palette.primary} />
            </View>
            <View style={commonStyles.progressSummaryRow}>
              <Text style={commonStyles.helperText}>Progress</Text>
              <Text style={commonStyles.helperText}>{goal.progress}%</Text>
            </View>
            <ProgressBar value={goal.progress} />

            <View style={commonStyles.stackXs}>
              {goal.milestones.map((milestone) => (
                <View key={milestone.name} style={styles.milestoneRow}>
                  <Ionicons
                    name={milestone.completed ? "checkmark-circle" : "ellipse-outline"}
                    size={18}
                    color={milestone.completed ? palette.success : palette.muted}
                  />
                  <Text style={commonStyles.cardBodyStrong}>{milestone.name}</Text>
                </View>
              ))}
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
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  smallMetricCard: {
    minWidth: 74,
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  smallMetricValue: {
    fontSize: 20,
    fontWeight: "800",
    color: palette.primary,
  },
  smallMetricLabel: {
    fontSize: 12,
    color: palette.muted,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: palette.text,
  },
  milestoneRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
});
