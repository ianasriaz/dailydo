import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CleanMicIcon } from "./CleanMicIcon.js";
import { theme } from "../theme.js";

export function FloatingCaptureBar({ onOpenCapture, isProcessing }) {
  return (
    <View style={styles.dock}>
      <TouchableOpacity
        style={styles.barContainer}
        onPress={() => onOpenCapture(false)}
        activeOpacity={0.85}
      >
        <Text style={styles.placeholderText}>
          {isProcessing ? "AWS Bedrock organizing..." : "Tap to type or speak thought..."}
        </Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.micBtn}
            onPress={() => onOpenCapture(true)}
            activeOpacity={0.7}
          >
            <CleanMicIcon size={16} color={theme.colors.accent} />
          </TouchableOpacity>

          <View style={styles.sendBtn}>
            <Text style={styles.sendIcon}>➔</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 24,
    backgroundColor: "transparent"
  },
  barContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderFocused,
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10
  },
  placeholderText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontWeight: "600",
    flex: 1
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  micBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(204, 255, 0, 0.15)",
    borderWidth: 1,
    borderColor: theme.colors.accent,
    justifyContent: "center",
    alignItems: "center"
  },
  micIcon: {
    fontSize: 17
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.accent,
    justifyContent: "center",
    alignItems: "center"
  },
  sendIcon: {
    fontSize: 16,
    fontWeight: "900",
    color: theme.colors.accentText
  }
});
