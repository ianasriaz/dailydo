import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
  StyleSheet
} from "react-native";
import { theme } from "../theme.js";

export function AgentSearchPopup({ visible, onClose, onSubmit, isProcessing, availableCategories = [] }) {
  const [text, setText] = useState("");
  const inputRef = useRef(null);

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
    setText((prev) => (prev ? `${prev}, ${snippet}` : snippet));
    inputRef.current?.focus();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={() => onClose()}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={styles.dismissOverlay}
          activeOpacity={1}
          onPress={() => onClose()}
        />

        <View style={styles.agentCard}>
          {/* Header */}
          <View style={styles.topBar}>
            <View style={styles.agentBadge}>
              <Text style={styles.agentSparkle}>✦</Text>
              <Text style={styles.agentBadgeText}>SMART CAPTURE</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => onClose()}
              activeOpacity={0.7}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.cardHeading}>What's on your mind?</Text>
          <Text style={styles.cardSubheading}>
            Dump your raw thoughts, meetings, or chores. DailyDo extracts deadlines and sorts them into your categories automatically.
          </Text>

          {/* AI Search / Agent Chat Input Box */}
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.chatInput}
              multiline
              placeholder="e.g., Team sync in 1 minute, pay rent by Friday, review lecture slides at 4pm"
              placeholderTextColor={theme.colors.textMuted}
              value={text}
              onChangeText={(val) => setText(val)}
              autoFocus
              returnKeyType="default"
              textAlignVertical="top"
            />
          </View>

          {/* Quick Prompts */}
          <View style={styles.chipsSection}>
            <Text style={styles.chipsLabel}>QUICK PROMPTS:</Text>
            <View style={styles.chipsRow}>
              <TouchableOpacity style={styles.chip} onPress={() => handleChipClick("Sync in 1 min")}>
                <Text style={styles.chipText}>+ in 1 min</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chip} onPress={() => handleChipClick("Pray Zuhr at 1:30")}>
                <Text style={styles.chipText}>+ Pray Zuhr</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chip} onPress={() => handleChipClick("Team sync at 4pm")}>
                <Text style={styles.chipText}>+ Sync at 4pm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chip} onPress={() => handleChipClick("Pay bill by Tuesday")}>
                <Text style={styles.chipText}>+ Pay bill</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer Controls */}
          <View style={styles.footerRow}>
            <View style={styles.voiceHint}>
              <Text style={styles.voiceHintText}>💡 Tip: Tap keyboard mic to speak</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.organizeBtn,
                (!text.trim() || isProcessing) && styles.organizeBtnDisabled
              ]}
              onPress={() => handleSubmit()}
              disabled={!text.trim() || isProcessing}
              activeOpacity={0.85}
            >
              {isProcessing ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.organizeBtnText}>ORGANIZE ➔</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(14, 36, 30, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18
  },
  dismissOverlay: {
    ...StyleSheet.absoluteFillObject
  },
  agentCard: {
    width: "100%",
    maxWidth: 460,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 22,
    shadowColor: "#0E382F",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10
  },
  agentBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 5
  },
  agentSparkle: {
    fontSize: 11,
    color: theme.colors.primary
  },
  agentBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: theme.colors.primary,
    letterSpacing: 0.8
  },
  closeBtn: {
    padding: 6
  },
  closeIcon: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.textMuted
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.3
  },
  cardSubheading: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
    marginBottom: 14
  },
  inputContainer: {
    backgroundColor: theme.colors.bg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.colors.borderFocused,
    padding: 12,
    marginBottom: 14
  },
  chatInput: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    minHeight: 85,
    textAlignVertical: "top"
  },
  chipsSection: {
    marginBottom: 16
  },
  chipsLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  chip: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8
  },
  chipText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.textSecondary
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 4
  },
  voiceHint: {
    flex: 1
  },
  voiceHintText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: "500"
  },
  organizeBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 22,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4
  },
  organizeBtnDisabled: {
    opacity: 0.4
  },
  organizeBtnText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.8
  }
});
