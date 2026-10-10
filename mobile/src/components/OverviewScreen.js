import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { theme } from "../theme.js";

export function OverviewScreen({ tasks = [], categories = [] }) {
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
      <View style={styles.header}>
        <Text style={styles.title}>INSIGHTS & PROFILE</Text>
        <Text style={styles.subtitle}>Daily productivity and schedule health</Text>
      </View>

      {/* Daily Progress Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeaderTitle}>DAILY COMPLETION</Text>
        <Text style={styles.cardHeaderDesc}>
          {total === 0
            ? "No tasks logged yet today. Add tasks to start tracking your completion."
            : `${completed} of ${total} tasks accomplished today.`}
        </Text>

        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>{completionRate}%</Text>
            <Text style={styles.metricLbl}>Completion Rate</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>{pending}</Text>
            <Text style={styles.metricLbl}>Active Tasks</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>{completed}</Text>
            <Text style={styles.metricLbl}>Done</Text>
          </View>
        </View>
      </View>

      {/* Weekly Rhythm Card (Inspired by reference UI workload tracker) */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardHeaderTitle}>WEEKLY RHYTHM</Text>
          <Text style={styles.cardBadge}>Active Week</Text>
        </View>

        <View style={styles.weekRow}>
          {daysOfWeek.map((day, idx) => {
            const isToday = idx === currentDayIndex;
            return (
              <View
                key={`${day}-${idx}`}
                style={[styles.dayPill, isToday && styles.dayPillActive]}
              >
                <View
                  style={[
                    styles.dayIndicatorBar,
                    isToday && styles.dayIndicatorBarActive
                  ]}
                />
                <Text style={[styles.dayText, isToday && styles.dayTextActive]}>
                  {day}
                </Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.workloadNote}>
          Tasks with set deadlines trigger audio chimes and in-app alerts so you never miss a beat.
        </Text>
      </View>

      {/* App Preferences & Cloud Sync (Clean consumer wording) */}
      <View style={styles.card}>
        <Text style={styles.cardHeaderTitle}>APP & SYNC PREFERENCES</Text>

        <View style={styles.prefList}>
          <View style={styles.prefRow}>
            <View style={styles.prefLeft}>
              <Text style={styles.prefTitle}>Cloud Synchronization</Text>
              <Text style={styles.prefSubtitle}>Secure instant sync across your sessions</Text>
            </View>
            <View style={styles.activePill}>
              <Text style={styles.activePillText}>CONNECTED</Text>
            </View>
          </View>

          <View style={styles.prefRow}>
            <View style={styles.prefLeft}>
              <Text style={styles.prefTitle}>Smart Task Categorization</Text>
              <Text style={styles.prefSubtitle}>Automatic sorting into your customized taxonomy</Text>
            </View>
            <View style={styles.activePill}>
              <Text style={styles.activePillText}>ACTIVE</Text>
            </View>
          </View>

          <View style={styles.prefRow}>
            <View style={styles.prefLeft}>
              <Text style={styles.prefTitle}>Timed Reminder Chimes</Text>
              <Text style={styles.prefSubtitle}>In-app banner notifications with audio</Text>
            </View>
            <View style={styles.activePill}>
              <Text style={styles.activePillText}>ON</Text>
            </View>
          </View>
        </View>

        <View style={styles.versionFooter}>
          <Text style={styles.versionText}>DailyDo · Version 1.0.0 Pro</Text>
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg
  },
  scrollContent: {
    padding: 18
  },
  header: {
    marginBottom: 16
  },
  title: {
    fontSize: 16,
    fontWeight: "900",
    color: theme.colors.textPrimary,
    letterSpacing: 1.2
  },
  subtitle: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: theme.colors.primary,
    letterSpacing: 1,
    marginBottom: 2
  },
  cardBadge: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6
  },
  cardHeaderDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 14,
    lineHeight: 16
  },
  metricsGrid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.bg,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.borderLight
  },
  metricItem: {
    flex: 1,
    alignItems: "center"
  },
  metricVal: {
    fontSize: 20,
    fontWeight: "900",
    color: theme.colors.textPrimary
  },
  metricLbl: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    marginTop: 2
  },
  metricDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.border
  },
  weekRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 14
  },
  dayPill: {
    width: 38,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: theme.colors.bg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.borderLight
  },
  dayPillActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary
  },
  dayIndicatorBar: {
    width: 12,
    height: 18,
    borderRadius: 6,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    marginBottom: 8
  },
  dayIndicatorBarActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  dayText: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.textSecondary
  },
  dayTextActive: {
    color: theme.colors.primary,
    fontWeight: "900"
  },
  workloadNote: {
    fontSize: 11,
    color: theme.colors.textMuted,
    lineHeight: 15,
    fontStyle: "italic"
  },
  prefList: {
    gap: 12,
    marginTop: 10
  },
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight
  },
  prefLeft: {
    flex: 1,
    marginRight: 10
  },
  prefTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.textPrimary
  },
  prefSubtitle: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2
  },
  activePill: {
    backgroundColor: "#DCFCE7",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6
  },
  activePillText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#15803D",
    letterSpacing: 0.5
  },
  versionFooter: {
    alignItems: "center",
    marginTop: 16,
    paddingTop: 8
  },
  versionText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: "600"
  }
});
