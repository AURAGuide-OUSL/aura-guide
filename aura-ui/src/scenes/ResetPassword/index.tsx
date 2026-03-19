import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { palette } from "../../theme";
import { AppCard } from "../../components/AppCard";
import { InputField } from "../../components/InputField";
import { PrimaryButton } from "../../components/PrimaryButton";

export function ResetPasswordScreen({ onBack }: { onBack: () => void }) {
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
});
