import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
  StyleSheet,
  KeyboardAvoidingView
} from "react-native";
import { theme } from "../theme.js";

export function CaptureOverlay({ visible, onClose, onSubmit, isProcessing }) {
  const [text, setText] = useState("");
  const inputRef = useRef(null);

  // Auto-focus the input as soon as the modal opens to trigger the mobile keyboard immediately
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
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

  const handleChipClick = (snippet) => {
    setText(prev => (prev ? `${prev}, ${snippet}` : snippet));
    inputRef.current?.focus();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardContainer}
      >
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            {/* Header */}
            <View style={styles.headerRow}>
              <View style={styles.titleBox}>
                <Text style={styles.headerTitle}>QUICK CAPTURE</Text>
                <Text style={styles.headerSubtitle}>
                  Speak with your keyboard mic or type — Bedrock will organize it.
                </Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Practical Voice Tip */}
            <View style={styles.voiceTip}>
              <Text style={styles.voiceTipTag}>VOICE CAPTURE:</Text>
              <Text style={styles.voiceTipText}>
                Tap the microphone key on your keyboard to speak naturally.
              </Text>
            </View>

            {/* Multiline Text Input */}
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              multiline
              placeholder="e.g., Team sync in 1 minute, review lecture slides at 4pm, pick up groceries"
              placeholderTextColor={theme.colors.textMuted}
              value={text}
              onChangeText={setText}
              autoFocus
              returnKeyType="default"
              textAlignVertical="top"
            />

            {/* Quick Prompt Chips */}
            <View style={styles.chipsRow}>
              <Text style={styles.chipsLabel}>PROMPTS:</Text>
              <TouchableOpacity style={styles.chip} onPress={() => handleChipClick("Sync in 1 minute")}>
                <Text style={styles.chipText}>+ in 1 min</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chip} onPress={() => handleChipClick("Pray Zuhr at 1:30")}>
                <Text style={styles.chipText}>+ Pray Zuhr</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chip} onPress={() => handleChipClick("Team sync at 4pm")}>
                <Text style={styles.chipText}>+ Sync at 4pm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chip} onPress={() => handleChipClick("Pay electricity by Tuesday")}>
                <Text style={styles.chipText}>+ Pay bill</Text>
              </TouchableOpacity>
            </View>

            {/* Full-width Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, (!text.trim() || isProcessing) && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!text.trim() || isProcessing}
              activeOpacity={0.85}
            >
              {isProcessing ? (
                <ActivityIndicator color={theme.colors.accentText} />
              ) : (
                <Text style={styles.submitBtnText}>ORGANIZE WITH BEDROCK ➔</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(9, 9, 11, 0.92)",
    justifyContent: "flex-end"
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 36 : 24
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12
  },
  titleBox: {
    flex: 1
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: theme.colors.textPrimary,
    marginBottom: 3
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    lineHeight: 16
  },
  closeBtn: {
    padding: 6,
    marginLeft: 12
  },
  closeText: {
    fontSize: 16,
    color: theme.colors.textMuted,
    fontWeight: "700"
  },
  voiceTip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(204, 255, 0, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(204, 255, 0, 0.3)",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    gap: 6
  },
  voiceTipTag: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: theme.colors.accent
  },
  voiceTipText: {
    flex: 1,
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 15
  },
  textInput: {
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.colors.borderFocused,
    borderRadius: 10,
    padding: 14,
    color: theme.colors.textPrimary,
    fontSize: 15,
    minHeight: 110,
    textAlignVertical: "top",
    marginBottom: 12
  },
  chipsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18
  },
  chipsLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: theme.colors.textMuted,
    letterSpacing: 0.5
  },
  chip: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6
  },
  chipText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.textSecondary
  },
  submitBtn: {
    height: 48,
    backgroundColor: theme.colors.accent,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    width: "100%"
  },
  submitBtnDisabled: {
    opacity: 0.4
  },
  submitBtnText: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    color: theme.colors.accentText
  }
});
