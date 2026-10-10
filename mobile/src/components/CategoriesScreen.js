import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet
} from "react-native";
import { theme } from "../theme.js";

export function CategoriesScreen({
  categories,
  tasks,
  onAddCategory,
  onSelectCategoryFilter
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#0E382F");

  const colorPresets = [
    "#0E382F", // Forest Slate
    "#0369A1", // Ocean Blue
    "#0F766E", // Teal
    "#B45309", // Amber
    "#15803D", // Emerald
    "#6D28D9", // Violet
    "#BE185D"  // Rose
  ];

  const handleCreate = () => {
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim(), selectedColor);
    setNewCatName("");
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>CATEGORIES</Text>
          <Text style={styles.subtitle}>
            Tasks are organized automatically into your categories.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addCategoryBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.addCategoryBtnText}>+ NEW</Text>
        </TouchableOpacity>
      </View>

      {/* Categories Grid */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {categories.map((catName) => {
            const catStyle = theme.categories[catName] || {
              color: theme.colors.primary,
              bg: theme.colors.primaryLight,
              border: theme.colors.border
            };

            const catTasks = tasks.filter((t) => t.category === catName);
            const pendingCount = catTasks.filter((t) => t.status !== "Done").length;
            const doneCount = catTasks.filter((t) => t.status === "Done").length;

            return (
              <TouchableOpacity
                key={catName}
                style={styles.card}
                onPress={() => onSelectCategoryFilter(catName)}
                activeOpacity={0.85}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.badge, { backgroundColor: catStyle.bg, borderColor: catStyle.border }]}>
                    <View style={[styles.dot, { backgroundColor: catStyle.color }]} />
                    <Text style={[styles.badgeText, { color: catStyle.color }]}>{catName}</Text>
                  </View>
                  <Text style={styles.totalCount}>{catTasks.length} tasks</Text>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{pendingCount}</Text>
                    <Text style={styles.statLabel}>Active</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{doneCount}</Text>
                    <Text style={styles.statLabel}>Completed</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.viewTasksText}>View tasks ➔</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Add Category Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalDismiss}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />

          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>CREATE NEW CATEGORY</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>CATEGORY NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Side Project, Health & Fitness, Finance"
              placeholderTextColor={theme.colors.textMuted}
              value={newCatName}
              onChangeText={setNewCatName}
              autoFocus
            />

            <Text style={styles.inputLabel}>COLOR THEME</Text>
            <View style={styles.colorRow}>
              {colorPresets.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: c },
                    selectedColor === c && styles.colorCircleSelected
                  ]}
                  onPress={() => setSelectedColor(c)}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, !newCatName.trim() && styles.saveBtnDisabled]}
              onPress={handleCreate}
              disabled={!newCatName.trim()}
              activeOpacity={0.85}
            >
              <Text style={styles.saveBtnText}>CREATE CATEGORY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  addCategoryBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  addCategoryBtnText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.8
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100
  },
  grid: {
    gap: 12
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4
  },
  totalCount: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textMuted
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.bg,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 12
  },
  statBox: {
    flex: 1,
    alignItems: "center"
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "900",
    color: theme.colors.textPrimary
  },
  statLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: "600",
    marginTop: 1
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.border
  },
  cardFooter: {
    alignItems: "flex-end"
  },
  viewTasksText: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.primary
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(14, 36, 30, 0.65)",
    justifyContent: "flex-end"
  },
  modalDismiss: {
    flex: 1
  },
  modalSheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 22,
    paddingBottom: 36
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: theme.colors.textPrimary,
    letterSpacing: 1
  },
  modalCloseIcon: {
    fontSize: 16,
    color: theme.colors.textMuted,
    fontWeight: "700",
    padding: 4
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: theme.colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 6
  },
  input: {
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: theme.colors.textPrimary,
    marginBottom: 16
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 22
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: theme.colors.textPrimary
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center"
  },
  saveBtnDisabled: {
    opacity: 0.4
  },
  saveBtnText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1
  }
});
