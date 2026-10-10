import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { TaskCard } from "./TaskCard.js";
import { theme } from "../theme.js";

export function Timeline({
  tasks,
  onToggleDone,
  onDelete,
  onChangeCategory,
  onUseExample,
  categoryFilter,
  onClearCategoryFilter
}) {
  const filteredTasks = categoryFilter
    ? tasks.filter((t) => t.category === categoryFilter)
    : tasks;

  const timedTasks = filteredTasks.filter((t) => !t.isAnytime && t.dueTime);
  const anytimeTasks = filteredTasks.filter((t) => t.isAnytime || !t.dueTime);

  const isEmpty = filteredTasks.length === 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Active Category Filter Pill Banner */}
      {categoryFilter && (
        <View style={styles.filterBanner}>
          <Text style={styles.filterBannerLabel}>
            FILTERED BY: <Text style={styles.filterBannerName}>{categoryFilter}</Text>
          </Text>
          <TouchableOpacity
            style={styles.clearFilterBtn}
            onPress={onClearCategoryFilter}
            activeOpacity={0.7}
          >
            <Text style={styles.clearFilterText}>SHOW ALL ✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Text style={styles.emptyIcon}>✓</Text>
          </View>
          <Text style={styles.emptyTitle}>
            {categoryFilter ? `NO TASKS IN ${categoryFilter.toUpperCase()}` : "ALL CLEAR FOR TODAY"}
          </Text>
          <Text style={styles.emptySubtitle}>
            {categoryFilter
              ? "Change another task's category or tap '+' below to add new thoughts."
              : "Tap the '+' button below to dump natural thoughts and let DailyDo organize your schedule."}
          </Text>

          {!categoryFilter && (
            <TouchableOpacity
              style={styles.exampleBtn}
              onPress={() =>
                onUseExample(
                  "Team sync in 1 minute, review lecture slides at 4pm, and pick up dry cleaning"
                )
              }
              activeOpacity={0.8}
            >
              <Text style={styles.exampleLabel}>TRY 1-TAP EXAMPLE PROMPT:</Text>
              <Text style={styles.examplePrompt}>
                "Team sync in 1 minute, review lecture slides at 4pm, and pick up dry cleaning"
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <>
          {timedTasks.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>TODAY'S TIMELINE</Text>
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeCountText}>{timedTasks.length}</Text>
                </View>
              </View>
              {timedTasks.map((task) => (
                <TaskCard
                  key={task.taskId}
                  task={task}
                  onToggleDone={onToggleDone}
                  onDelete={onDelete}
                  onChangeCategory={onChangeCategory}
                />
              ))}
            </View>
          )}

          {anytimeTasks.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>ANYTIME / FLEXIBLE</Text>
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeCountText}>{anytimeTasks.length}</Text>
                </View>
              </View>
              {anytimeTasks.map((task) => (
                <TaskCard
                  key={task.taskId}
                  task={task}
                  onToggleDone={onToggleDone}
                  onDelete={onDelete}
                  onChangeCategory={onChangeCategory}
                />
              ))}
            </View>
          )}
        </>
      )}

      <View style={{ height: 110 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg
  },
  contentContainer: {
    padding: 18
  },
  filterBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 16
  },
  filterBannerLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.textSecondary
  },
  filterBannerName: {
    fontWeight: "900",
    color: theme.colors.primary
  },
  clearFilterBtn: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: theme.colors.surface
  },
  clearFilterText: {
    fontSize: 10,
    fontWeight: "800",
    color: theme.colors.primary
  },
  section: {
    marginBottom: 20
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
    color: theme.colors.textSecondary
  },
  badgeCount: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  badgeCountText: {
    fontSize: 10,
    fontWeight: "800",
    color: theme.colors.primary
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 16
  },
  emptyIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2
  },
  emptyIcon: {
    fontSize: 22,
    color: theme.colors.primary,
    fontWeight: "900"
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
    color: theme.colors.textPrimary,
    marginBottom: 6,
    textAlign: "center"
  },
  emptySubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 17,
    maxWidth: 280,
    marginBottom: 20
  },
  exampleBtn: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 14,
    width: "100%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2
  },
  exampleLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: theme.colors.primary,
    letterSpacing: 0.8,
    marginBottom: 4
  },
  examplePrompt: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    fontStyle: "italic",
    lineHeight: 16
  }
});
