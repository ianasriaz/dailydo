import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../theme.js";

export function Header({ tasks = [] }) {
  const pendingCount = tasks.filter((t) => t.status !== "Done").length;
  const doneCount = tasks.filter((t) => t.status === "Done").length;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <Text style={styles.brandText}>DAILYDO</Text>
          <View style={styles.accentDot} />
        </View>
        <Text style={styles.dateText}>{today}</Text>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statPill}>
          <Text style={styles.statText}>
            <Text style={styles.statHighlight}>{pendingCount}</Text> ACTIVE
          </Text>
        </View>
        <View style={[styles.statPill, styles.statPillDone]}>
          <Text style={styles.statText}>
            <Text style={styles.statDoneHighlight}>{doneCount}</Text> DONE
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  brandText: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: theme.colors.primary
  },
  accentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginLeft: 6
  },
  dateText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: theme.colors.textMuted
  },
  statsRow: {
    flexDirection: "row",
    gap: 8
  },
  statPill: {
    paddingVertical: 3,
    paddingHorizontal: 9,
    backgroundColor: theme.colors.bg,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  statPillDone: {
    backgroundColor: "#DCFCE7",
    borderColor: "#BBF7D0"
  },
  statText: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    letterSpacing: 0.5
  },
  statHighlight: {
    color: theme.colors.primary,
    fontWeight: "900"
  },
  statDoneHighlight: {
    color: "#15803D",
    fontWeight: "900"
  }
});
