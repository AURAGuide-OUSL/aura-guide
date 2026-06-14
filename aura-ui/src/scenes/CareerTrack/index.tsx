import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { palette, commonStyles } from "../../theme";
import { AppCard } from "../../components/AppCard";
import { ScreenHeader } from "../../components/ScreenHeader";
import { ProgressBar } from "../../components/ProgressBar";
import { api } from "../../api/api";
import { useScreenScrollStyle } from "../../styles/screenStyles";
import { useTextColors } from "../../theme/themedHelpers";

type SkillRow = {
  skill_id: number;
  skill_name: string;
  category_name: string;
  required_level: string;
  current_level: string;
  required_pct: number;
  current_pct: number;
};

type TrackStep = {
  id: number;
  title: string;
  period: string;
  status: "Completed" | "In Progress" | "Upcoming";
  progress: number;
};

function skillStatus(skill: SkillRow): TrackStep["status"] {
  if (skill.current_pct >= skill.required_pct && skill.required_pct > 0) return "Completed";
  if (skill.current_pct > 0) return "In Progress";
  return "Upcoming";
}

function buildTrackSteps(skills: SkillRow[]): TrackStep[] {
  const ordered = [...skills].sort((a, b) => {
    const rank = (s: SkillRow) => {
      const st = skillStatus(s);
      if (st === "In Progress") return 0;
      if (st === "Upcoming") return 1;
      return 2;
    };
    const diff = rank(a) - rank(b);
    if (diff !== 0) return diff;
    return a.skill_name.localeCompare(b.skill_name);
  });

  return ordered.map((skill) => ({
    id: skill.skill_id,
    title: skill.skill_name,
    period: `${skill.category_name || "Skill"} · ${skill.current_level || "—"} → ${skill.required_level || "Target"}`,
    status: skillStatus(skill),
    progress: Math.min(100, Math.max(0, skill.current_pct)),
  }));
}

