import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { TaskCard } from "./TaskCard.js";
import { theme } from "../theme.js";

export function Timeline({ tasks, onToggleDone, onDelete, onUseExample }) {
  const timedTasks = tasks.filter(t => !t.isAnytime && t.dueTime);
  const anytimeTasks = tasks.filter(t => t.isAnytime || !t.dueTime);

  const isEmpty = tasks.length === 0;

  if (isEmpty) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconBox}>
          <Text style={styles.emptyIcon}>⚡</Text>
        </View>
        <Text style={styles.emptyTitle}>ALL CLEAR FOR TODAY</Text>
        <Text style={styles.emptySubtitle}>
          Tap the microphone or input below to capture your daily thoughts and reminders.
        </Text>
        <TouchableOpacity
          style={styles.exampleBtn}
          onPress={() => onUseExample("Team sync in 1 minute, review project slides at 4pm, and pick up dry cleaning")}
          activeOpacity={0.8}
        >
          <Text style={styles.exampleLabel}>TRY 1-TAP EXAMPLE PROMPT:</Text>
          <Text style={styles.examplePrompt}>
            "Team sync in 1 minute, review project slides at 4pm, and pick up dry cleaning"
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {timedTasks.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TODAY'S TIMELINE</Text>
            <View style={styles.badgeCount}>
              <Text style={styles.badgeCountText}>{timedTasks.length}</Text>
            </View>
          </View>
          {timedTasks.map(task => (
            <TaskCard key={task.taskId} task={task} onToggleDone={onToggleDone} onDelete={onDelete} />
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
          {anytimeTasks.map(task => (
            <TaskCard key={task.taskId} task={task} onToggleDone={onToggleDone} onDelete={onDelete} />
          ))}
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg
  },
  contentContainer: {
    padding: 20
  },
  section: {
    marginBottom: 20
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: theme.colors.textMuted
  },
  badgeCount: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  badgeCountText: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.colors.textSecondary
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    backgroundColor: theme.colors.bg
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20
  },
  emptyIcon: {
    fontSize: 26,
    color: theme.colors.accent
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: theme.colors.textPrimary,
    marginBottom: 8
  },
  emptySubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 24
  },
  exampleBtn: {
    width: "100%",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderFocused,
    borderRadius: 8,
    padding: 14
  },
  exampleLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: theme.colors.accent,
    letterSpacing: 1,
    marginBottom: 4
  },
  examplePrompt: {
    fontSize: 12,
    fontStyle: "italic",
    color: theme.colors.textSecondary,
    lineHeight: 16
  }
});
