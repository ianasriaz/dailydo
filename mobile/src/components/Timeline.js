import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { TaskCard } from "./TaskCard.js";
import { theme } from "../theme.js";

export function Timeline({
  tasks,
  onToggleDone,
  onDelete,
  onChangeCategory,
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
      {/* Category Filter Pill Banner */}
      {categoryFilter && (
        <View style={styles.filterBanner}>
          <Text style={styles.filterBannerLabel}>
            Filtered: <Text style={styles.filterBannerName}>{categoryFilter}</Text>
          </Text>
          <TouchableOpacity
            style={styles.clearFilterBtn}
            onPress={onClearCategoryFilter}
            activeOpacity={0.7}
          >
            <Text style={styles.clearFilterText}>Clear ✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            {categoryFilter ? `No tasks in ${categoryFilter}` : "No Active Tasks"}
          </Text>
          <Text style={styles.emptySubtitle}>
            {categoryFilter
              ? "Switch category filter or tap + to add a new task."
              : "Tap the + button below to add a reminder or schedule."}
          </Text>
        </View>
      ) : (
        <>
          {timedTasks.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>SCHEDULED</Text>
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
                <Text style={styles.sectionTitle}>ANYTIME</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg
  },
  contentContainer: {
    padding: 18,
    paddingBottom: 24
  },
  filterBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E2ECE6",
    borderWidth: 1,
    borderColor: "#D2DFD8",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 14
  },
  filterBannerLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#425C52"
  },
  filterBannerName: {
    fontWeight: "900",
    color: theme.colors.primary
  },
  clearFilterBtn: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.surface
  },
  clearFilterText: {
    fontSize: 11,
    fontWeight: "800",
    color: theme.colors.primary
  },
  section: {
    marginBottom: 16
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#5C756B"
  },
  badgeCount: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#E2ECE6"
  },
  badgeCountText: {
    fontSize: 11,
    fontWeight: "800",
    color: theme.colors.primary
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 24
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    marginBottom: 6,
    textAlign: "center"
  },
  emptySubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 280
  }
});
