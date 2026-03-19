import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { palette } from "../../theme";
import { AppCard } from "../../components/AppCard";
import { InputField } from "../../components/InputField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { TextLink } from "../../components/TextLink";

export function SignUpScreen({
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
});
