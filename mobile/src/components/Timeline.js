import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { TaskCard } from "./TaskCard.js";
import { theme } from "../theme.js";

export function Timeline({
  tasks,
  onToggleDone,
  onDelete,
  onChangeCategory,
  onEditTitle,
  categoryFilter,
  onClearCategoryFilter
}) {
  const [viewMode, setViewMode] = useState("active"); // 'active' | 'completed'

  const filteredTasks = categoryFilter
    ? tasks.filter((t) => t.category === categoryFilter)
    : tasks;

  const activeTasks = filteredTasks.filter((t) => t.status !== "Done");
  const completedTasks = filteredTasks.filter((t) => t.status === "Done");

  const timedActiveTasks = activeTasks.filter((t) => !t.isAnytime && t.dueTime);
  const anytimeActiveTasks = activeTasks.filter((t) => t.isAnytime || !t.dueTime);

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

      {/* Segmented Control: Scheduled vs Completed */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentTab, viewMode === "active" && styles.segmentTabActive]}
          onPress={() => setViewMode("active")}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentLabel, viewMode === "active" && styles.segmentLabelActive]}>
            Scheduled ({activeTasks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentTab, viewMode === "completed" && styles.segmentTabActive]}
          onPress={() => setViewMode("completed")}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentLabel, viewMode === "completed" && styles.segmentLabelActive]}>
            Completed ({completedTasks.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* ACTIVE TASKS VIEW */}
      {viewMode === "active" && (
        <>
          {activeTasks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>
                {categoryFilter ? `No tasks in ${categoryFilter}` : "No Active Tasks"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {categoryFilter
                  ? "Clear the category filter or tap + to add a task."
                  : "Tap the + button below to add a reminder or schedule."}
              </Text>
            </View>
          ) : (
            <>
              {timedActiveTasks.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>TIMED</Text>
                    <View style={styles.badgeCount}>
                      <Text style={styles.badgeCountText}>{timedActiveTasks.length}</Text>
                    </View>
                  </View>
                  {timedActiveTasks.map((task) => (
                    <TaskCard
                      key={task.taskId}
                      task={task}
                      onToggleDone={onToggleDone}
                      onDelete={onDelete}
                      onChangeCategory={onChangeCategory}
                      onEditTitle={onEditTitle}
                    />
                  ))}
                </View>
              )}

              {anytimeActiveTasks.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>ANYTIME</Text>
                    <View style={styles.badgeCount}>
                      <Text style={styles.badgeCountText}>{anytimeActiveTasks.length}</Text>
                    </View>
                  </View>
                  {anytimeActiveTasks.map((task) => (
                    <TaskCard
                      key={task.taskId}
                      task={task}
                      onToggleDone={onToggleDone}
                      onDelete={onDelete}
                      onChangeCategory={onChangeCategory}
                      onEditTitle={onEditTitle}
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </>
      )}

      {/* COMPLETED TASKS VIEW */}
      {viewMode === "completed" && (
        <>
          {completedTasks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Completed Tasks</Text>
              <Text style={styles.emptySubtitle}>
                Completed reminders and accomplished tasks will appear here.
              </Text>
            </View>
          ) : (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>ACCOMPLISHED</Text>
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeCountText}>{completedTasks.length}</Text>
                </View>
              </View>
              {completedTasks.map((task) => (
                <TaskCard
                  key={task.taskId}
                  task={task}
                  onToggleDone={onToggleDone}
                  onDelete={onDelete}
                  onChangeCategory={onChangeCategory}
                  onEditTitle={onEditTitle}
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
  segmentContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E4EDE7",
    borderRadius: 14,
    padding: 3,
    marginBottom: 16
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center"
  },
  segmentTabActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2
  },
  segmentLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B857B"
  },
  segmentLabelActive: {
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
    paddingVertical: 70,
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
