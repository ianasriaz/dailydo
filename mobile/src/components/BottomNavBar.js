import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { theme } from "../theme.js";
import {
  TasksTabIcon,
  CategoriesTabIcon,
  CompletedTabIcon,
  InsightsTabIcon,
  CenterPlusIcon
} from "./Icons.js";

export function BottomNavBar({ activeTab, onSelectTab, onOpenAgentPrompt }) {
  const tabs = [
    { key: "tasks", label: "Tasks", Icon: TasksTabIcon },
    { key: "categories", label: "Categories", Icon: CategoriesTabIcon },
    { key: "center_add", isCenter: true },
    { key: "completed", label: "Completed", Icon: CompletedTabIcon },
    { key: "overview", label: "Insights", Icon: InsightsTabIcon }
  ];

  return (
    <View style={styles.dock}>
      <View style={styles.bar}>
        {tabs.map((tab) => {
          if (tab.isCenter) {
            return (
              <View key="center" style={styles.centerSlot}>
                <TouchableOpacity
                  style={styles.centerBtn}
                  onPress={onOpenAgentPrompt}
                  activeOpacity={0.88}
                  accessibilityLabel="Add reminder"
                >
                  <CenterPlusIcon color="#FFFFFF" size={24} />
                </TouchableOpacity>
              </View>
            );
          }

          const isActive = activeTab === tab.key;
          const IconComponent = tab.Icon;
          const iconColor = isActive ? theme.colors.primary : "#6B857B";

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => onSelectTab(tab.key)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconPill, isActive && styles.iconPillActive]}>
                <IconComponent color={iconColor} size={20} />
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
  dock: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: "#E5EBE7",
    overflow: "visible"
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: theme.colors.surface,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 22 : 10,
    paddingHorizontal: 8,
    overflow: "visible"
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1
  },
  iconPill: {
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3
  },
  iconPillActive: {
    backgroundColor: "#DCE8E1"
  },
  tabLabel: {
    fontSize: 11,
    color: "#6B857B",
    fontWeight: "600",
    letterSpacing: 0.1
  },
  tabLabelActive: {
    color: theme.colors.primary,
    fontWeight: "800"
  },
  centerSlot: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    overflow: "visible"
  },
  centerBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -24,
    borderWidth: 3.5,
    borderColor: theme.colors.surface,
    shadowColor: "#0E382F",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 8
  }
});
