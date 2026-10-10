import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { theme } from "../theme.js";

export function OverviewScreen({ tasks = [] }) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "Done").length;
  const pending = tasks.filter((t) => t.status !== "Done").length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
  const currentDayIndex = new Date().getDay();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Daily Workload Card - Directly inspired by reference UI */}
      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardKicker}>DAILY WORKLOAD</Text>
          <Text style={styles.kickerMeta}>This Week</Text>
        </View>

        {/* Day Pills Bar */}
        <View style={styles.weekRow}>
          {daysOfWeek.map((day, idx) => {
            const isToday = idx === currentDayIndex;
            return (
              <View
                key={`${day}-${idx}`}
                style={[styles.dayColumn, isToday && styles.dayColumnActive]}
              >
                <View
                  style={[
                    styles.barIndicator,
                    isToday && styles.barIndicatorActive,
                    isToday && total > 0 && styles.barIndicatorFilled
                  ]}
                />
                <Text style={[styles.dayLabel, isToday && styles.dayLabelActive]}>
                  {day}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Workload summary pill box */}
        <View style={styles.summaryBox}>
          <View>
            <Text style={styles.summaryTitle}>Today</Text>
            <Text style={styles.summarySubtitle}>
              {pending} pending · {completed} completed
            </Text>
          </View>
          <View style={styles.rateBadge}>
            <Text style={styles.rateVal}>{completionRate}%</Text>
            <Text style={styles.rateSub}>Done</Text>
          </View>
        </View>
      </View>

      {/* Recommendation & Schedule Health Card */}
      <View style={styles.cardTinted}>
        <Text style={styles.cardKickerTinted}>SCHEDULE HEALTH</Text>
        <Text style={styles.headingTinted}>
          {pending === 0
            ? "All tasks cleared for today"
            : `${pending} task${pending === 1 ? "" : "s"} scheduled`}
        </Text>
        <Text style={styles.bodyTinted}>
          {pending === 0
            ? "Your schedule is currently clear. Tap + to set new reminders anytime."
            : "Tasks with set times will alert you with in-app audio banners."}
        </Text>

        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Cloud Synchronization: Active</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 24
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5ECE8",
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16
  },
  cardKicker: {
    fontSize: 12,
    fontWeight: "900",
    color: "#4A6B60",
    letterSpacing: 0.8
  },
  kickerMeta: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7E998E"
  },
  weekRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginBottom: 16
  },
  dayColumn: {
    alignItems: "center",
    width: 38,
    paddingVertical: 8,
    borderRadius: 14
  },
  dayColumnActive: {
    backgroundColor: "#E2ECE6"
  },
  barIndicator: {
    width: 14,
    height: 32,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "#D2DFD8",
    backgroundColor: "transparent",
    marginBottom: 8
  },
  barIndicatorActive: {
    borderColor: theme.colors.primary,
    borderWidth: 2
  },
  barIndicatorFilled: {
    backgroundColor: theme.colors.primary
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7E998E"
  },
  dayLabelActive: {
    color: theme.colors.primary,
    fontWeight: "900"
  },
  summaryBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F2F6F4",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    marginBottom: 2
  },
  summarySubtitle: {
    fontSize: 12,
    color: "#5B756B"
  },
  rateBadge: {
    alignItems: "flex-end"
  },
  rateVal: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.colors.primary
  },
  rateSub: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B857B"
  },
  cardTinted: {
    backgroundColor: "#E2ECE6",
    borderRadius: 24,
    padding: 20
  },
  cardKickerTinted: {
    fontSize: 12,
    fontWeight: "900",
    color: "#2C5245",
    letterSpacing: 0.8,
    marginBottom: 6
  },
  headingTinted: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F2E24",
    marginBottom: 6
  },
  bodyTinted: {
    fontSize: 13,
    color: "#3F6154",
    lineHeight: 18,
    marginBottom: 16
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignSelf: "flex-start"
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#15803D",
    marginRight: 8
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1B3B30"
  }
});
