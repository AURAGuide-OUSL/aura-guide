import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { palette, commonStyles } from "../../theme";
import { AppCard } from "../../components/AppCard";
import { InputField } from "../../components/InputField";
import { PickerField } from "../../components/PickerField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenHeader } from "../../components/ScreenHeader";
import { UserProfile } from "../../types";
import { Picker } from "@react-native-picker/picker";
import { api } from "../../api/api";

export function ProfileScreen({
  user,
  onNavigateSettings,
  onProfileUpdated,
}: {
  user: UserProfile;
  onNavigateSettings: () => void;
  onProfileUpdated: () => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(user);
  useEffect(() => {
    setForm(user);
  }, [user]);

  const saveProfile = async () => {
    try {
      await api.updateUserProfile({
        first_name: form.firstName,
        last_name: form.lastName,
        degree_program: form.degreeProgram,
        study_year: parseInt(form.studyYear) || 1,
        university: form.university,
        technical_skill_level: form.technicalSkillLevel,
        soft_skill_level: form.softSkillLevel,
        availability_type: form.availabilityType,
        availability_hours: parseInt(form.availabilityHours) || 1,
        goal_id: form.goalId || 1,
      });
      await onProfileUpdated();
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully.");
    } catch (error) {
      Alert.alert("Update failed", (error as Error).message);
    }
  };

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
              {form.firstName} {form.lastName}
            </Text>
            <Text style={commonStyles.cardBody}>{form.degreeProgram}</Text>
            <Text style={commonStyles.cardBody}>{form.university}</Text>
            <Text style={commonStyles.cardBody}>{form.email}</Text>
          </View>
          <Pressable onPress={() => setIsEditing((value) => !value)} style={styles.iconIconButton}>
            <Feather name="edit-2" size={16} color={palette.primary} />
          </Pressable>
        </View>
        {isEditing ? (
          <View style={commonStyles.stackSm}>
            <InputField label="First name" placeholder="First name" value={form.firstName} onChangeText={(v) => setForm({ ...form, firstName: v })} />
            <InputField label="Last name" placeholder="Last name" value={form.lastName} onChangeText={(v) => setForm({ ...form, lastName: v })} />
            <PickerField label="Degree Program" selectedValue={form.degreeProgram} onValueChange={(v) => setForm({ ...form, degreeProgram: v })}>
              <Picker.Item label="Select Degree Program" value="" />
              <Picker.Item label="Software Engineering" value="Software Engineering" />
              <Picker.Item label="Computer Science" value="Computer Science" />
              <Picker.Item label="Information Technology" value="Information Technology" />
            </PickerField>
            <PickerField label="Study Year" selectedValue={form.studyYear} onValueChange={(v) => setForm({ ...form, studyYear: v })}>
              <Picker.Item label="Select Study Year" value="" />
              <Picker.Item label="1st year" value="1" />
              <Picker.Item label="2nd year" value="2" />
              <Picker.Item label="3rd year" value="3" />
              <Picker.Item label="4th year" value="4" />
            </PickerField>
            <PickerField label="Your Goal" selectedValue={String(form.goalId || "")} onValueChange={(v) => setForm({ ...form, goalId: parseInt(v) || 1 })}>
              <Picker.Item label="Select Goal" value="" />
              <Picker.Item label="I wanted to be a software engineer" value="1" />
              <Picker.Item label="I wanted to be a backend developer" value="2" />
              <Picker.Item label="I wanted to be a QA engineer" value="3" />
              <Picker.Item label="I wanted to be a DevOps engineer" value="4" />
            </PickerField>
            <PickerField label="Initial technical skill level" selectedValue={form.technicalSkillLevel} onValueChange={(v) => setForm({ ...form, technicalSkillLevel: v })}>
              <Picker.Item label="Select level" value="" />
              <Picker.Item label="Beginner" value="Beginner" />
              <Picker.Item label="Intermediate" value="Intermediate" />
              <Picker.Item label="Advanced" value="Advanced" />
            </PickerField>
            <PickerField label="Initial soft skill level" selectedValue={form.softSkillLevel} onValueChange={(v) => setForm({ ...form, softSkillLevel: v })}>
              <Picker.Item label="Select level" value="" />
              <Picker.Item label="Beginner" value="Beginner" />
              <Picker.Item label="Intermediate" value="Intermediate" />
              <Picker.Item label="Advanced" value="Advanced" />
            </PickerField>
            <PickerField label="Availability type" selectedValue={form.availabilityType} onValueChange={(v) => setForm({ ...form, availabilityType: v })}>
              <Picker.Item label="Select availability type" value="" />
              <Picker.Item label="Daily" value="daily" />
              <Picker.Item label="Weekly" value="weekly" />
            </PickerField>
            <PickerField label="Time availability (hours)" selectedValue={form.availabilityHours} onValueChange={(v) => setForm({ ...form, availabilityHours: v })}>
              <Picker.Item label="Select hours" value="" />
              {Array.from({ length: 20 }, (_, i) => (
                <Picker.Item key={i + 1} label={`${i + 1}`} value={`${i + 1}`} />
              ))}
            </PickerField>
            <PrimaryButton label="Update Profile" onPress={saveProfile} />
          </View>
        ) : null}
      </AppCard>

      <AppCard style={styles.primaryBanner}>
        <Text style={styles.bannerEyebrow}>Summary of the Current score</Text>
        <Text style={styles.profileScore}>{user.currentScore || 0} pts</Text>
        <View style={styles.scoreRow}>
          <View>
            <Text style={styles.scoreValue}>{user.technicalScore || 0}</Text>
            <Text style={styles.scoreLabel}>Technical</Text>
          </View>
          <View>
            <Text style={styles.scoreValue}>{user.softSkillScore || 0}</Text>
            <Text style={styles.scoreLabel}>Soft Skills</Text>
          </View>
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
