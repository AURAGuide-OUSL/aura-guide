import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { palette, commonStyles } from "../../theme";
import { AppCard } from "../../components/AppCard";
import { ScreenHeader } from "../../components/ScreenHeader";
import { roadmapSteps } from "../../../src-native/mockData";

export function CareerTrackScreen({ onBack }: { onBack: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <ScreenHeader title="Career Track" subtitle="Your personalized growth roadmap" onBack={onBack} />

      <View style={commonStyles.stackMd}>
        {roadmapSteps.map((step, idx) => (
          <View key={step.id} style={styles.roadmapStepRow}>
            <View style={styles.roadmapIndicator}>
              <View
                style={[
                  styles.roadmapDot,
                  step.status === "completed"
                    ? { backgroundColor: palette.success }
                    : step.status === "active"
                    ? { backgroundColor: palette.primary }
                    : undefined,
                ]}
              >
                {step.status === "completed" ? (
                  <Ionicons name="checkmark" size={14} color={palette.surface} />
                ) : step.status === "active" ? (
                  <Ionicons name="radio-button-on" size={14} color={palette.surface} />
                ) : null}
              </View>
              {idx < roadmapSteps.length - 1 ? <View style={styles.roadmapLine} /> : null}
            </View>
            <AppCard style={commonStyles.flexOne}>
              <Text
                style={[
                  commonStyles.cardTitle,
                  step.status === "completed" ? { color: palette.muted, textDecorationLine: "line-through" } : undefined,
                ]}
              >
                {step.title}
              </Text>
              <Text style={commonStyles.cardBody}>{step.description}</Text>
              {step.status === "active" ? (
                <View style={[styles.activeTag, { backgroundColor: palette.chipBlue }]}>
                  <Text style={[styles.activeTagText, { color: palette.primary }]}>Active Now</Text>
                </View>
              ) : null}
            </AppCard>
          </View>
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
  roadmapStepRow: {
    flexDirection: "row",
    gap: 14,
  },
  roadmapIndicator: {
    alignItems: "center",
    width: 24,
  },
  roadmapDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: palette.border,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  roadmapLine: {
    width: 2,
    flex: 1,
    backgroundColor: palette.border,
    marginVertical: -2,
  },
  activeTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 10,
  },
  activeTagText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
