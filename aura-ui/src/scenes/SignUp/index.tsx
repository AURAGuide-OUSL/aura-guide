import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { AppCard } from "../../components/AppCard";
import { InputField } from "../../components/InputField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { TextLink } from "../../components/TextLink";
import { useTheme } from "../../theme/ThemeContext";
import { api } from "../../api/api";

export type SignUpDraft = {
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  showPassword: boolean;
  emailChecked: boolean;
};

export function SignUpScreen({
  draft,
  onDraftChange,
  onOpenTerms,
  onOpenSignIn,
  onContinue,
}: {
  draft: SignUpDraft;
  onDraftChange: (next: SignUpDraft) => void;
  onOpenTerms: () => void;
  onOpenSignIn: () => void;
  onContinue: (email: string, password: string) => void;
}) {
  const { colors } = useTheme();
  const [error, setError] = React.useState("");
  const [checkingEmail, setCheckingEmail] = React.useState(false);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const patch = (partial: Partial<SignUpDraft>) => onDraftChange({ ...draft, ...partial });

  const styles = useMemo(
    () =>
      StyleSheet.create({
        authScroll: {
          paddingHorizontal: 20,
          paddingVertical: 28,
          justifyContent: "center",
          minHeight: "100%",
          gap: 18,
          backgroundColor: colors.background,
        },
        authHero: { alignItems: "center", gap: 10 },
        logoBubble: {
          width: 74,
          height: 74,
          borderRadius: 24,
          backgroundColor: colors.surface,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: colors.border,
        },
        authTitle: { fontSize: 30, fontWeight: "800", color: colors.text, textAlign: "center" },
        authSubtitle: { maxWidth: 300, textAlign: "center", color: colors.muted, lineHeight: 22 },
        authCard: { gap: 14 },
        authFooter: { flexDirection: "row", justifyContent: "center", gap: 6, alignItems: "center" },
        authFooterText: { color: colors.muted },
        inlineRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
        checkboxRow: { flexDirection: "row", alignItems: "center", gap: 10 },
        checkbox: {
          width: 20,
          height: 20,
          borderRadius: 6,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.surface,
        },
        checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
        checkboxText: { flex: 1, color: colors.muted, lineHeight: 20 },
        errorText: { color: colors.danger, fontWeight: "600" },
        actionsRow: { flexDirection: "row", gap: 12 },
      }),
    [colors],
  );

  const validateEmail = async () => {
    const normalizedEmail = draft.email.trim().toLowerCase();
    if (!emailPattern.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      patch({ emailChecked: false });
      return false;
    }

    try {
      setCheckingEmail(true);
      await api.validateSignupEmail(normalizedEmail);
      setError("");
      patch({ emailChecked: true });
      return true;
    } catch (err) {
      const message = (err as Error).message || "Email validation failed";
      setError(message);
      patch({ emailChecked: false });
      return false;
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleContinue = async () => {
    const isEmailValid = draft.emailChecked ? true : await validateEmail();
    if (!isEmailValid) return;

    if (!draft.email || !draft.password || !draft.confirmPassword) {
      setError("Fill in all fields before continuing.");
      return;
    }

    if (draft.password !== draft.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!draft.acceptTerms) {
      setError("Accept the terms and conditions to continue.");
      return;
    }

    setError("");
    onContinue(draft.email.trim().toLowerCase(), draft.password);
  };

  return (
    <ScrollView contentContainerStyle={styles.authScroll}>
      <View style={styles.authHero}>
        <View style={styles.logoBubble}>
          <Ionicons name="sparkles" size={34} color={colors.primary} />
        </View>
        <Text style={styles.authTitle}>Join AURA Guide</Text>
        <Text style={styles.authSubtitle}>Create your account and set up your growth plan.</Text>
      </View>

      <AppCard style={styles.authCard}>
        <InputField
          label="Email"
          placeholder="you@university.edu"
          value={draft.email}
          onChangeText={(value) => {
            patch({ email: value, emailChecked: false });
            if (error) setError("");
          }}
          keyboardType="email-address"
          icon={<Feather name="mail" size={18} color={colors.muted} />}
        />

        <InputField
          label="Password"
          placeholder="Create a strong password"
          value={draft.password}
          onChangeText={async (value) => {
            if (!draft.emailChecked && !checkingEmail) {
              await validateEmail();
            }
            patch({ password: value });
          }}
          secureTextEntry={!draft.showPassword}
          icon={<Feather name="lock" size={18} color={colors.muted} />}
        />

        <InputField
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={draft.confirmPassword}
          onChangeText={(value) => patch({ confirmPassword: value })}
          secureTextEntry={!draft.showPassword}
          icon={<Feather name="lock" size={18} color={colors.muted} />}
        />

        <View style={styles.inlineRow}>
          <TextLink
            label={draft.showPassword ? "Hide passwords" : "Show passwords"}
            onPress={() => patch({ showPassword: !draft.showPassword })}
          />
          <TextLink label="View terms" onPress={onOpenTerms} />
        </View>

        <Pressable onPress={() => patch({ acceptTerms: !draft.acceptTerms })} style={styles.checkboxRow}>
          <View style={[styles.checkbox, draft.acceptTerms ? styles.checkboxChecked : undefined]}>
            {draft.acceptTerms ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}
          </View>
          <Text style={styles.checkboxText}>
            I accept the Terms and Conditions (Last updated: May 2026) and Privacy Policy
          </Text>
        </Pressable>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.actionsRow}>
          <PrimaryButton label="Back" onPress={onOpenSignIn} secondary />
          <PrimaryButton label={checkingEmail ? "Checking..." : "Create Account"} onPress={handleContinue} disabled={checkingEmail} />
        </View>
      </AppCard>

      <View style={styles.authFooter}>
        <Text style={styles.authFooterText}>Already registered?</Text>
        <TextLink label="Sign in here" onPress={onOpenSignIn} />
      </View>
    </ScrollView>
  );
}
