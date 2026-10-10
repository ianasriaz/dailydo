import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { theme } from "../theme.js";

export function NotificationBanner({ notification, onMarkDone, onDismiss }) {
  if (!notification) return null;

  const catStyle = theme.categories[notification.category] || theme.categories["Personal & Errands"];

  return (
    <View style={styles.bannerContainer}>
      <View style={styles.bannerCard}>
        <View style={styles.topMeta}>
          <View style={styles.alertIndicator}>
            <Text style={styles.bellIcon}>🔔</Text>
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
            activeOpacity={0.8}
          >
            <Text style={styles.doneBtnText}>✓ MARK AS DONE</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dismissBtn} onPress={onDismiss} activeOpacity={0.7}>
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
    borderWidth: 2,
    borderColor: theme.colors.accent,
    borderRadius: 14,
    padding: 16,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 20
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
  bellIcon: {
    fontSize: 14,
    marginRight: 6
  },
  alertLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    color: theme.colors.accent
  },
  catBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1
  },
  catText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    marginBottom: 14,
    lineHeight: 22
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  doneBtn: {
    flex: 1,
    backgroundColor: theme.colors.accent,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center"
  },
  doneBtnText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
    color: theme.colors.accentText
  },
  dismissBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center"
  },
  dismissBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.textMuted
  }
});