export function CareerTrackScreen({ onBack }: { onBack: () => void }) {
  const scrollStyle = useScreenScrollStyle();
  const tc = useTextColors();
  const [loading, setLoading] = useState(true);
  const [careerTitle, setCareerTitle] = useState("");
  const [readiness, setReadiness] = useState("");
  const [scorePercent, setScorePercent] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [steps, setSteps] = useState<TrackStep[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [summary, path] = await Promise.all([
          api.getGoalSummary().catch(() => null),
          api.getCareerPath().catch(() => null),
        ]);
        if (cancelled) return;
        const skills = Array.isArray(summary?.skills) ? (summary.skills as SkillRow[]) : [];
        setCareerTitle(
          summary?.career_title ||
            path?.career_path ||
            "Your career track",
        );
        setReadiness(summary?.skill_readiness_label || "");
        setScorePercent(Number(summary?.aura_score_percent) || 0);
        setCompletedTasks(Number(summary?.completed_tasks) || 0);
        setSteps(buildTrackSteps(skills));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeStepId = useMemo(
    () => steps.find((s) => s.status === "In Progress")?.id ?? null,
    [steps],
  );

  return (
    <ScrollView contentContainerStyle={scrollStyle} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Career Track" subtitle="Your personalized growth roadmap" onBack={onBack} />

      <AppCard style={styles.heroCard}>
        <View style={styles.heroRow}>
          <View style={styles.heroIcon}>
            <Ionicons name="map-outline" size={22} color="#FFFFFF" />
          </View>
          <View style={commonStyles.flexOne}>
            <Text style={[styles.heroEyebrow, tc.muted]}>Current track</Text>
            <Text style={[styles.heroTitle, tc.text]} numberOfLines={2}>
              {careerTitle}
            </Text>
          </View>
        </View>
        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{scorePercent}%</Text>
            <Text style={[styles.heroStatLabel, tc.muted]}>AURA score</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={[styles.heroStatValue, { color: palette.primary }]}>{completedTasks}</Text>
            <Text style={[styles.heroStatLabel, tc.muted]}>Tasks done</Text>
          </View>
          {readiness ? (
            <>
              <View style={styles.heroStatDivider} />
              <View style={[styles.heroStat, commonStyles.flexOne]}>
                <Text style={[styles.heroStatValueSmall, tc.text]} numberOfLines={1}>
                  {readiness}
                </Text>
                <Text style={[styles.heroStatLabel, tc.muted]}>Readiness</Text>
              </View>
            </>
          ) : null}
        </View>
      </AppCard>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text style={[styles.loadingText, tc.muted]}>Loading your roadmap…</Text>
        </View>
      ) : steps.length === 0 ? (
        <AppCard style={styles.emptyCard}>
          <Ionicons name="trail-sign-outline" size={40} color={palette.muted} />
          <Text style={[styles.emptyTitle, tc.text]}>No skill milestones yet</Text>
          <Text style={[styles.emptyBody, tc.muted]}>
            Complete onboarding and open Goals to start building your track from live skill progress.
          </Text>
        </AppCard>
      ) : (
        <View style={commonStyles.stackMd}>
          {steps.map((step, idx) => {
            const isActive = step.id === activeStepId || step.status === "In Progress";
            return (
              <View key={step.id} style={styles.roadmapStepRow}>
                <View style={styles.roadmapIndicator}>
                  <View
                    style={[
                      styles.roadmapDot,
                      step.status === "In Progress"
                        ? { backgroundColor: palette.primary }
                        : step.status === "Completed"
                          ? { backgroundColor: palette.success }
                          : { backgroundColor: palette.border },
                    ]}
                  >
                    {step.status === "In Progress" ? (
                      <Ionicons name="radio-button-on" size={14} color={palette.surface} />
                    ) : step.status === "Completed" ? (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    ) : null}
                  </View>
                  {idx < steps.length - 1 ? <View style={styles.roadmapLine} /> : null}
                </View>
                <AppCard style={[commonStyles.flexOne, isActive && styles.activeCard]}>
                  <Text
                    style={[
                      commonStyles.cardTitle,
                      step.status === "Upcoming" ? { color: palette.muted } : undefined,
                    ]}
                  >
                    {step.title}
                  </Text>
                  <Text style={commonStyles.cardBody}>{step.period}</Text>
                  <View style={styles.progressWrap}>
                    <ProgressBar value={step.progress} color={isActive ? palette.primary : palette.accent} />
                    <Text style={[styles.progressCaption, tc.muted]}>{step.progress}% toward target</Text>
                  </View>
                  {step.status === "In Progress" ? (
                    <View style={[styles.activeTag, { backgroundColor: palette.chipBlue }]}>
                      <Text style={[styles.activeTagText, { color: palette.primary }]}>Active now</Text>
                    </View>
                  ) : step.status === "Completed" ? (
                    <View style={[styles.activeTag, { backgroundColor: palette.chipGreen }]}>
                      <Text style={[styles.activeTagText, { color: palette.accent }]}>Completed</Text>
                    </View>
                  ) : null}
                </AppCard>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    marginBottom: 16,
    gap: 14,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginTop: 2,
    letterSpacing: -0.3,
  },
  heroStats: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 4,
  },
  heroStat: {
    alignItems: "center",
    minWidth: 72,
  },
  heroStatValue: {
    fontSize: 22,
    fontWeight: "900",
    color: palette.text,
  },
  heroStatValueSmall: {
    fontSize: 14,
    fontWeight: "800",
  },
  heroStatLabel: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "600",
  },
  heroStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: palette.border,
    marginHorizontal: 12,
  },
  loadingWrap: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyCard: {
    alignItems: "center",
    padding: 28,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
  emptyBody: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
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
    backgroundColor: palette.border,
    marginVertical: -2,
  },
  activeCard: {
    borderColor: palette.primary,
    borderWidth: 1,
  },
  progressWrap: {
    marginTop: 12,
    gap: 6,
  },
  progressCaption: {
    fontSize: 12,
    fontWeight: "600",
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
