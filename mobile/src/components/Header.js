import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../theme.js";

export function Header({ activeTab = "tasks" }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  });

  const tabTitles = {
    tasks: "Today's Schedule",
    categories: "Categories",
    completed: "Completed",
    overview: "Insights"
  };

  const title = tabTitles[activeTab] || "DailyDo";

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View>
          <Text style={styles.brandSubtitle}>DAILYDO</Text>
          <Text style={styles.titleText}>{title}</Text>
        </View>
        <View style={styles.dateBadge}>
          <Text style={styles.dateText}>{today}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: "#EBF0ED"
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#6B857B",
    letterSpacing: 1.2,
    marginBottom: 2
  },
  titleText: {
    fontSize: 20,
    fontWeight: "900",
    color: theme.colors.primary,
    letterSpacing: -0.3
  },
  dateBadge: {
    backgroundColor: "#F0F5F2",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2EBE5"
  },
  dateText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary
  }
});
