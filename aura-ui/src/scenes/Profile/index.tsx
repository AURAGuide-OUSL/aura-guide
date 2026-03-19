import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { palette, commonStyles } from "../../theme";
import { AppCard } from "../../components/AppCard";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenHeader } from "../../components/ScreenHeader";
import { UserProfile } from "../../types";
import { recommendations } from "../../../src-native/mockData";

export function ProfileScreen({
  user,
  onNavigateSettings,
}: {
  user: UserProfile;
  onNavigateSettings: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <ScreenHeader
        title="Profile"
        subtitle="Your academic and growth snapshot"
        rightAction={
          <Pressable onPress={onNavigateSettings} style={styles.iconIconButton}>
            <Ionicons name="settings-outline" size={20} color={palette.text} />
          </Pressable>
        }
      />

      <AppCard style={commonStyles.stackMd}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarLarge}>
            <Ionicons name="person-outline" size={38} color={palette.surface} />
          </View>
          <View style={commonStyles.flexOne}>
            <Text style={styles.profileName}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={commonStyles.cardBody}>{user.degreeProgram}</Text>
            <Text style={commonStyles.cardBody}>{user.university}</Text>
            <Text style={commonStyles.cardBody}>{user.email}</Text>
          </View>
          <Pressable onPress={() => setIsEditing((value) => !value)} style={styles.iconIconButton}>
            <Feather name="edit-2" size={16} color={palette.primary} />
          </Pressable>
        </View>
        {isEditing ? (
          <Text style={styles.helperBox}>
            Profile editing is mocked here. In a real app, this section would save updates to your account profile.
          </Text>
        ) : null}
      </AppCard>

      <AppCard style={styles.primaryBanner}>
        <Text style={styles.bannerEyebrow}>Current score</Text>
        <Text style={styles.profileScore}>450 pts</Text>
        <View style={styles.scoreRow}>
          <View>
            <Text style={styles.scoreValue}>180</Text>
            <Text style={styles.scoreLabel}>Technical</Text>
          </View>
          <View>
            <Text style={styles.scoreValue}>120</Text>
            <Text style={styles.scoreLabel}>Soft Skills</Text>
          </View>
          <View>
            <Text style={styles.scoreValue}>150</Text>
            <Text style={styles.scoreLabel}>Academic</Text>
          </View>
        </View>
      </AppCard>

      <AppCard style={commonStyles.stackMd}>
        <Text style={styles.sectionTitle}>AURA recommendations</Text>
        <View style={commonStyles.stackSm}>
          {recommendations.map((item) => (
            <View key={item.title} style={styles.recommendationRow}>
              <View style={styles.recommendationIcon}>
                <Ionicons name="trending-up-outline" size={16} color={palette.primary} />
              </View>
              <View style={commonStyles.flexOne}>
                <Text style={commonStyles.cardBodyStrong}>{item.title}</Text>
                <Text style={commonStyles.cardBody}>{item.reason}</Text>
              </View>
            </View>
          ))}
        </View>
      </AppCard>

      <AppCard style={commonStyles.stackMd}>
        <Text style={styles.sectionTitle}>CV status</Text>
        <Text style={commonStyles.cardBody}>Resume_JohnDoe_2026.pdf uploaded on March 15, 2026.</Text>
        <View style={styles.actionRow}>
          <PrimaryButton label="Download" onPress={() => undefined} secondary />
          <PrimaryButton label="Upload New" onPress={() => undefined} />
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
  iconIconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: palette.border,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  avatarLarge: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "800",
    color: palette.text,
  },
  helperBox: {
    color: palette.muted,
    lineHeight: 21,
    backgroundColor: "#F8FBFF",
    borderWidth: 1,
    borderColor: palette.border,
    padding: 12,
    borderRadius: 14,
  },
  primaryBanner: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
    gap: 8,
    borderRadius: 22,
    padding: 18,
  },
  bannerEyebrow: {
    color: "#BFDBFE",
    fontWeight: "700",
    textTransform: "uppercase",
    fontSize: 12,
    letterSpacing: 0.8,
  },
  profileScore: {
    color: palette.surface,
    fontSize: 36,
    fontWeight: "800",
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  scoreValue: {
    color: palette.surface,
    fontSize: 20,
    fontWeight: "800",
  },
  scoreLabel: {
    color: "#BFDBFE",
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: palette.text,
  },
  recommendationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  recommendationIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.chipBlue,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
});
