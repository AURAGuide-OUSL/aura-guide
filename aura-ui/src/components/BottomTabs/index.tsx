import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { palette } from "../../theme";
import { TabRoute } from "../../types";
import { tabRoutes } from "../../constants";

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

export function BottomTabs({ current, onNavigate }: { current: TabRoute; onNavigate: (route: TabRoute) => void }) {
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

const styles = StyleSheet.create({
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
});
