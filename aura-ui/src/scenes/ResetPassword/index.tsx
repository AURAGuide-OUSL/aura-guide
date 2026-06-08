import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { palette } from "../../theme";
import { AppCard } from "../../components/AppCard";
import { InputField } from "../../components/InputField";
import { PrimaryButton } from "../../components/PrimaryButton";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ResetPasswordScreen({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = () => {
    const normalized = email.trim().toLowerCase();
    if (!normalized || !emailPattern.test(normalized)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setSent(true);
    Alert.alert(
      "Reset not configured",
      "Password reset by email is not enabled in this build. Contact your administrator or sign in with your existing password.",
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.authScroll}>
      <View style={styles.authHero}>
        <View style={styles.logoBubble}>
          <Feather name="mail" size={34} color={palette.primary} />
        </View>
        <Text style={styles.authTitle}>Reset Password</Text>
        <Text style={styles.authSubtitle}>
          {sent ? "If an account exists, you will receive reset instructions." : "Enter your email to request a reset link."}
        </Text>
      </View>

      <AppCard style={styles.authCard}>
        {!sent ? (
          <>
            <InputField
              label="Email"
              placeholder="you@university.edu"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (error) setError("");
              }}
              keyboardType="email-address"
              icon={<Feather name="mail" size={18} color={palette.muted} />}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <PrimaryButton label="Send Reset Link" onPress={submit} disabled={!email.trim()} />
            <PrimaryButton label="Back to Sign In" onPress={onBack} secondary />
          </>
        ) : (
          <View style={styles.centeredBlock}>
            <View style={styles.successIcon}>
              <Feather name="check" size={24} color={palette.success} />
            </View>
            <Text style={styles.confirmTitle}>Request received</Text>
            <Text style={styles.confirmText}>
              If {email.trim()} is registered, reset instructions will be sent when email delivery is enabled.
            </Text>
            <PrimaryButton label="Back to Sign In" onPress={onBack} secondary />
          </View>
        )}
      </AppCard>
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
  errorText: {
    color: palette.danger,
    fontWeight: "600",
  },
});
