import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet
} from "react-native";
import { theme } from "../theme.js";
import { CloseIcon } from "./Icons.js";

export function AgentSearchPopup({ visible, onClose, onSubmit, isProcessing }) {
  const [text, setText] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 120);
      return () => clearTimeout(timer);
    } else {
      setText("");
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!text.trim() || isProcessing) return;
    onSubmit(text.trim());
    setText("");
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={styles.dismissOverlay}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.card}>
          {/* Header Row: Centered Bold Heading SMART REMINDER & Close Icon */}
          <View style={styles.headerRow}>
            <View style={styles.headerSpacer} />
            <Text style={styles.heading}>SMART REMINDER</Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <CloseIcon color={theme.colors.textMuted} size={18} />
            </TouchableOpacity>
          </View>

          {/* Focused Text Input */}
          <View style={styles.inputWrap}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              multiline
              placeholder="What would you like to be reminded of?"
              placeholderTextColor={theme.colors.textMuted}
              value={text}
              onChangeText={setText}
              textAlignVertical="top"
              autoFocus
            />
          </View>

          {/* CTA: Done */}
          <TouchableOpacity
            style={[
              styles.doneBtn,
              (!text.trim() || isProcessing) && styles.doneBtnDisabled
            ]}
            onPress={handleSubmit}
            disabled={!text.trim() || isProcessing}
            activeOpacity={0.85}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.doneBtnText}>Done</Text>
            )}
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
  dismissOverlay: {
    ...StyleSheet.absoluteFillObject
  },
  card: {
    width: "100%",
    maxWidth: 420,
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16
  },
  headerSpacer: {
    width: 24
  },
  heading: {
    fontSize: 16,
    fontWeight: "900",
    color: theme.colors.primary,
    letterSpacing: 1.2,
    textAlign: "center"
  },
  closeBtn: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center"
  },
  inputWrap: {
    backgroundColor: theme.colors.bg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    marginBottom: 18
  },
  input: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    minHeight: 90,
    lineHeight: 22
  },
  doneBtn: {
    backgroundColor: theme.colors.primary,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  doneBtnDisabled: {
    opacity: 0.4
  },
  doneBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.4
  }
});
