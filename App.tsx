import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from '@react-native-picker/picker';

import {
  careerPhases,
  completedTasks,
  dailyEvents,
  dashboardStats,
  goals,
  notificationSeed,
  ongoingTasks,
  quickPrompts,
  recommendations,
  softSkills,
  technicalSkills,
  termsSections,
  todayPlan,
} from "./src-native/mockData";
import { cardShadow, palette } from "./src-native/theme";

type Route =
  | "splash"
  | "signin"
  | "signup"
  | "resetPassword"
  | "onboarding"
  | "terms"
  | "dashboard"
  | "aiCoach"
  | "tasks"
  | "goals"
  | "profile"
  | "settings"
  | "notifications"
  | "calendar"
  | "careerTrack";

type TabRoute = "dashboard" | "aiCoach" | "tasks" | "goals" | "profile";

type UserProfile = {
  firstName: string;
  lastName: string;
  email: string;
  university: string;
  degreeProgram: string;
  studyYear: string;
  joinedDate: string;
  goal: string;
};

type Message = {
  id: number;
  type: "user" | "aura";
  content: string;
  timestamp: string;
  category?: string;
};

const tabRoutes: TabRoute[] = ["dashboard", "aiCoach", "tasks", "goals", "profile"];

const initialProfile: UserProfile = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@university.edu",
  university: "University of Technology",
  degreeProgram: "Computer Science",
  studyYear: "3rd Year",
  goal: "Software Engineer",
  joinedDate: "January 2026",
};

const initialMessages: Message[] = [
  {
    id: 1,
    type: "aura",
    timestamp: "Now",
    content:
      "Hello! I'm AURA, your AI life coach. I can help with career guidance, technical skills, interview prep, and academic planning. What would you like to work on today?",
  },
];

function formatToday() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function getAuraResponse(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes("debug") || lower.includes("code")) {
    return {
      category: "Technical",
      content:
        "Start by isolating the failing behavior, comparing expected vs actual output, and checking logs around the exact point of failure. If you paste the code and error details, I can help you debug it step by step.",
    };
  }

  if (lower.includes("interview")) {
    return {
      category: "Soft Skills",
      content:
        "Use the STAR framework: Situation, Task, Action, Result. Pick one experience, make the action section concrete, and end with the impact you created.",
    };
  }

  if (lower.includes("git")) {
    return {
      category: "Technical",
      content:
        "Focus on the mental model first: a repository stores history, commits are snapshots, and branches are movable pointers. Once that clicks, commands like add, commit, pull, merge, and rebase become much easier to reason about.",
    };
  }

  if (lower.includes("career") || lower.includes("roadmap")) {
    return {
      category: "Career",
      content:
        "A strong student roadmap usually combines fundamentals, visible projects, interview practice, and networking. Keep one active build project, one interview track, and one career growth habit running every week.",
    };
  }

  return {
    category: "General",
    content:
      "Tell me a little more about your situation and goal, and I will help you break it into the next practical steps.",
  };
}

function getPriorityColors(priority: "High" | "Medium" | "Low") {
  switch (priority) {
    case "High":
      return { backgroundColor: "#FEE2E2", textColor: palette.danger };
    case "Medium":
      return { backgroundColor: palette.chipYellow, textColor: palette.warning };
    default:
      return { backgroundColor: palette.chipGreen, textColor: palette.success };
  }
}

function getCategoryColor(category: string) {
  if (category === "Technical") {
    return { backgroundColor: palette.chipPurple, textColor: palette.secondary };
  }
  if (category === "Academic") {
    return { backgroundColor: palette.chipBlue, textColor: palette.primary };
  }
  if (category === "Soft Skills") {
    return { backgroundColor: "#FCE7F3", textColor: "#BE185D" };
  }
  return { backgroundColor: palette.surfaceMuted, textColor: palette.muted };
}

function notificationTint(type: string) {
  switch (type) {
    case "achievement":
      return { backgroundColor: palette.chipYellow, textColor: palette.warning, icon: "trophy-outline" as const };
    case "task":
      return { backgroundColor: palette.chipBlue, textColor: palette.primary, icon: "checkbox-outline" as const };
    case "ai":
      return { backgroundColor: palette.chipPurple, textColor: palette.secondary, icon: "sparkles-outline" as const };
    default:
      return { backgroundColor: palette.chipGreen, textColor: palette.success, icon: "calendar-outline" as const };
  }
}

function buildMonthDays(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: totalDays }, (_, index) => index + 1);
}

function tabLabel(route: TabRoute) {
  switch (route) {
    case "dashboard":
      return "Dashboard";
    case "aiCoach":
      return "AI Coach";
    case "tasks":
      return "Tasks";
    case "goals":
      return "Goals";
    case "profile":
      return "Profile";
  }
}

function TabIcon({ route, active }: { route: TabRoute; active: boolean }) {
  const color = active ? palette.primary : palette.muted;

  switch (route) {
    case "dashboard":
      return <Ionicons name={active ? "home" : "home-outline"} size={20} color={color} />;
    case "aiCoach":
      return (
        <Ionicons
          name={active ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
          size={20}
          color={color}
        />
      );
    case "tasks":
      return (
        <MaterialCommunityIcons
          name={active ? "format-list-checks" : "format-list-checks"}
          size={20}
          color={color}
        />
      );
    case "goals":
      return <Ionicons name={active ? "flag" : "flag-outline"} size={20} color={color} />;
    case "profile":
      return <Ionicons name={active ? "person" : "person-outline"} size={20} color={color} />;
  }
}

function AppCard({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.card, cardShadow.shadow, style]}>{children}</View>;
}

function PrimaryButton({
  label,
  onPress,
  secondary,
  disabled,
  icon,
}: {
  label: string;
  onPress?: () => void;
  secondary?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        secondary ? styles.buttonSecondary : styles.buttonPrimary,
        pressed && !disabled ? styles.buttonPressed : undefined,
        disabled ? styles.buttonDisabled : undefined,
      ]}
    >
      <View style={styles.buttonContent}>
        {icon}
        <Text style={[styles.buttonLabel, secondary ? styles.buttonLabelSecondary : styles.buttonLabelPrimary]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function TextLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Text style={styles.link}>{label}</Text>
    </Pressable>
  );
}

