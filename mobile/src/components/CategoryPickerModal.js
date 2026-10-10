import React from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { theme } from "../theme.js";
import { CloseIcon } from "./Icons.js";

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
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Category</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <CloseIcon color={theme.colors.textMuted} size={18} />
            </TouchableOpacity>
          </View>

          <View style={styles.categoriesList}>
            {categories.map((catName) => {
              const catStyle = theme.categories[catName] || {
                color: theme.colors.primary,
                bg: "#E8F0EC",
                border: "#D5E3DB"
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
                  {isCurrent && <View style={styles.currentDot} />}
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
    backgroundColor: "rgba(14, 36, 30, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  dismissArea: {
    ...StyleSheet.absoluteFillObject
  },
  sheet: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5ECE8",
    padding: 22,
    shadowColor: "#0E382F",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 12
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16
  },
  title: {
    fontSize: 16,
    fontWeight: "900",
    color: theme.colors.primary,
    letterSpacing: -0.2
  },
  closeBtn: {
    padding: 4
  },
  categoriesList: {
    gap: 8
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAF8",
    borderWidth: 1,
    borderColor: "#E5ECE8",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14
  },
  categoryOptionCurrent: {
    borderColor: theme.colors.primary,
    backgroundColor: "#E2ECE6"
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12
  },
  categoryOptionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary
  },
  categoryOptionTextCurrent: {
    fontWeight: "800",
    color: theme.colors.primary
  },
  currentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary
  }
});
