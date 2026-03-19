import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { palette } from "../../theme";
import { AppCard } from "../../components/AppCard";
import { InputField } from "../../components/InputField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { TextLink } from "../../components/TextLink";
import { initialProfile } from "../../constants";

export function SignInScreen({
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

const styles = StyleSheet.create({
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
  inlineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
});
