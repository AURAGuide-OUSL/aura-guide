import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { palette, commonStyles } from "../../theme";
import { AppCard } from "../../components/AppCard";
import { InputField } from "../../components/InputField";
import { PickerField } from "../../components/PickerField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ProgressBar } from "../../components/ProgressBar";
import { UserProfile } from "../../types";
import { initialProfile } from "../../constants";

export function OnboardingScreen({
  initialEmail,
  initialPassword,
  onComplete,
}: {
  initialEmail: string;
  initialPassword?: string;
  onComplete: (profile: any) => void;
}) {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(initialEmail || initialProfile.email);
  const [university, setUniversity] = useState(initialProfile.university);
  const [degreeProgram, setDegreeProgram] = useState(initialProfile.degreeProgram);
  const [studyYear, setStudyYear] = useState(initialProfile.studyYear);
  const [goal, setGoal] = useState(initialProfile.goal);
  const [technicalSkillLevel, setTechnicalSkillLevel] = useState(initialProfile.technicalSkillLevel);
  const [softSkillLevel, setSoftSkillLevel] = useState(initialProfile.softSkillLevel);
  const [availabilityType, setAvailabilityType] = useState(initialProfile.availabilityType);
  const [availabilityHours, setAvailabilityHours] = useState(initialProfile.availabilityHours);

  const progress = step === 1 ? 50 : 100;
  const canContinue = step === 1
    ? Boolean(firstName && lastName && email)
    : Boolean(university && degreeProgram && studyYear && goal && technicalSkillLevel && softSkillLevel && availabilityType && availabilityHours);

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <Text style={styles.kicker}>Step {step} of 2</Text>
      <Text style={styles.onboardingTitle}>{step === 1 ? "Personal information" : "Academic details"}</Text>
      <Text style={styles.onboardingSubtitle}>
        We use this information to tailor your dashboard, goals, and AI coaching prompts.
      </Text>

      <AppCard style={styles.sectionCard}>
        <View style={commonStyles.progressSummaryRow}>
          <Text style={commonStyles.helperText}>Onboarding progress</Text>
          <Text style={commonStyles.helperText}>{progress}% complete</Text>
        </View>
        <ProgressBar value={progress} />

        {step === 1 ? (
          <View style={commonStyles.stackMd}>
            <InputField label="First Name" placeholder="Enter your first name" value={firstName} onChangeText={setFirstName} />
            <InputField label="Last Name" placeholder="Enter your last name" value={lastName} onChangeText={setLastName} />
            <InputField
              label="Email"
              placeholder="you@university.edu"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>
        ) : (
          <View style={commonStyles.stackMd}>
            <PickerField label="University" selectedValue={university} onValueChange={(itemValue) => setUniversity(itemValue)}>
              <Picker.Item label="Select University" value="" />
              <Picker.Item label="Open University of Sri Lanka" value="Open University of Sri Lanka" />
              <Picker.Item label="University of Colombo" value="University of Colombo" />
              <Picker.Item label="University of Moratuwa" value="University of Moratuwa" />
              <Picker.Item label="SLIIT" value="SLIIT" />
            </PickerField>
            <PickerField
              label="Degree Program"
              selectedValue={degreeProgram}
              onValueChange={(itemValue) => setDegreeProgram(itemValue)}
            >
              <Picker.Item label="Select Degree Program" value="" />
              <Picker.Item label="Software Engineering" value="Software Engineering" />
              <Picker.Item label="Computer Science" value="Computer Science" />
              <Picker.Item label="Information Technology" value="Information Technology" />
            </PickerField>

            <PickerField label="Study Year" selectedValue={studyYear} onValueChange={(itemValue) => setStudyYear(itemValue)}>
              <Picker.Item label="Select Study Year" value="" />
              <Picker.Item label="1st year" value="1" />
              <Picker.Item label="2nd year" value="2" />
              <Picker.Item label="3rd year" value="3" />
              <Picker.Item label="4th year" value="4" />
            </PickerField>

            <PickerField
              label="Your Goal"
              selectedValue={goal}
              onValueChange={(itemValue) => setGoal(itemValue)}
            >
              <Picker.Item label="Select Goal" value="" />
              <Picker.Item label="I wanted to be a software engineer" value="1" />
              <Picker.Item label="I wanted to be a backend developer" value="2" />
              <Picker.Item label="I wanted to be a QA engineer" value="3" />
              <Picker.Item label="I wanted to be a DevOps engineer" value="4" />
            </PickerField>
            <PickerField label="Initial technical skill level" selectedValue={technicalSkillLevel} onValueChange={(itemValue) => setTechnicalSkillLevel(itemValue)}>
              <Picker.Item label="Select level" value="" />
              <Picker.Item label="Beginner" value="Beginner" />
              <Picker.Item label="Intermediate" value="Intermediate" />
              <Picker.Item label="Advanced" value="Advanced" />
            </PickerField>
            <PickerField label="Initial soft skill level" selectedValue={softSkillLevel} onValueChange={(itemValue) => setSoftSkillLevel(itemValue)}>
              <Picker.Item label="Select level" value="" />
              <Picker.Item label="Beginner" value="Beginner" />
              <Picker.Item label="Intermediate" value="Intermediate" />
              <Picker.Item label="Advanced" value="Advanced" />
            </PickerField>
            <PickerField label="Availability type" selectedValue={availabilityType} onValueChange={(itemValue) => setAvailabilityType(itemValue)}>
              <Picker.Item label="Select type" value="" />
              <Picker.Item label="Daily" value="daily" />
              <Picker.Item label="Weekly" value="weekly" />
            </PickerField>
            <PickerField label="Time availability (hours)" selectedValue={availabilityHours} onValueChange={(itemValue) => setAvailabilityHours(itemValue)}>
              <Picker.Item label="Select hours" value="" />
              {Array.from({ length: 20 }, (_, i) => (
                <Picker.Item key={i + 1} label={`${i + 1}`} value={`${i + 1}`} />
              ))}
            </PickerField>
          </View>
        )}

        <View style={styles.actionRow}>
          {step > 1 ? <PrimaryButton label="Back" onPress={() => setStep(1)} secondary /> : null}
          <PrimaryButton
            label={step === 1 ? "Next" : "Complete Setup"}
            onPress={() => {
              if (step === 1) {
                setStep(2);
                return;
              }

              onComplete({
                firstName,
                lastName,
                email,
                password: initialPassword,
                university,
                technical_skill_level: technicalSkillLevel,
                soft_skill_level: softSkillLevel,
                availability_type: availabilityType,
                availability_hours: parseInt(availabilityHours) || 1,
                degree_program: degreeProgram,
                study_year: parseInt(studyYear) || 1,
                goal_id: parseInt(goal) || 1,
              });
            }}
            disabled={!canContinue}
          />
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
  kicker: {
    color: palette.primary,
    fontWeight: "700",
  },
  onboardingTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: palette.text,
  },
  onboardingSubtitle: {
    color: palette.muted,
    lineHeight: 22,
  },
  sectionCard: {
    gap: 14,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
});
