import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { theme } from "../theme.js";
import {
  TasksTabIcon,
  CategoriesTabIcon,
  CenterPlusIcon
} from "./Icons.js";

export function BottomNavBar({ activeTab, onSelectTab, onOpenAgentPrompt }) {
  const isTasksActive = activeTab === "tasks";
  const isCategoriesActive = activeTab === "categories";

  return (
    <View style={styles.dock}>
      <View style={styles.bar}>
        {/* Left: Tasks */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => onSelectTab("tasks")}
          activeOpacity={0.7}
        >
          <View style={[styles.iconPill, isTasksActive && styles.iconPillActive]}>
            <TasksTabIcon
              color={isTasksActive ? theme.colors.primary : "#6B857B"}
              size={19}
            />
          </View>
          <Text style={[styles.tabLabel, isTasksActive && styles.tabLabelActive]}>
            Tasks
          </Text>
        </TouchableOpacity>

        {/* Center: Elevated Add Button */}
        <View style={styles.centerSlot}>
          <TouchableOpacity
            style={styles.centerBtn}
            onPress={onOpenAgentPrompt}
            activeOpacity={0.85}
            accessibilityLabel="Add smart reminder"
          >
            <CenterPlusIcon color="#FFFFFF" size={24} />
          </TouchableOpacity>
          <Text style={styles.centerLabel}>Add</Text>
        </View>

        {/* Right: Categories */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => onSelectTab("categories")}
          activeOpacity={0.7}
        >
          <View style={[styles.iconPill, isCategoriesActive && styles.iconPillActive]}>
            <CategoriesTabIcon
              color={isCategoriesActive ? theme.colors.primary : "#6B857B"}
              size={19}
            />
          </View>
          <Text style={[styles.tabLabel, isCategoriesActive && styles.tabLabelActive]}>
            Categories
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: "#E2ECE6",
    overflow: "visible"
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: theme.colors.surface,
    paddingTop: 8,
    paddingBottom: Platform.OS === "android" ? 16 : 28,
    paddingHorizontal: 24,
    overflow: "visible"
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80
  },
  iconPill: {
    width: 52,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent"
  },
  iconPillActive: {
    backgroundColor: "#DCE8E1"
  },
  tabLabel: {
    fontSize: 11,
    color: "#6B857B",
    fontWeight: "600",
    letterSpacing: 0.1,
    marginTop: 3
  },
  tabLabelActive: {
    color: theme.colors.primary,
    fontWeight: "800"
  },
  centerSlot: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
    overflow: "visible"
  },
  centerBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -22,
    borderWidth: 3.5,
    borderColor: theme.colors.surface,
    shadowColor: "#0E382F",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 8
  },
  centerLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: theme.colors.primary,
    letterSpacing: 0.1,
    marginTop: 3
  }
});
