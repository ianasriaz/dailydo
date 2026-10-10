import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { theme } from "../theme.js";

export function FloatingCaptureBar({ onOpenCapture, isProcessing }) {
  return (
    <View style={styles.dock}>
      <TouchableOpacity
        style={styles.barContainer}
        onPress={() => onOpenCapture()}
        activeOpacity={0.85}
      >
        <Text style={styles.placeholderText}>
          {isProcessing ? "AWS Bedrock organizing..." : "Dump thoughts (voice or text)..."}
        </Text>

        <View style={styles.addBtn}>
          <Text style={styles.addBtnIcon}>+</Text>
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
    paddingHorizontal: 20,
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
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.accent,
    justifyContent: "center",
    alignItems: "center"
  },
  addBtnIcon: {
    fontSize: 22,
    fontWeight: "900",
    color: theme.colors.accentText,
    lineHeight: 24,
    marginTop: -1
  }
});
