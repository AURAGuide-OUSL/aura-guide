import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { palette } from "../../theme";

export function SplashScreen() {
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

const styles = StyleSheet.create({
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
});