function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  secureTextEntry,
  keyboardType,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  icon?: ReactNode;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        {icon ? <View style={styles.inputIcon}>{icon}</View> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={palette.muted}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={secureTextEntry}
          style={[styles.input, icon ? styles.inputWithIcon : undefined]}
        />
      </View>
    </View>
  );
}

function PickerField({
  label,
  selectedValue,
  onValueChange,
  children,
}: {
  label: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={styles.picker}
          dropdownIconColor={palette.primary}
        >
          {children}
        </Picker>
      </View>
    </View>
  );
}

function Badge({

  label,
  backgroundColor,
  textColor,
}: {
  label: string;
  backgroundColor: string;
  textColor: string;
}) {
  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

function ProgressBar({ value, color = palette.primary }: { value: number; color?: string }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${value}%`, backgroundColor: color }]} />
    </View>
  );
}

function ScreenHeader({
  title,
  subtitle,
  onBack,
  rightAction,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: ReactNode;
}) {
  return (
    <View style={styles.screenHeader}>
      <View style={styles.screenHeaderRow}>
        <View style={styles.screenHeaderTitleRow}>
          {onBack ? (
            <Pressable onPress={onBack} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={20} color={palette.text} />
            </Pressable>
          ) : null}
          <View>
            <Text style={styles.screenTitle}>{title}</Text>
            {subtitle ? <Text style={styles.screenSubtitle}>{subtitle}</Text> : null}
          </View>
        </View>
        {rightAction}
      </View>
    </View>
  );
}

function BottomTabs({ current, onNavigate }: { current: TabRoute; onNavigate: (route: TabRoute) => void }) {
  return (
    <View style={styles.tabsBar}>
      {tabRoutes.map((route) => {
        const active = current === route;
        return (
          <Pressable key={route} onPress={() => onNavigate(route)} style={styles.tabItem}>
            <View style={[styles.tabIconWrap, active ? styles.tabIconWrapActive : undefined]}>
              <TabIcon route={route} active={active} />
            </View>
            <Text style={[styles.tabLabel, active ? styles.tabLabelActive : undefined]}>{tabLabel(route)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.segment, active ? styles.segmentActive : undefined]}
          >
            <Text style={[styles.segmentLabel, active ? styles.segmentLabelActive : undefined]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SplashScreen() {
  return (
    <View style={styles.splash}>
      <View style={styles.splashOrbOne} />
      <View style={styles.splashOrbTwo} />
      <View style={styles.splashCard}>
        <Ionicons name="sparkles" size={28} color="#BFDBFE" style={styles.splashSparkle} />
        <Ionicons name="school-outline" size={72} color={palette.surface} />
      </View>
      <Text style={styles.splashTitle}>AURA Guide</Text>
      <Text style={styles.splashSubtitle}>Your intelligent companion for student growth</Text>
      <View style={styles.loadingDots}>
        <View style={styles.loadingDot} />
        <View style={[styles.loadingDot, { opacity: 0.8 }]} />
        <View style={[styles.loadingDot, { opacity: 0.6 }]} />
      </View>
    </View>
  );
}

function SignInScreen({
  onSignIn,
  onOpenSignUp,
  onOpenReset,
}: {
  onSignIn: () => void;
  onOpenSignUp: () => void;
  onOpenReset: () => void;
}) {
  const [email, setEmail] = useState(initialProfile.email);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.authScroll}>
      <View style={styles.authHero}>
        <View style={styles.logoBubble}>
          <Ionicons name="school" size={36} color={palette.primary} />
        </View>
        <Text style={styles.authTitle}>Welcome back</Text>
        <Text style={styles.authSubtitle}>Sign in to continue your AURA journey.</Text>
      </View>

      <AppCard style={styles.authCard}>
        <InputField
          label="Email"
          placeholder="you@university.edu"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          icon={<Feather name="mail" size={18} color={palette.muted} />}
        />

        <InputField
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          icon={<Feather name="lock" size={18} color={palette.muted} />}
        />

        <View style={styles.inlineRow}>
          <TextLink label={showPassword ? "Hide password" : "Show password"} onPress={() => setShowPassword((value) => !value)} />
          <TextLink label="Forgot password?" onPress={onOpenReset} />
        </View>

        <PrimaryButton label="Sign In" onPress={onSignIn} />
      </AppCard>

      <View style={styles.authFooter}>
        <Text style={styles.authFooterText}>Don't have an account?</Text>
        <TextLink label="Create one here" onPress={onOpenSignUp} />
      </View>
    </ScrollView>
  );
}

function SignUpScreen({
  onOpenTerms,
  onOpenSignIn,
  onContinue,
}: {
  onOpenTerms: () => void;
  onOpenSignIn: () => void;
  onContinue: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = () => {
    if (!email || !password || !confirmPassword) {
      setError("Fill in all fields before continuing.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!acceptTerms) {
      setError("Accept the terms and conditions to continue.");
      return;
    }

    setError("");
    onContinue(email);
  };

  return (
    <ScrollView contentContainerStyle={styles.authScroll}>
      <View style={styles.authHero}>
        <View style={styles.logoBubble}>
          <Ionicons name="sparkles" size={34} color={palette.primary} />
        </View>
        <Text style={styles.authTitle}>Join AURA Guide</Text>
        <Text style={styles.authSubtitle}>Create your account and set up your growth plan.</Text>
      </View>

      <AppCard style={styles.authCard}>
        <InputField
          label="Email"
          placeholder="you@university.edu"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          icon={<Feather name="mail" size={18} color={palette.muted} />}
        />

        <InputField
          label="Password"
          placeholder="Create a strong password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          icon={<Feather name="lock" size={18} color={palette.muted} />}
        />

        <InputField
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
          icon={<Feather name="lock" size={18} color={palette.muted} />}
        />

        <View style={styles.inlineRow}>
          <TextLink label={showPassword ? "Hide passwords" : "Show passwords"} onPress={() => setShowPassword((value) => !value)} />
          <TextLink label="View terms" onPress={onOpenTerms} />
        </View>

        <Pressable onPress={() => setAcceptTerms((value) => !value)} style={styles.checkboxRow}>
          <View style={[styles.checkbox, acceptTerms ? styles.checkboxChecked : undefined]}>
            {acceptTerms ? <Ionicons name="checkmark" size={14} color={palette.surface} /> : null}
          </View>
          <Text style={styles.checkboxText}>I accept the Terms and Conditions</Text>
        </Pressable>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <PrimaryButton label="Create Account" onPress={handleContinue} />
      </AppCard>

      <View style={styles.authFooter}>
        <Text style={styles.authFooterText}>Already registered?</Text>
        <TextLink label="Sign in here" onPress={onOpenSignIn} />
      </View>
    </ScrollView>
  );
}

function ResetPasswordScreen({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.authScroll}>
      <View style={styles.authHero}>
        <View style={styles.logoBubble}>
          <Feather name="mail" size={34} color={palette.primary} />
        </View>
        <Text style={styles.authTitle}>Reset Password</Text>
        <Text style={styles.authSubtitle}>
          {sent ? "Check your inbox for reset instructions." : "Enter your email to receive a reset link."}
        </Text>
      </View>

      <AppCard style={styles.authCard}>
        {!sent ? (
          <>
            <InputField
              label="Email"
              placeholder="you@university.edu"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              icon={<Feather name="mail" size={18} color={palette.muted} />}
            />
            <PrimaryButton label="Send Reset Link" onPress={() => setSent(true)} />
          </>
        ) : (
          <View style={styles.centeredBlock}>
            <View style={styles.successIcon}>
              <Feather name="check" size={24} color={palette.success} />
            </View>
            <Text style={styles.confirmTitle}>Email sent</Text>
            <Text style={styles.confirmText}>We sent reset instructions to {email || "your email address"}.</Text>
            <PrimaryButton label="Back to Sign In" onPress={onBack} secondary />
          </View>
        )}
      </AppCard>
    </ScrollView>
  );
}

function OnboardingScreen({
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
        <View style={styles.progressSummaryRow}>
          <Text style={styles.helperText}>Onboarding progress</Text>
          <Text style={styles.helperText}>{progress}% complete</Text>
        </View>
        <ProgressBar value={progress} />

        {step === 1 ? (
          <View style={styles.stackMd}>
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
          <View style={styles.stackMd}>
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

function DashboardScreen({
  user,
  onNavigate,
  onSignOut,
}: {
  user: UserProfile;
  onNavigate: (route: Route) => void;
  onSignOut: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <ScreenHeader
        title={`Welcome back, ${user.firstName}!`}
        subtitle={formatToday()}
        rightAction={
          <View style={styles.headerActions}>
            <Pressable onPress={() => onNavigate("notifications")} style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={20} color={palette.text} />
            </Pressable>
            <Pressable onPress={onSignOut} style={styles.iconButton}>
              <Ionicons name="log-out-outline" size={20} color={palette.text} />
            </Pressable>
          </View>
        }
      />

      <View style={styles.statsRow}>
        {dashboardStats.map((item) => (
          <AppCard key={item.label} style={styles.metricCard}>
            <Ionicons name={item.icon} size={24} color={item.color} />
            <Text style={styles.metricValue}>{item.value}</Text>
            <Text style={styles.metricLabel}>{item.label}</Text>
          </AppCard>
        ))}
      </View>

      <View style={styles.stackMd}>
        <AppCard style={styles.primaryBanner}>
          <Text style={styles.bannerEyebrow}>AURA says...</Text>
          <Text style={styles.bannerBody}>
            Keep up the momentum. Your technical skills improved this week, so today is a good day to push on a more
            challenging problem.
          </Text>
        </AppCard>

        <AppCard style={styles.sectionCard}>
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionTitle}>Quick actions</Text>
          </View>
          <View style={styles.stackSm}>
            <Pressable style={styles.quickAction} onPress={() => onNavigate("calendar")}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="calendar-outline" size={18} color={palette.primary} />
              </View>
              <View style={styles.flexOne}>
                <Text style={styles.quickActionTitle}>Calendar</Text>
                <Text style={styles.quickActionSubtitle}>View your schedule and upcoming events</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={palette.muted} />
            </Pressable>

            <Pressable style={styles.quickAction} onPress={() => onNavigate("careerTrack")}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="rocket-outline" size={18} color={palette.primary} />
              </View>
              <View style={styles.flexOne}>
                <Text style={styles.quickActionTitle}>Career track plan</Text>
                <Text style={styles.quickActionSubtitle}>Review your personalized roadmap</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={palette.muted} />
            </Pressable>
          </View>
        </AppCard>

        <AppCard style={styles.sectionCard}>
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionTitle}>Today's plan</Text>
            <TextLink label="See calendar" onPress={() => onNavigate("calendar")} />
          </View>
          <View style={styles.stackSm}>
            {todayPlan.map((item) => (
              <View key={`${item.time}-${item.task}`} style={styles.timelineRow}>
                <View style={[styles.timelineDot, item.completed ? styles.timelineDotDone : undefined]} />
                <View style={styles.flexOne}>
                  <Text style={[styles.timelineTask, item.completed ? styles.timelineTaskDone : undefined]}>{item.task}</Text>
                  <Text style={styles.timelineTime}>{item.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </AppCard>

        <View style={styles.sectionHeadingRow}>
          <Text style={styles.sectionTitle}>Ongoing tasks</Text>
          <TextLink label="Open planner" onPress={() => onNavigate("tasks")} />
        </View>

        {ongoingTasks.map((task) => {
          const priority = getPriorityColors(task.priority);
          const category = getCategoryColor(task.category);

          return (
            <AppCard key={task.id} style={styles.sectionCard}>
              <View style={styles.cardHeaderSpace}>
                <View style={styles.flexOne}>
                  <Text style={styles.cardTitle}>{task.title}</Text>
                  <Text style={styles.cardBody}>{task.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={palette.muted} />
              </View>

              <View style={styles.badgeRow}>
                <Badge label={task.category} backgroundColor={category.backgroundColor} textColor={category.textColor} />
                <Badge label={task.priority} backgroundColor={priority.backgroundColor} textColor={priority.textColor} />
              </View>

              <View style={styles.progressSummaryRow}>
                <Text style={styles.helperText}>Progress {task.progress}%</Text>
                <Text style={styles.helperText}>{task.dueLabel}</Text>
              </View>
              <ProgressBar value={task.progress} />
            </AppCard>
          );
        })}
      </View>
    </ScrollView>
  );
}

function AICoachScreen() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  const sendMessage = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) {
      return;
    }

    const nextUserMessage: Message = {
      id: Date.now(),
      type: "user",
      content,
      timestamp: "Now",
    };

    setMessages((current) => [...current, nextUserMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getAuraResponse(content);
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          type: "aura",
          content: response.content,
          category: response.category,
          timestamp: "Now",
        },
      ]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flexOne}>
      <ScreenHeader title="AURA Life Coach" subtitle="Ask about study, career, or technical growth" />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.promptStrip}
        style={styles.promptsContainer}
      >
        {quickPrompts.map((prompt) => (
          <Pressable key={prompt} onPress={() => sendMessage(prompt)} style={styles.promptChip}>
            <Ionicons name="sparkles-outline" size={14} color={palette.primary} />
            <Text style={styles.promptChipText}>{prompt}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.chatBody}>
        {messages.map((message) => {
          const isUser = message.type === "user";
          return (
            <View key={message.id} style={[styles.messageRow, isUser ? styles.messageRowUser : undefined]}>
              <View style={[styles.messageAvatar, isUser ? styles.userAvatar : styles.auraAvatar]}>
                <Ionicons name={isUser ? "person-outline" : "sparkles-outline"} size={16} color={palette.surface} />
              </View>
              <View style={[styles.messageBubble, isUser ? styles.messageBubbleUser : styles.messageBubbleAura]}>
                {message.category ? (
                  <Badge
                    label={message.category}
                    backgroundColor={isUser ? "rgba(255,255,255,0.18)" : palette.chipBlue}
                    textColor={isUser ? palette.surface : palette.primary}
                  />
                ) : null}
                <Text style={[styles.messageText, isUser ? styles.messageTextUser : undefined]}>{message.content}</Text>
                <Text style={[styles.messageTime, isUser ? styles.messageTimeUser : undefined]}>{message.timestamp}</Text>
              </View>
            </View>
          );
        })}

        {isTyping ? (
          <View style={styles.messageRow}>
            <View style={[styles.messageAvatar, styles.auraAvatar]}>
              <Ionicons name="sparkles-outline" size={16} color={palette.surface} />
            </View>
            <View style={[styles.messageBubble, styles.messageBubbleAura]}>
              <Text style={styles.typingText}>AURA is thinking...</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.chatInputBar}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask AURA anything..."
          placeholderTextColor={palette.muted}
          style={styles.chatInput}
          onSubmitEditing={() => sendMessage()}
        />
        <Pressable onPress={() => sendMessage()} style={styles.sendButton}>
          <Ionicons name="send" size={18} color={palette.surface} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function TasksScreen({ onNavigateCalendar }: { onNavigateCalendar: () => void }) {
  const [viewMode, setViewMode] = useState("List");
  const [listTab, setListTab] = useState("Today");

  const todayTasks = ongoingTasks.filter((task) => task.status === "In Progress");
  const upcomingTasks = ongoingTasks.filter((task) => task.status !== "In Progress");
  const completed = completedTasks;

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <ScreenHeader
        title="Tasks & Planner"
        subtitle="Manage your daily execution"
        rightAction={
          <Pressable onPress={onNavigateCalendar} style={styles.iconButton}>
            <Ionicons name="calendar-outline" size={20} color={palette.text} />
          </Pressable>
        }
      />

      <SegmentedControl options={["List", "Board"]} value={viewMode} onChange={setViewMode} />

      {viewMode === "List" ? (
        <>
          <SegmentedControl options={["Today", "Upcoming", "Completed"]} value={listTab} onChange={setListTab} />

          <View style={styles.stackMd}>
            {(listTab === "Today" ? todayTasks : listTab === "Upcoming" ? upcomingTasks : completed).map((task) => {
              const priority = getPriorityColors(task.priority);
              const category = getCategoryColor(task.category);

              return (
                <AppCard key={task.id} style={styles.sectionCard}>
                  <View style={styles.cardHeaderSpace}>
                    <View style={styles.flexOne}>
                      <Text style={styles.cardTitle}>{task.title}</Text>
                      {task.description ? <Text style={styles.cardBody}>{task.description}</Text> : null}
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={palette.muted} />
                  </View>

                  <View style={styles.badgeRow}>
                    <Badge label={task.category} backgroundColor={category.backgroundColor} textColor={category.textColor} />
                    <Badge label={task.priority} backgroundColor={priority.backgroundColor} textColor={priority.textColor} />
                  </View>

                  <View style={styles.progressSummaryRow}>
                    <Text style={styles.helperText}>{task.status}</Text>
                    <Text style={styles.helperText}>{task.dueLabel}</Text>
                  </View>
                  <ProgressBar value={task.progress} />
                </AppCard>
              );
            })}
          </View>
        </>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.boardRow}>
            {[
              { title: "To Do", items: upcomingTasks },
              { title: "In Progress", items: todayTasks },
              { title: "Done", items: completed },
            ].map((column) => (
              <View key={column.title} style={styles.boardColumn}>
                <Text style={styles.boardTitle}>{column.title}</Text>
                <View style={styles.stackSm}>
                  {column.items.map((task) => (
                    <AppCard key={task.id} style={styles.boardCard}>
                      <Text style={styles.cardTitle}>{task.title}</Text>
                      <Text style={styles.cardBody}>{task.dueLabel}</Text>
                    </AppCard>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <PrimaryButton label="Add New Task" onPress={() => undefined} />
    </ScrollView>
  );
}

function GoalsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <ScreenHeader title="Goals & Progress" subtitle="Track your milestones and skill growth" />

      <View style={styles.statsRow}>
        {[
          { label: "Tasks Done", value: "12" },
          { label: "Hours", value: "24h" },
          { label: "Skills", value: "3" },
          { label: "Streak", value: "14" },
        ].map((item) => (
          <AppCard key={item.label} style={styles.smallMetricCard}>
            <Text style={styles.smallMetricValue}>{item.value}</Text>
            <Text style={styles.smallMetricLabel}>{item.label}</Text>
          </AppCard>
        ))}
      </View>

      <AppCard style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Technical skills</Text>
        <View style={styles.stackMd}>
          {technicalSkills.map((skill) => (
            <View key={skill.name} style={styles.stackXs}>
              <View style={styles.progressSummaryRow}>
                <Text style={styles.cardBodyStrong}>{skill.name}</Text>
                <Text style={styles.helperText}>{skill.level}%</Text>
              </View>
              <ProgressBar value={skill.level} />
            </View>
          ))}
        </View>
      </AppCard>

      <AppCard style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Soft skills</Text>
        <View style={styles.stackMd}>
          {softSkills.map((skill) => (
            <View key={skill.name} style={styles.stackXs}>
              <View style={styles.progressSummaryRow}>
                <Text style={styles.cardBodyStrong}>{skill.name}</Text>
                <Text style={styles.helperText}>{skill.level}%</Text>
              </View>
              <ProgressBar value={skill.level} color={palette.secondary} />
            </View>
          ))}
        </View>
      </AppCard>

      <View style={styles.stackMd}>
        {goals.map((goal) => (
          <AppCard key={goal.id} style={styles.sectionCard}>
            <Text style={styles.cardTitle}>{goal.title}</Text>
            <Text style={styles.cardBody}>
              {goal.current} of {goal.target}. Deadline: {goal.deadline}.
            </Text>
            <View style={styles.badgeRow}>
              <Badge label={goal.category} backgroundColor={palette.chipBlue} textColor={palette.primary} />
            </View>
            <View style={styles.progressSummaryRow}>
              <Text style={styles.helperText}>Progress</Text>
              <Text style={styles.helperText}>{goal.progress}%</Text>
            </View>
            <ProgressBar value={goal.progress} />

            <View style={styles.stackXs}>
              {goal.milestones.map((milestone) => (
                <View key={milestone.name} style={styles.milestoneRow}>
                  <Ionicons
                    name={milestone.completed ? "checkmark-circle" : "ellipse-outline"}
                    size={18}
                    color={milestone.completed ? palette.success : palette.muted}
                  />
                  <Text style={styles.cardBodyStrong}>{milestone.name}</Text>
                </View>
              ))}
            </View>
          </AppCard>
        ))}
      </View>
    </ScrollView>
  );
}

function ProfileScreen({
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
          <Pressable onPress={onNavigateSettings} style={styles.iconButton}>
            <Ionicons name="settings-outline" size={20} color={palette.text} />
          </Pressable>
        }
      />

      <AppCard style={styles.sectionCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarLarge}>
            <Ionicons name="person-outline" size={38} color={palette.surface} />
          </View>
          <View style={styles.flexOne}>
            <Text style={styles.profileName}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={styles.cardBody}>{user.degreeProgram}</Text>
            <Text style={styles.cardBody}>{user.university}</Text>
            <Text style={styles.cardBody}>{user.email}</Text>
          </View>
          <Pressable onPress={() => setIsEditing((value) => !value)} style={styles.iconButton}>
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

      <AppCard style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>AURA recommendations</Text>
        <View style={styles.stackSm}>
          {recommendations.map((item) => (
            <View key={item.title} style={styles.recommendationRow}>
              <View style={styles.recommendationIcon}>
                <Ionicons name="trending-up-outline" size={16} color={palette.primary} />
              </View>
              <View style={styles.flexOne}>
                <Text style={styles.cardBodyStrong}>{item.title}</Text>
                <Text style={styles.cardBody}>{item.reason}</Text>
              </View>
            </View>
          ))}
        </View>
      </AppCard>

      <AppCard style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>CV status</Text>
        <Text style={styles.cardBody}>Resume_JohnDoe_2026.pdf uploaded on March 15, 2026.</Text>
        <View style={styles.actionRow}>
          <PrimaryButton label="Download" onPress={() => undefined} secondary />
          <PrimaryButton label="Upload New" onPress={() => undefined} />
        </View>
      </AppCard>
    </ScrollView>
  );
}

function SettingsScreen({
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

      <AppCard style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.stackSm}>
          <Pressable onPress={onOpenTerms} style={styles.settingsRow}>
            <Text style={styles.cardBodyStrong}>Terms & Conditions</Text>
            <Ionicons name="chevron-forward" size={18} color={palette.muted} />
          </Pressable>
        </View>
      </AppCard>

      <AppCard style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.stackSm}>
          <View style={styles.settingsRow}>
            <Text style={styles.cardBodyStrong}>Notifications</Text>
            <Switch
              value={values.notifications}
              onValueChange={(notifications) => onChange({ ...values, notifications })}
              trackColor={{ false: palette.border, true: "#93C5FD" }}
            />
          </View>
          <View style={styles.settingsRow}>
            <Text style={styles.cardBodyStrong}>Dark Mode</Text>
            <Switch
              value={values.darkMode}
              onValueChange={(darkMode) => onChange({ ...values, darkMode })}
              trackColor={{ false: palette.border, true: "#C4B5FD" }}
            />
          </View>
          <View style={styles.settingsRow}>
            <Text style={styles.cardBodyStrong}>Language</Text>
            <Text style={styles.helperText}>{values.language}</Text>
          </View>
        </View>
      </AppCard>

      <PrimaryButton label="Sign Out" onPress={onSignOut} secondary />
    </ScrollView>
  );
}

function NotificationsScreen({
  notifications,
  onBack,
  onMarkAllRead,
}: {
  notifications: typeof notificationSeed;
  onBack: () => void;
  onMarkAllRead: () => void;
}) {
  const [tab, setTab] = useState("All");
  const visibleNotifications = tab === "Unread" ? notifications.filter((item) => !item.read) : notifications;

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <ScreenHeader
        title="Notifications"
        subtitle="Stay updated with your progress"
        onBack={onBack}
        rightAction={<TextLink label="Mark all read" onPress={onMarkAllRead} />}
      />

      <SegmentedControl options={["All", "Unread"]} value={tab} onChange={setTab} />

      <View style={styles.stackMd}>
        {visibleNotifications.map((notification) => {
          const tint = notificationTint(notification.type);
          return (
            <AppCard key={notification.id} style={styles.sectionCard}>
              <View style={styles.notificationRow}>
                <View style={[styles.notificationIcon, { backgroundColor: tint.backgroundColor }]}>
                  <Ionicons name={tint.icon} size={18} color={tint.textColor} />
                </View>
                <View style={styles.flexOne}>
                  <Text style={styles.cardBodyStrong}>{notification.title}</Text>
                  <Text style={styles.cardBody}>{notification.message}</Text>
                  <Text style={styles.helperText}>{notification.time}</Text>
                </View>
                {!notification.read ? <View style={styles.unreadDot} /> : null}
              </View>
            </AppCard>
          );
        })}
      </View>
    </ScrollView>
  );
}

function CalendarScreen({ onBack }: { onBack: () => void }) {
  const [currentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const monthLabel = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const days = useMemo(() => buildMonthDays(currentDate), [currentDate]);
  const selectedEvents = dailyEvents.filter((item) => item.day === selectedDay);

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <ScreenHeader title="Calendar" subtitle={monthLabel} onBack={onBack} />

      <AppCard style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Select a day</Text>
        <View style={styles.calendarGrid}>
          {days.map((day) => {
            const active = selectedDay === day;
            const hasEvent = dailyEvents.some((item) => item.day === day);
            return (
              <Pressable
                key={day}
                onPress={() => setSelectedDay(day)}
                style={[styles.calendarDay, active ? styles.calendarDayActive : undefined]}
              >
                <Text style={[styles.calendarDayLabel, active ? styles.calendarDayLabelActive : undefined]}>{day}</Text>
                {hasEvent ? <View style={[styles.calendarEventDot, active ? styles.calendarEventDotActive : undefined]} /> : null}
              </Pressable>
            );
          })}
        </View>
      </AppCard>

      <View style={styles.stackMd}>
        <Text style={styles.sectionTitle}>Events for March {selectedDay}</Text>
        {selectedEvents.length ? (
          selectedEvents.map((event) => (
            <AppCard key={event.id} style={styles.sectionCard}>
              <Text style={styles.cardTitle}>{event.title}</Text>
              <Text style={styles.cardBody}>
                {event.time} · {event.category}
              </Text>
              {event.location ? <Text style={styles.helperText}>{event.location}</Text> : null}
            </AppCard>
          ))
        ) : (
          <AppCard style={styles.sectionCard}>
            <Text style={styles.cardBody}>No events scheduled for this day.</Text>
          </AppCard>
        )}
      </View>
    </ScrollView>
  );
}

function CareerTrackScreen({ onBack }: { onBack: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [goal, setGoal] = useState("Software Engineer at a top tech company");

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <ScreenHeader
        title="Career Track Plan"
        subtitle="Your personalized roadmap"
        onBack={onBack}
        rightAction={
          <Pressable onPress={() => setIsEditing((value) => !value)} style={styles.iconButton}>
            <Feather name={isEditing ? "save" : "edit-2"} size={16} color={palette.primary} />
          </Pressable>
        }
      />

      <AppCard style={styles.primaryBanner}>
        <Text style={styles.bannerEyebrow}>Career goal</Text>
        {isEditing ? (
          <TextInput
            value={goal}
            onChangeText={setGoal}
            multiline
            style={styles.goalInput}
            placeholder="Describe your target role"
            placeholderTextColor="#BFDBFE"
          />
        ) : (
          <Text style={styles.bannerBody}>{goal}</Text>
        )}
      </AppCard>

      <AppCard style={styles.sectionCard}>
        <View style={styles.progressSummaryRow}>
          <Text style={styles.sectionTitle}>Overall progress</Text>
          <Text style={styles.helperText}>35%</Text>
        </View>
        <ProgressBar value={35} />
      </AppCard>

      <View style={styles.stackMd}>
        {careerPhases.map((phase) => (
          <AppCard key={phase.id} style={styles.sectionCard}>
            <View style={styles.cardHeaderSpace}>
              <View style={styles.flexOne}>
                <Text style={styles.cardTitle}>{phase.title}</Text>
                <Text style={styles.cardBody}>{phase.period}</Text>
              </View>
              <Badge
                label={phase.status}
                backgroundColor={phase.status === "In Progress" ? palette.chipBlue : palette.surfaceMuted}
                textColor={phase.status === "In Progress" ? palette.primary : palette.muted}
              />
            </View>
            {phase.status === "In Progress" ? <ProgressBar value={phase.progress} /> : null}
            <View style={styles.stackSm}>
              {phase.milestones.map((milestone) => (
                <View key={milestone.title} style={styles.milestoneRow}>
                  <Ionicons
                    name={milestone.completed ? "checkmark-circle" : "ellipse-outline"}
                    size={18}
                    color={milestone.completed ? palette.success : palette.muted}
                  />
                  <View style={styles.flexOne}>
                    <Text style={styles.cardBodyStrong}>{milestone.title}</Text>
                    <Text style={styles.cardBody}>{milestone.description}</Text>
                    {milestone.progress > 0 ? <ProgressBar value={milestone.progress} /> : null}
                  </View>
                </View>
              ))}
            </View>
          </AppCard>
        ))}
      </View>
    </ScrollView>
  );
}

function TermsScreen({ onBack }: { onBack: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <ScreenHeader title="Terms & Conditions" subtitle="Last updated March 18, 2026" onBack={onBack} />

      <View style={styles.stackMd}>
        {termsSections.map((section) => (
          <AppCard key={section.title} style={styles.sectionCard}>
            <Text style={styles.cardTitle}>{section.title}</Text>
            <Text style={styles.cardBody}>{section.body}</Text>
          </AppCard>
        ))}
      </View>

      <PrimaryButton label="I Understand" onPress={onBack} />
    </ScrollView>
  );
}

export default function App() {
  const [route, setRoute] = useState<Route>("splash");
  const [history, setHistory] = useState<Route[]>([]);
  const [signedUpEmail, setSignedUpEmail] = useState(initialProfile.email);
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    language: "English",
  });
  const [notifications, setNotifications] = useState(notificationSeed);

  const navigate = (next: Route) => {
    if (next === route) {
      return;
    }

    setHistory((current) => [...current, route]);
    setRoute(next);
  };

  const replace = (next: Route) => {
    setRoute(next);
  };

  const reset = (next: Route) => {
    setHistory([]);
    setRoute(next);
  };

  const goBack = (fallback: Route = "dashboard") => {
    if (!history.length) {
      setRoute(fallback);
      return;
    }

    const previous = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setRoute(previous);
  };

  useEffect(() => {
    if (route !== "splash") {
      return;
    }

    const timeout = setTimeout(() => replace("signin"), 1800);
    return () => clearTimeout(timeout);
  }, [route]);

  const activeTab = tabRoutes.includes(route as TabRoute) ? (route as TabRoute) : undefined;

  let screen: ReactNode;

  switch (route) {
    case "splash":
      screen = <SplashScreen />;
      break;
    case "signin":
      screen = <SignInScreen onSignIn={() => reset("dashboard")} onOpenSignUp={() => navigate("signup")} onOpenReset={() => navigate("resetPassword")} />;
      break;
    case "signup":
      screen = (
        <SignUpScreen
          onOpenTerms={() => navigate("terms")}
          onOpenSignIn={() => reset("signin")}
          onContinue={(email) => {
            setSignedUpEmail(email);
            navigate("onboarding");
          }}
        />
      );
      break;
    case "resetPassword":
      screen = <ResetPasswordScreen onBack={() => reset("signin")} />;
      break;
    case "onboarding":
      screen = (
        <OnboardingScreen
          initialEmail={signedUpEmail}
          onComplete={(userProfile) => {
            setProfile(userProfile);
            reset("dashboard");
          }}
        />
      );
      break;
    case "terms":
      screen = <TermsScreen onBack={() => goBack("signin")} />;
      break;
    case "dashboard":
      screen = <DashboardScreen user={profile} onNavigate={navigate} onSignOut={() => reset("signin")} />;
      break;
    case "aiCoach":
      screen = <AICoachScreen />;
      break;
    case "tasks":
      screen = <TasksScreen onNavigateCalendar={() => navigate("calendar")} />;
      break;
    case "goals":
      screen = <GoalsScreen />;
      break;
    case "profile":
      screen = <ProfileScreen user={profile} onNavigateSettings={() => navigate("settings")} />;
      break;
    case "settings":
      screen = (
        <SettingsScreen
          values={settings}
          onChange={setSettings}
          onOpenTerms={() => navigate("terms")}
          onBack={() => goBack("profile")}
          onSignOut={() => reset("signin")}
        />
      );
      break;
    case "notifications":
      screen = (
        <NotificationsScreen
          notifications={notifications}
          onBack={() => goBack("dashboard")}
          onMarkAllRead={() => setNotifications((current) => current.map((item) => ({ ...item, read: true })))}
        />
      );
      break;
    case "calendar":
      screen = <CalendarScreen onBack={() => goBack("dashboard")} />;
      break;
    case "careerTrack":
      screen = <CareerTrackScreen onBack={() => goBack("dashboard")} />;
      break;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.backgroundOrbTop} />
        <View style={styles.backgroundOrbBottom} />
        <View style={styles.shell}>
          {screen}
          {activeTab ? <BottomTabs current={activeTab} onNavigate={(next) => setRoute(next)} /> : null}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  shell: {
    flex: 1,
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
    backgroundColor: palette.background,
  },
  backgroundOrbTop: {
    position: "absolute",
    top: -70,
    right: -20,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#DBEAFE",
    opacity: 0.7,
  },
  backgroundOrbBottom: {
    position: "absolute",
    bottom: 120,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#EDE9FE",
    opacity: 0.55,
  },
  flexOne: {
    flex: 1,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    padding: 18,
  },
  screenContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    gap: 16,
  },
  screenHeader: {
    marginBottom: 6,
  },
  screenHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  screenHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: palette.text,
  },
  screenSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: palette.muted,
  },
  tabsBar: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.96)",
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 14 : 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  tabIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIconWrapActive: {
    backgroundColor: "#DBEAFE",
  },
  tabLabel: {
    fontSize: 11,
    color: palette.muted,
    fontWeight: "600",
  },
  tabLabelActive: {
    color: palette.primary,
  },
  splash: {
    flex: 1,
    backgroundColor: palette.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  splashOrbOne: {
    position: "absolute",
    top: 110,
    left: 24,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  splashOrbTwo: {
    position: "absolute",
    bottom: 140,
    right: 18,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(191,219,254,0.15)",
  },
  splashCard: {
    width: 132,
    height: 132,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  splashSparkle: {
    position: "absolute",
    top: 12,
    right: 14,
  },
  splashTitle: {
    fontSize: 40,
    fontWeight: "800",
    color: palette.surface,
    marginBottom: 12,
  },
  splashSubtitle: {
    maxWidth: 260,
    textAlign: "center",
    fontSize: 17,
    lineHeight: 24,
    color: "rgba(255,255,255,0.9)",
  },
  loadingDots: {
    flexDirection: "row",
    gap: 8,
    marginTop: 28,
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.surface,
  },
  authScroll: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    justifyContent: "center",
    minHeight: "100%",
    gap: 18,
  },
  authHero: {
    alignItems: "center",
    gap: 10,
  },
  logoBubble: {
    width: 74,
    height: 74,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.8)",
    alignItems: "center",
    justifyContent: "center",
    ...cardShadow.shadow,
  },
  authTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: palette.text,
    textAlign: "center",
  },
  authSubtitle: {
    maxWidth: 300,
    textAlign: "center",
    color: palette.muted,
    lineHeight: 22,
  },
  authCard: {
    gap: 14,
  },
  authFooter: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    alignItems: "center",
  },
  authFooterText: {
    color: palette.muted,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: palette.text,
  },
  inputWrapper: {
    justifyContent: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 14,
    zIndex: 2,
  },
  input: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#F8FBFF",
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 16,
    color: palette.text,
  },
  inputWithIcon: {
    paddingLeft: 42,
  },
  pickerWrapper: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#F8FBFF",
    borderWidth: 1,
    borderColor: palette.border,
    justifyContent: "center",
  },
  picker: {
    marginHorizontal: 4,
    color: palette.text,
  },
  inlineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  link: {
    color: palette.primary,
    fontWeight: "700",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surface,
  },
  checkboxChecked: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  checkboxText: {
    flex: 1,
    color: palette.muted,
    lineHeight: 20,
  },
  errorText: {
    color: palette.danger,
    fontWeight: "600",
  },
  button: {
    minHeight: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  buttonPrimary: {
    backgroundColor: palette.primary,
  },
  buttonSecondary: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: "800",
  },
  buttonLabelPrimary: {
    color: palette.surface,
  },
  buttonLabelSecondary: {
    color: palette.text,
  },
  centeredBlock: {
    alignItems: "center",
    gap: 12,
  },
  successIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.chipGreen,
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: palette.text,
  },
  confirmText: {
    color: palette.muted,
    textAlign: "center",
    lineHeight: 22,
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
  progressSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  helperText: {
    color: palette.muted,
    fontSize: 13,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  stackMd: {
    gap: 14,
  },
  stackSm: {
    gap: 10,
  },
  stackXs: {
    gap: 8,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: palette.border,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: 100,
    alignItems: "center",
    gap: 6,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "800",
    color: palette.text,
  },
  metricLabel: {
    textAlign: "center",
    color: palette.muted,
    fontSize: 12,
  },
  primaryBanner: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
    gap: 8,
  },
  bannerEyebrow: {
    color: "#BFDBFE",
    fontWeight: "700",
    textTransform: "uppercase",
    fontSize: 12,
    letterSpacing: 0.8,
  },
  bannerBody: {
    color: palette.surface,
    lineHeight: 22,
    fontSize: 16,
  },
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: palette.text,
  },
  quickAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#F8FBFF",
    borderWidth: 1,
    borderColor: palette.border,
  },
  quickActionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: palette.chipBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionTitle: {
    fontWeight: "700",
    color: palette.text,
  },
  quickActionSubtitle: {
    color: palette.muted,
    marginTop: 2,
  },
  timelineRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 5,
    backgroundColor: "#CBD5E1",
  },
  timelineDotDone: {
    backgroundColor: palette.success,
  },
  timelineTask: {
    fontWeight: "700",
    color: palette.text,
  },
  timelineTaskDone: {
    color: palette.muted,
    textDecorationLine: "line-through",
  },
  timelineTime: {
    marginTop: 2,
    color: palette.muted,
  },
  cardHeaderSpace: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: palette.text,
  },
  cardBody: {
    color: palette.muted,
    lineHeight: 21,
    marginTop: 4,
  },
  cardBodyStrong: {
    color: palette.text,
    fontWeight: "700",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  promptsContainer: {
    maxHeight: 56,
  },
  promptStrip: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 8,
  },
  promptChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  promptChipText: {
    color: palette.text,
    fontWeight: "600",
  },
  chatBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 14,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  messageRowUser: {
    justifyContent: "flex-end",
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  auraAvatar: {
    backgroundColor: palette.primary,
  },
  userAvatar: {
    backgroundColor: palette.secondary,
  },
  messageBubble: {
    maxWidth: "82%",
    borderRadius: 18,
    padding: 14,
    gap: 8,
  },
  messageBubbleAura: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  messageBubbleUser: {
    backgroundColor: palette.primary,
  },
  messageText: {
    color: palette.text,
    lineHeight: 21,
  },
  messageTextUser: {
    color: palette.surface,
  },
  messageTime: {
    color: palette.muted,
    fontSize: 12,
  },
  messageTimeUser: {
    color: "rgba(255,255,255,0.72)",
  },
  typingText: {
    color: palette.muted,
    fontStyle: "italic",
  },
  chatInputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    backgroundColor: "rgba(255,255,255,0.94)",
  },
  chatInput: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    color: palette.text,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.primary,
  },
  segmented: {
    flexDirection: "row",
    backgroundColor: palette.surfaceMuted,
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: palette.surface,
    ...cardShadow.shadow,
  },
  segmentLabel: {
    color: palette.muted,
    fontWeight: "700",
  },
  segmentLabelActive: {
    color: palette.primary,
  },
  boardRow: {
    flexDirection: "row",
    gap: 14,
    paddingVertical: 6,
  },
  boardColumn: {
    width: 230,
    gap: 10,
  },
  boardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: palette.text,
  },
  boardCard: {
    gap: 6,
  },
  smallMetricCard: {
    minWidth: 74,
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  smallMetricValue: {
    fontSize: 20,
    fontWeight: "800",
    color: palette.primary,
  },
  smallMetricLabel: {
    fontSize: 12,
    color: palette.muted,
    textAlign: "center",
  },
  milestoneRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
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
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  notificationRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  notificationIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.primary,
    marginTop: 6,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  calendarDay: {
    width: "13.5%",
    aspectRatio: 1,
    minWidth: 42,
    borderRadius: 14,
    backgroundColor: "#F8FBFF",
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  calendarDayActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  calendarDayLabel: {
    color: palette.text,
    fontWeight: "700",
  },
  calendarDayLabelActive: {
    color: palette.surface,
  },
  calendarEventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.primary,
  },
  calendarEventDotActive: {
    backgroundColor: palette.surface,
  },
  goalInput: {
    minHeight: 84,
    color: palette.surface,
    fontSize: 16,
    lineHeight: 22,
  },
});
