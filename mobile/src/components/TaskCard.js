import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { theme } from "../theme.js";
import { ClockIcon, CloseIcon, CheckIcon } from "./Icons.js";

export function TaskCard({ task, onToggleDone, onDelete, onChangeCategory }) {
  const isDone = task.status === "Done";
  const isReminded = task.status === "Reminded";
  const catStyle = theme.categories[task.category] || {
    color: theme.colors.primary,
    bg: "#E8F0EC",
    border: "#D5E3DB"
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
        {isDone && <CheckIcon color="#FFFFFF" size={13} />}
      </TouchableOpacity>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={[styles.title, isDone && styles.titleDone]} numberOfLines={2}>
          {task.title}
        </Text>

        <View style={styles.metaRow}>
          {/* Clickable Category Pill */}
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
              <ClockIcon color="#6B857B" size={12} />
              <Text style={styles.timeText}>{formattedTime}</Text>
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
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <CloseIcon color="#A2B4AC" size={14} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5ECE8",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2
  },
  cardDone: {
    opacity: 0.5,
    backgroundColor: "#F7FAF8"
  },
  cardReminded: {
    borderColor: "#FDE68A",
    backgroundColor: "#FEFCE8"
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#A9BCB4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14
  },
  checkboxDone: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  content: {
    flex: 1
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    lineHeight: 20,
    marginBottom: 6
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
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.2
  },
  timePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 7,
    backgroundColor: "#F2F6F4",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E3ECE7",
    gap: 4
  },
  timeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#526B62"
  },
  remindedPill: {
    paddingVertical: 3,
    paddingHorizontal: 7,
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
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
    padding: 6,
    marginLeft: 6
  }
});
