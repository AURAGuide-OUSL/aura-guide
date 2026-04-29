import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { palette, commonStyles } from "../../theme";
import { AppCard } from "../../components/AppCard";
import { ProgressBar } from "../../components/ProgressBar";
import { ScreenHeader } from "../../components/ScreenHeader";
import {
  technicalSkills,
  softSkills,
} from "../../../src-native/mockData";

export function GoalsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <ScreenHeader title="Goals & Progress" subtitle="Track your milestones and skill growth" />

      <View style={styles.statsRow}>
        {[
          { label: "Tasks Done", value: "12" },
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
});
