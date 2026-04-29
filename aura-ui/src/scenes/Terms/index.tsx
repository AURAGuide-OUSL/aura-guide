import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { palette, commonStyles } from "../../theme";
import { AppCard } from "../../components/AppCard";
import { ScreenHeader } from "../../components/ScreenHeader";
import { termsSections } from "../../../src-native/mockData";

export function TermsScreen({ onBack }: { onBack: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <ScreenHeader title="Terms & Conditions" subtitle="Last updated April 2026" onBack={onBack} />

      <AppCard style={commonStyles.stackMd}>
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

const styles = StyleSheet.create({
  screenContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    gap: 16,
  },
  termsTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: palette.text,
    marginBottom: 4,
  },
  termsText: {
    color: palette.muted,
    lineHeight: 22,
    marginBottom: 8,
  },
});
