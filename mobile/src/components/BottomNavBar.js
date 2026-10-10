import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { theme } from "../theme.js";

export function BottomNavBar({ activeTab, onSelectTab, onOpenAgentPrompt }) {
  const tabs = [
    { key: "tasks", label: "Tasks", icon: "✓" },
    { key: "categories", label: "Categories", icon: "▦" },
    { key: "center_add", isCenter: true },
    { key: "completed", label: "Completed", icon: "★" },
    { key: "overview", label: "Overview", icon: "⚙" }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {tabs.map((tab) => {
          if (tab.isCenter) {
            return (
              <View key="center" style={styles.centerSlot}>
                <TouchableOpacity
                  style={styles.centerBtn}
                  onPress={onOpenAgentPrompt}
                  activeOpacity={0.85}
                >
                  <Text style={styles.centerPlusIcon}>+</Text>
                </TouchableOpacity>
              </View>
            );
          }

          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => onSelectTab(tab.key)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
                  {tab.icon}
                </Text>
              </View>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent"
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 24 : 10,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16
  },
  tabItemActive: {},
  iconWrap: {
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2
  },
  iconWrapActive: {
    backgroundColor: theme.colors.primaryLight
  },
  tabIcon: {
    fontSize: 16,
    color: theme.colors.textMuted
  },
  tabIconActive: {
    color: theme.colors.primary,
    fontWeight: "bold"
  },
  tabLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: "600",
    letterSpacing: 0.2
  },
  tabLabelActive: {
    color: theme.colors.primary,
    fontWeight: "800"
  },
  centerSlot: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    marginTop: -22
  },
  centerBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 3,
    borderColor: theme.colors.surface
  },
  centerPlusIcon: {
    fontSize: 26,
    color: "#FFFFFF",
    fontWeight: "300",
    lineHeight: 28,
    marginTop: -2
  }
});
