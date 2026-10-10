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
import { CloseIcon } from "./Icons.js";

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
      {/* Top Action Bar */}
      <View style={styles.topBar}>
        <Text style={styles.sectionLabel}>YOUR CATEGORIES</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.addBtnText}>+ Add Category</Text>
        </TouchableOpacity>
      </View>

      {/* Categories List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.list}>
          {categories.map((catName) => {
            const catStyle = theme.categories[catName] || {
              color: theme.colors.primary,
              bg: "#E8F0EC",
              border: "#D5E3DB"
            };

            const catTasks = tasks.filter((t) => t.category === catName);
            const activeCount = catTasks.filter((t) => t.status !== "Done").length;

            return (
              <TouchableOpacity
                key={catName}
                style={styles.card}
                onPress={() => onSelectCategoryFilter(catName)}
                activeOpacity={0.8}
              >
                <View style={styles.cardLeft}>
                  <View style={[styles.dot, { backgroundColor: catStyle.color }]} />
                  <Text style={styles.categoryName}>{catName}</Text>
                </View>

                <View style={styles.countBadge}>
                  <Text style={styles.countText}>
                    {activeCount} active · {catTasks.length} total
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Add Category Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
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
              <Text style={styles.modalTitle}>New Category</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <CloseIcon color={theme.colors.textMuted} size={18} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Category name..."
              placeholderTextColor={theme.colors.textMuted}
              value={newCatName}
              onChangeText={setNewCatName}
              autoFocus
            />

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
              <Text style={styles.saveBtnText}>Done</Text>
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: "#5C756B",
    letterSpacing: 1
  },
  addBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF"
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 24
  },
  list: {
    gap: 10
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5ECE8",
    paddingVertical: 16,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.textPrimary
  },
  countBadge: {
    backgroundColor: "#F0F5F2",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10
  },
  countText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#5A7269"
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(14, 36, 30, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  modalDismiss: {
    ...StyleSheet.absoluteFillObject
  },
  modalSheet: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 22,
    shadowColor: "#0E382F",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 12
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: theme.colors.primary,
    letterSpacing: -0.2
  },
  input: {
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    padding: 12,
    fontSize: 15,
    color: theme.colors.textPrimary,
    marginBottom: 16
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 6
  },
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: theme.colors.primary
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center"
  },
  saveBtnDisabled: {
    opacity: 0.4
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF"
  }
});
