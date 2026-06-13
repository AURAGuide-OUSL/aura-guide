import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { commonStyles } from "../../theme";
import { AppCard } from "../../components/AppCard";
import { ScreenHeader } from "../../components/ScreenHeader";
import { useTheme } from "../../theme/ThemeContext";
import { termsIntroduction, termsSections, termsUpdatedSubtitle } from "./termsContent";

export function TermsScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        screenContent: {
          paddingHorizontal: 20,
          paddingTop: 18,
          paddingBottom: 24,
          gap: 16,
          backgroundColor: colors.background,
        },
        intro: {
          color: colors.text,
          lineHeight: 22,
          fontWeight: "600",
          marginBottom: 12,
          fontSize: 14,
        },
        termsTitle: {
          fontSize: 18,
          fontWeight: "800",
          color: colors.text,
          marginBottom: 4,
        },
        termsText: {
          color: colors.muted,
          lineHeight: 22,
          marginBottom: 8,
        },
      }),
    [colors],
  );

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <ScreenHeader title="Terms and Conditions" subtitle={termsUpdatedSubtitle} onBack={onBack} />

      <AppCard style={commonStyles.stackMd}>
        <Text style={styles.intro}>{termsIntroduction}</Text>
        {termsSections.map((section) => (
          <View key={section.title}>
            <Text style={styles.termsTitle}>{section.title}</Text>
            <Text style={styles.termsText}>{section.body}</Text>
          </View>
        ))}
      </AppCard>
    </ScrollView>
  );
}
