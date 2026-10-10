import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../theme.js";

export function Header({ tasks = [] }) {
  const pendingCount = tasks.filter(t => t.status !== "Done").length;
  const doneCount = tasks.filter(t => t.status === "Done").length;

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
            <Text style={styles.statHighlight}>{pendingCount}</Text> PENDING
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
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.bg
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  brandText: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 2,
    color: theme.colors.textPrimary
  },
  accentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.accent,
    marginLeft: 6
  },
  dateText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    color: theme.colors.textMuted
  },
  statsRow: {
    flexDirection: "row",
    gap: 8
  },
  statPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  statPillDone: {
    borderColor: "rgba(16, 185, 129, 0.2)"
  },
  statText: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    letterSpacing: 0.5
  },
  statHighlight: {
    color: theme.colors.accent
  },
  statDoneHighlight: {
    color: theme.colors.done
  }
});
