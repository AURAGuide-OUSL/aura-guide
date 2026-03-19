import React from "react";
import { ScrollView, StyleSheet, Switch, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { palette, commonStyles } from "../../theme";
import { AppCard } from "../../components/AppCard";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenHeader } from "../../components/ScreenHeader";

export function SettingsScreen({
  values,
  onChange,
  onOpenTerms,
  onBack,
  onSignOut,
}: {
  values: { notifications: boolean; darkMode: boolean; language: string };
  onChange: (next: { notifications: boolean; darkMode: boolean; language: string }) => void;
  onOpenTerms: () => void;
  onBack: () => void;
  onSignOut: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <ScreenHeader title="Settings" subtitle="Manage your preferences" onBack={onBack} />

      <AppCard style={commonStyles.stackMd}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={commonStyles.stackSm}>
          <Pressable onPress={onOpenTerms} style={styles.settingsRow}>
            <Text style={commonStyles.cardBodyStrong}>Terms & Conditions</Text>
            <Ionicons name="chevron-forward" size={18} color={palette.muted} />
          </Pressable>
        </View>
      </AppCard>

      <AppCard style={commonStyles.stackMd}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={commonStyles.stackSm}>
          <View style={styles.settingsRow}>
            <Text style={commonStyles.cardBodyStrong}>Notifications</Text>
            <Switch
              value={values.notifications}
              onValueChange={(notifications) => onChange({ ...values, notifications })}
              trackColor={{ false: palette.border, true: "#93C5FD" }}
            />
          </View>
          <View style={styles.settingsRow}>
            <Text style={commonStyles.cardBodyStrong}>Dark Mode</Text>
            <Switch
              value={values.darkMode}
              onValueChange={(darkMode) => onChange({ ...values, darkMode })}
              trackColor={{ false: palette.border, true: "#C4B5FD" }}
            />
          </View>
          <View style={styles.settingsRow}>
            <Text style={commonStyles.cardBodyStrong}>Language</Text>
            <Text style={commonStyles.helperText}>{values.language}</Text>
          </View>
        </View>
      </AppCard>

      <PrimaryButton label="Sign Out" onPress={onSignOut} secondary />
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: palette.text,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
});
