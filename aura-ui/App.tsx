import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { palette } from "./src/theme";
import { Route, TabRoute, UserProfile } from "./src/types";
import { initialProfile, tabRoutes } from "./src/constants";
import { notificationSeed } from "./src-native/mockData";

// Components
import { BottomTabs } from "./src/components/BottomTabs";

// Scenes
import { SplashScreen } from "./src/scenes/Splash";
import { SignInScreen } from "./src/scenes/SignIn";
import { SignUpScreen } from "./src/scenes/SignUp";
import { ResetPasswordScreen } from "./src/scenes/ResetPassword";
import { OnboardingScreen } from "./src/scenes/Onboarding";
import { DashboardScreen } from "./src/scenes/Dashboard";
import { AICoachScreen } from "./src/scenes/AICoach";
import { TasksScreen } from "./src/scenes/Tasks";
import { GoalsScreen } from "./src/scenes/Goals";
import { ProfileScreen } from "./src/scenes/Profile";
import { SettingsScreen } from "./src/scenes/Settings";
import { NotificationsScreen } from "./src/scenes/Notifications";
import { CalendarScreen } from "./src/scenes/Calendar";
import { CareerTrackScreen } from "./src/scenes/CareerTrack";
import { TermsScreen } from "./src/scenes/Terms";

export default function App() {
  const [route, setRoute] = useState<Route>("splash");
  const [tab, setTab] = useState<TabRoute>("dashboard");
  const [user, setUser] = useState<UserProfile>(initialProfile);
  const [notifications, setNotifications] = useState(notificationSeed);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    language: "English (US)",
  });

  useEffect(() => {
    const timer = setTimeout(() => setRoute("signin"), 2200);
    return () => clearTimeout(timer);
  }, []);

  const handleSignIn = () => setRoute("dashboard");
  const handleSignUp = (email: string) => {
    setUser((prev) => ({ ...prev, email }));
    setRoute("onboarding");
  };
  const handleOnboardingComplete = (profile: UserProfile) => {
    setUser(profile);
    setRoute("dashboard");
  };
  const handleSignOut = () => {
    setRoute("signin");
    setTab("dashboard");
  };

  const activeRoute = tabRoutes.includes(route as any) ? tab : route;

  const renderContent = () => {
    switch (activeRoute) {
      case "splash":
        return <SplashScreen />;
      case "signin":
        return (
          <SignInScreen
            onSignIn={handleSignIn}
            onOpenSignUp={() => setRoute("signup")}
            onOpenReset={() => setRoute("resetPassword")}
          />
        );
      case "signup":
        return (
          <SignUpScreen
            onOpenTerms={() => setRoute("terms")}
            onOpenSignIn={() => setRoute("signin")}
            onContinue={handleSignUp}
          />
        );
      case "resetPassword":
        return <ResetPasswordScreen onBack={() => setRoute("signin")} />;
      case "onboarding":
        return <OnboardingScreen initialEmail={user.email} onComplete={handleOnboardingComplete} />;
      case "dashboard":
        return <DashboardScreen user={user} onNavigate={setRoute} onSignOut={handleSignOut} />;
      case "aiCoach":
        return <AICoachScreen />;
      case "tasks":
        return <TasksScreen onNavigateCalendar={() => setRoute("calendar")} />;
      case "goals":
        return <GoalsScreen />;
      case "profile":
        return <ProfileScreen user={user} onNavigateSettings={() => setRoute("settings")} />;
      case "settings":
        return (
          <SettingsScreen
            values={settings}
            onChange={setSettings}
            onOpenTerms={() => setRoute("terms")}
            onBack={() => setRoute("profile")}
            onSignOut={handleSignOut}
          />
        );
      case "notifications":
        return (
          <NotificationsScreen
            notifications={notifications}
            onBack={() => setRoute("dashboard")}
            onMarkAllRead={() => setNotifications((n) => n.map((item) => ({ ...item, read: true })))}
          />
        );
      case "calendar":
        return <CalendarScreen onBack={() => setRoute("dashboard")} />;
      case "careerTrack":
        return <CareerTrackScreen onBack={() => setRoute("dashboard")} />;
      case "terms":
        return <TermsScreen onBack={() => setRoute("signup")} />;
      default:
        return null;
    }
  };

  const showTabs = tabRoutes.includes(activeRoute as any);

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="dark" />
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
          {renderContent()}
        </SafeAreaView>
        {showTabs && <BottomTabs current={tab} onNavigate={(route) => setTab(route)} />}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  safeArea: {
    flex: 1,
  },
});
