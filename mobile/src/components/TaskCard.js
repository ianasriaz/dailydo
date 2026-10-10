import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { theme } from "../theme.js";

export function TaskCard({ task, onToggleDone, onDelete }) {
  const isDone = task.status === "Done";
  const isReminded = task.status === "Reminded";
  const catStyle = theme.categories[task.category] || theme.categories["Personal & Errands"];

  let formattedTime = null;
  if (task.dueTime) {
    try {
      const d = new Date(task.dueTime);
      formattedTime = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    } catch {
      formattedTime = task.dueTime;
    }
  }

  return (
    <View style={[styles.card, isDone && styles.cardDone, isReminded && styles.cardReminded]}>
      <TouchableOpacity
        style={[styles.checkbox, isDone && styles.checkboxDone]}
        onPress={() => onToggleDone(task)}
        activeOpacity={0.7}
      >
        {isDone && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.headerLine}>
          <Text style={[styles.title, isDone && styles.titleDone]} numberOfLines={2}>
            {task.title}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <View style={[styles.categoryPill, { backgroundColor: catStyle.bg, borderColor: catStyle.border }]}>
            <Text style={[styles.categoryText, { color: catStyle.color }]}>{task.category}</Text>
          </View>

          {formattedTime && (
            <View style={styles.timePill}>
              <Text style={styles.timeText}>🕒 {formattedTime}</Text>
            </View>
          )}

          {isReminded && (
            <View style={styles.remindedPill}>
              <Text style={styles.remindedText}>ALARMED</Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(task.taskId)} activeOpacity={0.6}>
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    marginBottom: 10
  },
  cardDone: {
    opacity: 0.5,
    backgroundColor: "rgba(18, 18, 22, 0.6)"
  },
  cardReminded: {
    borderColor: theme.colors.accent,
    backgroundColor: "rgba(204, 255, 0, 0.05)"
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.textMuted,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },
  checkboxDone: {
    backgroundColor: theme.colors.done,
    borderColor: theme.colors.done
  },
  checkmark: {
    color: "#09090B",
    fontSize: 14,
    fontWeight: "900"
  },
  content: {
    flex: 1
  },
  headerLine: {
    marginBottom: 6
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    lineHeight: 20
  },
  titleDone: {
    textDecorationLine: "line-through",
    color: theme.colors.textMuted
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6
  },
  categoryPill: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3
  },
  timePill: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 4
  },
  timeText: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.colors.textSecondary
  },
  remindedPill: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: "rgba(204, 255, 0, 0.15)",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.accent
  },
  remindedText: {
    fontSize: 9,
    fontWeight: "900",
    color: theme.colors.accent,
    letterSpacing: 0.5
  },
  deleteBtn: {
    padding: 8,
    marginLeft: 6
  },
  deleteText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: "700"
  }
});
