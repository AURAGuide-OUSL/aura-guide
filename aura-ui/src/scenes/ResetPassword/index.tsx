import React, { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AppCard } from "../../components/AppCard";
import { InputField } from "../../components/InputField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { useTheme } from "../../theme/ThemeContext";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ResetPasswordScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

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
        authTitle: {
          fontSize: 30,
          fontWeight: "800",
          color: colors.text,
          textAlign: "center",
        },
        authSubtitle: {
          maxWidth: 320,
          textAlign: "center",
          color: colors.muted,
          lineHeight: 22,
          fontWeight: "600",
        },
        authCard: { gap: 14 },
        errorText: { color: colors.danger, fontWeight: "600" },
        notice: {
          color: colors.muted,
          fontSize: 13,
          lineHeight: 20,
          fontWeight: "600",
        },
      }),
    [colors],
  );

  const submit = () => {
    const normalized = email.trim().toLowerCase();
    if (!normalized || !emailPattern.test(normalized)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    Alert.alert(
      "Email reset not available",
      "Password reset by email is not enabled in this version. Please sign in with your existing password or contact your administrator.",
      [{ text: "OK", onPress: onBack }],
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.authScroll}>
      <View style={styles.authHero}>
        <View style={styles.logoBubble}>
          <Feather name="mail" size={34} color={colors.primary} />
        </View>
        <Text style={styles.authTitle}>Reset Password</Text>
        <Text style={styles.authSubtitle}>
          Email-based password reset is not configured for this app yet.
        </Text>
      </View>

      <AppCard style={styles.authCard}>
        <Text style={styles.notice}>
          If you forgot your password, use an account you can still access or ask your course administrator to help.
          We do not send reset links until an email service is connected on the server.
        </Text>
        <InputField
          label="Email (for your records)"
          placeholder="you@university.edu"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (error) setError("");
          }}
          keyboardType="email-address"
          icon={<Feather name="mail" size={18} color={colors.muted} />}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <PrimaryButton label="Continue" onPress={submit} disabled={!email.trim()} />
        <PrimaryButton label="Back to Sign In" onPress={onBack} secondary />
      </AppCard>
    </ScrollView>
  );
}
