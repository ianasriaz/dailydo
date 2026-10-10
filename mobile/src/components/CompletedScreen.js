import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { TaskCard } from "./TaskCard.js";
import { theme } from "../theme.js";

export function CompletedScreen({ tasks, onToggleDone, onDelete, onChangeCategory }) {
  const completedTasks = tasks.filter((t) => t.status === "Done");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>COMPLETED</Text>
          <Text style={styles.subtitle}>
            {completedTasks.length} task{completedTasks.length === 1 ? "" : "s"} accomplished
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {completedTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Text style={styles.emptyIcon}>★</Text>
            </View>
            <Text style={styles.emptyTitle}>NO COMPLETED TASKS YET</Text>
            <Text style={styles.emptySubtitle}>
              Check off tasks from your schedule to build your daily completion record.
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

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
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
  scrollContent: {
    padding: 18
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50
  },
  emptyIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12
  },
  emptyIcon: {
    fontSize: 20,
    color: theme.colors.primary,
    fontWeight: "900"
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: theme.colors.textPrimary,
    letterSpacing: 0.8,
    marginBottom: 4
  },
  emptySubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: "center",
    maxWidth: 240,
    lineHeight: 16
  }
});
