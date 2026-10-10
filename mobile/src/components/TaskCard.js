import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { theme } from "../theme.js";

export function TaskCard({ task, onToggleDone, onDelete, onChangeCategory }) {
  const isDone = task.status === "Done";
  const isReminded = task.status === "Reminded";
  const catStyle = theme.categories[task.category] || {
    color: theme.colors.primary,
    bg: theme.colors.primaryLight,
    border: theme.colors.border
  };

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
      {/* Checkbox */}
      <TouchableOpacity
        style={[styles.checkbox, isDone && styles.checkboxDone]}
        onPress={() => onToggleDone(task)}
        activeOpacity={0.7}
      >
        {isDone && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.headerLine}>
          <Text style={[styles.title, isDone && styles.titleDone]} numberOfLines={2}>
            {task.title}
          </Text>
        </View>

        <View style={styles.metaRow}>
          {/* Clickable Category Pill to Change Category */}
          <TouchableOpacity
            style={[styles.categoryPill, { backgroundColor: catStyle.bg, borderColor: catStyle.border }]}
            onPress={() => onChangeCategory && onChangeCategory(task)}
            activeOpacity={0.7}
          >
            <Text style={[styles.categoryText, { color: catStyle.color }]}>
              {task.category} ▾
            </Text>
          </TouchableOpacity>

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

      {/* Delete button */}
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => onDelete(task.taskId)}
        activeOpacity={0.6}
      >
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2
  },
  cardDone: {
    opacity: 0.55,
    backgroundColor: "#F8FAF8"
  },
  cardReminded: {
    borderColor: theme.colors.warning,
    backgroundColor: "#FEFCE8"
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: theme.colors.borderFocused,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },
  checkboxDone: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900"
  },
  content: {
    flex: 1
  },
  headerLine: {
    marginBottom: 6
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    lineHeight: 19
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
    borderRadius: 6,
    borderWidth: 1
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.2
  },
  timePill: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: theme.colors.bg,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  timeText: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.colors.textSecondary
  },
  remindedPill: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: "#FEF3C7",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FDE68A"
  },
  remindedText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#B45309",
    letterSpacing: 0.5
  },
  deleteBtn: {
    padding: 8,
    marginLeft: 4
  },
  deleteText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: "700"
  }
});
