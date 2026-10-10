import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { theme } from "../theme.js";

export function NotificationBanner({ notification, onMarkDone, onDismiss }) {
  if (!notification) return null;

  const catStyle = theme.categories[notification.category] || {
    color: theme.colors.primary,
    bg: theme.colors.primaryLight,
    border: theme.colors.border
  };

  return (
    <View style={styles.bannerContainer}>
      <View style={styles.bannerCard}>
        <View style={styles.topMeta}>
          <View style={styles.alertIndicator}>
            <View style={styles.alertPulseDot} />
            <Text style={styles.alertLabel}>TASK DUE NOW</Text>
          </View>
          <View style={[styles.catBadge, { backgroundColor: catStyle.bg, borderColor: catStyle.border }]}>
            <Text style={[styles.catText, { color: catStyle.color }]}>{notification.category}</Text>
          </View>
        </View>

        <Text style={styles.taskTitle} numberOfLines={2}>
          {notification.title}
        </Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => onMarkDone(notification)}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>✓ MARK AS DONE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dismissBtn}
            onPress={() => onDismiss()}
            activeOpacity={0.7}
          >
            <Text style={styles.dismissBtnText}>DISMISS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    position: "absolute",
    top: 10,
    left: 14,
    right: 14,
    zIndex: 999
  },
  bannerCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12
  },
  topMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  alertIndicator: {
    flexDirection: "row",
    alignItems: "center"
  },
  alertPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.warning,
    marginRight: 6
  },
  alertLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: theme.colors.warning
  },
  catBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1
  },
  catText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.3
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    marginBottom: 12,
    lineHeight: 20
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  doneBtn: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: "center"
  },
  doneBtnText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
    color: "#FFFFFF"
  },
  dismissBtn: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    backgroundColor: theme.colors.bg
  },
  dismissBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.textSecondary
  }
});
