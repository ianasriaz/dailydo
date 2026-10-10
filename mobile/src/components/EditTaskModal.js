import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet
} from "react-native";
import { theme } from "../theme.js";
import { CloseIcon } from "./Icons.js";

export function EditTaskModal({ visible, task, onSave, onClose }) {
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
    }
  }, [task]);

  if (!task) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(task.taskId, title.trim());
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={onClose} />

        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.heading}>EDIT TASK</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeBtn}>
              <CloseIcon color={theme.colors.textMuted} size={18} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Task title..."
              placeholderTextColor={theme.colors.textMuted}
              autoFocus
              multiline
            />
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, !title.trim() && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!title.trim()}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
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
  card: {
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
  heading: {
    fontSize: 15,
    fontWeight: "900",
    color: theme.colors.primary,
    letterSpacing: 1
  },
  closeBtn: {
    padding: 4
  },
  inputWrap: {
    backgroundColor: theme.colors.bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2ECE6",
    padding: 12,
    marginBottom: 16
  },
  input: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    minHeight: 60
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
