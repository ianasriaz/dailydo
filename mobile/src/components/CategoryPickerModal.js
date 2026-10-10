import React from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { theme } from "../theme.js";

export function CategoryPickerModal({
  visible,
  task,
  categories,
  onSelectCategory,
  onClose
}) {
  if (!task) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={() => onClose()}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={() => onClose()} />

        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>CHANGE CATEGORY</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                Task: "{task.title}"
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => onClose()} activeOpacity={0.7}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.categoriesList}>
            {categories.map((catName) => {
              const catStyle = theme.categories[catName] || {
                color: theme.colors.primary,
                bg: theme.colors.primaryLight,
                border: theme.colors.border
              };
              const isCurrent = task.category === catName;

              return (
                <TouchableOpacity
                  key={catName}
                  style={[styles.categoryOption, isCurrent && styles.categoryOptionCurrent]}
                  onPress={() => onSelectCategory(task.taskId, catName)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.dot, { backgroundColor: catStyle.color }]} />
                  <Text style={[styles.categoryOptionText, isCurrent && styles.categoryOptionTextCurrent]}>
                    {catName}
                  </Text>
                  {isCurrent && <Text style={styles.checkMark}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(14, 36, 30, 0.6)",
    justifyContent: "flex-end"
  },
  dismissArea: {
    flex: 1
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 22,
    paddingBottom: 36
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16
  },
  title: {
    fontSize: 14,
    fontWeight: "900",
    color: theme.colors.textPrimary,
    letterSpacing: 1,
    marginBottom: 2
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    maxWidth: 260
  },
  closeBtn: {
    padding: 6
  },
  closeIcon: {
    fontSize: 16,
    color: theme.colors.textMuted,
    fontWeight: "700"
  },
  categoriesList: {
    gap: 8
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12
  },
  categoryOptionCurrent: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12
  },
  categoryOptionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textPrimary
  },
  categoryOptionTextCurrent: {
    fontWeight: "800",
    color: theme.colors.primary
  },
  checkMark: {
    fontSize: 14,
    fontWeight: "900",
    color: theme.colors.primary
  }
});
