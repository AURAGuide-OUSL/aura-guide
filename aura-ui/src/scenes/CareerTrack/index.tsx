import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppCard } from "../../components/AppCard";
import { ScreenHeader } from "../../components/ScreenHeader";
import { careerPhases } from "../../constants/appData";
import { api } from "../../api/api";
import { UserProfile } from "../../types";
import { useTheme } from "../../theme/ThemeContext";
import { commonStyles } from "../../theme";

export function CareerTrackScreen({ onBack, user }: { onBack: () => void; user: UserProfile }) {
  const { colors } = useTheme();
  const [summary, setSummary] = useState<any>(null);
  const [recommendation, setRecommendation] = useState(user.recommendation || "");

  useEffect(() => {
    api.getGoalSummary().then(setSummary).catch(() => setSummary(null));
    api.getUserProfile().then((p) => setRecommendation(p.recommendation || "")).catch(() => {});
  }, [user.email]);

  const readiness = summary?.skill_readiness_label || user.skillReadinessLabel || "";
  const industryReady = readiness.toLowerCase().includes("industry");
  const trackTitle = summary?.career_title || user.goal || "Your career track";

  const phases = useMemo(() => {
    const pct = typeof summary?.aura_score_percent === "number" ? summary.aura_score_percent : user.currentScore || 0;
    return careerPhases.map((step, idx) => {
      if (idx === 0) return { ...step, status: pct > 20 ? "Complete" : "In Progress" as const };
      if (idx === 1) return { ...step, status: pct >= 50 ? "In Progress" : "Upcoming" as const, progress: Math.min(pct, 100) };
      if (idx === 2) return { ...step, status: industryReady ? "In Progress" : "Upcoming" as const, progress: industryReady ? 100 : 0 };
      return { ...step, status: industryReady ? "Upcoming" as const : "Upcoming" as const };
    });
  }, [summary, user.currentScore, industryReady]);

  return (
    <ScrollView contentContainerStyle={[styles.screenContent, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Career Track" subtitle="Your personalized growth roadmap" onBack={onBack} />

      <AppCard>
        <Text style={[styles.trackLabel, { color: colors.muted }]}>Selected track</Text>
        <Text style={[styles.trackTitle, { color: colors.text }]}>{trackTitle}</Text>
        <Text style={[styles.trackMeta, { color: colors.muted }]}>Readiness: {readiness || "Not assessed yet"}</Text>
      </AppCard>

      {industryReady && recommendation ? (
        <AppCard style={{ borderLeftWidth: 4, borderLeftColor: colors.success }}>
          <Text style={[styles.recTitle, { color: colors.text }]}>Recommended career path</Text>
          <Text style={[styles.recBody, { color: colors.muted }]}>{recommendation}</Text>
        </AppCard>
      ) : null}

      <View style={commonStyles.stackMd}>
        {phases.map((step, idx) => (
          <View key={step.id} style={styles.roadmapStepRow}>
            <View style={styles.roadmapIndicator}>
              <View
                style={[
                  styles.roadmapDot,
                  { backgroundColor: colors.border },
                  step.status === "In Progress" ? { backgroundColor: colors.primary } : undefined,
                  step.status === "Complete" ? { backgroundColor: colors.success } : undefined,
                ]}
              >
                {step.status === "In Progress" ? (
                  <Ionicons name="radio-button-on" size={14} color={colors.surface} />
                ) : null}
              </View>
              {idx < phases.length - 1 ? <View style={[styles.roadmapLine, { backgroundColor: colors.border }]} /> : null}
            </View>
            <AppCard style={commonStyles.flexOne}>
              <Text style={[styles.phaseTitle, { color: step.status === "Upcoming" ? colors.muted : colors.text }]}>
                {step.title}
              </Text>
              <Text style={{ color: colors.muted }}>{step.period}</Text>
              {step.status === "In Progress" ? (
                <View style={[styles.activeTag, { backgroundColor: colors.chipBlue }]}>
                  <Text style={[styles.activeTagText, { color: colors.primary }]}>Active Now</Text>
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
  trackLabel: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  trackTitle: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 6,
  },
  trackMeta: {
    marginTop: 6,
    fontWeight: "600",
  },
  recTitle: {
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 8,
  },
  recBody: {
    lineHeight: 22,
    fontWeight: "600",
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
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  roadmapLine: {
    width: 2,
    flex: 1,
    marginVertical: -2,
  },
  phaseTitle: {
    fontSize: 17,
    fontWeight: "800",
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
