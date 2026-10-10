import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { TaskCard } from "./TaskCard.js";
import { theme } from "../theme.js";

export function CompletedScreen({ tasks, onToggleDone, onDelete, onChangeCategory }) {
  const completedTasks = tasks.filter((t) => t.status === "Done");

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <Text style={styles.sectionLabel}>ACCOMPLISHED</Text>
        <Text style={styles.countLabel}>
          {completedTasks.length} task{completedTasks.length === 1 ? "" : "s"}
        </Text>
      </View>

      {completedTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Completed Tasks Yet</Text>
          <Text style={styles.emptySubtitle}>
            When you complete tasks from your schedule, they will appear here.
          </Text>
        </View>
      ) : (
        completedTasks.map((task) => (
          <TaskCard
            key={task.taskId}
            task={task}
            onToggleDone={onToggleDone}
            onDelete={onDelete}
            onChangeCategory={onChangeCategory}
          />
        ))
      )}
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: "#5C756B",
    letterSpacing: 1
  },
  countLabel: {
    fontSize: 12,
    fontWeight: "700",
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
