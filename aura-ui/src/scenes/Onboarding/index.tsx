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
  onComplete,
}: {
  initialEmail: string;
  onComplete: (profile: UserProfile) => void;
}) {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("John");
  const [lastName, setLastName] = useState("Doe");
  const [email, setEmail] = useState(initialEmail || initialProfile.email);
  const [university, setUniversity] = useState(initialProfile.university);
  const [degreeProgram, setDegreeProgram] = useState(initialProfile.degreeProgram);
  const [studyYear, setStudyYear] = useState(initialProfile.studyYear);
  const [goal, setGoal] = useState(initialProfile.goal);

  const progress = step === 1 ? 50 : 100;
  const canContinue =
    step === 1 ? Boolean(firstName && lastName && email) : Boolean(university && degreeProgram && studyYear && goal);

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
            <InputField label="First Name" placeholder="John" value={firstName} onChangeText={setFirstName} />
            <InputField label="Last Name" placeholder="Doe" value={lastName} onChangeText={setLastName} />
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
            <InputField label="University" placeholder="University of Technology" value={university} onChangeText={setUniversity} />
            <PickerField
              label="Degree Program"
              selectedValue={degreeProgram}
              onValueChange={(itemValue) => setDegreeProgram(itemValue)}
            >
              <Picker.Item label="Select Degree Program" value="" />
              <Picker.Item label="Software Engineering" value="software_engineering" />
              <Picker.Item label="Computer Science" value="computer_science" />
              <Picker.Item label="Information Technology" value="information_technology" />
            </PickerField>

            <InputField
              label="Study Year"
              placeholder="3rd Year"
              value={studyYear}
              onChangeText={setStudyYear}
            />

            <PickerField
              label="Your Goal"
              selectedValue={goal}
              onValueChange={(itemValue) => setGoal(itemValue)}
            >
              <Picker.Item label="Select Goal" value="" />
              <Picker.Item label="Software Engineer" value="software_engineer" />
              <Picker.Item label="Backend Developer" value="backend_developer" />
              <Picker.Item label="QA Engineer" value="qa_engineer" />
              <Picker.Item label="DevOps Engineer" value="devops_engineer" />
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
                university,
                degreeProgram,
                studyYear,
                goal,
                joinedDate: initialProfile.joinedDate,
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
