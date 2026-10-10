import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { theme } from "../theme.js";

export function OverviewScreen({ tasks, categories }) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "Done").length;
  const pending = tasks.filter((t) => t.status !== "Done").length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>OVERVIEW & SYSTEM</Text>
        <Text style={styles.subtitle}>DailyDo Product & AWS Architecture</Text>
      </View>

      {/* Metric Cards Row */}
      <View style={styles.metricsCard}>
        <Text style={styles.cardHeaderTitle}>DAILY PROGRESS</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>{completionRate}%</Text>
            <Text style={styles.metricLbl}>Completion Rate</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>{pending}</Text>
            <Text style={styles.metricLbl}>Active Tasks</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>{categories.length}</Text>
            <Text style={styles.metricLbl}>Categories</Text>
          </View>
        </View>
      </View>

      {/* AWS Cloud Infrastructure Status */}
      <View style={styles.card}>
        <Text style={styles.cardHeaderTitle}>AWS INFRASTRUCTURE</Text>
        <Text style={styles.cardHeaderDesc}>
          Enterprise cloud architecture deployed in region us-east-1
        </Text>

        <View style={styles.infraList}>
          <View style={styles.infraRow}>
            <View style={styles.statusDot} />
            <View style={styles.infraInfo}>
              <Text style={styles.infraTitle}>Amazon Bedrock</Text>
              <Text style={styles.infraDetail}>amazon.nova-micro-v1:0 · Multi-Task Extraction</Text>
            </View>
            <Text style={styles.infraBadge}>ONLINE</Text>
          </View>

          <View style={styles.infraRow}>
            <View style={styles.statusDot} />
            <View style={styles.infraInfo}>
              <Text style={styles.infraTitle}>Amazon DynamoDB</Text>
              <Text style={styles.infraDetail}>Table: DailyDo_Tasks · Cloud Persistence</Text>
            </View>
            <Text style={styles.infraBadge}>ACTIVE</Text>
          </View>

          <View style={styles.infraRow}>
            <View style={styles.statusDot} />
            <View style={styles.infraInfo}>
              <Text style={styles.infraTitle}>Amazon S3</Text>
              <Text style={styles.infraDetail}>Bucket: dailydo-audio-855735869000 (Isolated)</Text>
            </View>
            <Text style={styles.infraBadge}>SECURED</Text>
          </View>
        </View>
      </View>

      {/* Product Spec Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeaderTitle}>PRODUCT TAXONOMY</Text>
        <Text style={styles.cardHeaderDesc}>
          Custom taxonomy dynamically sent to Bedrock Nova Micro on every prompt for hyper-accurate classification.
        </Text>
        <View style={styles.categoryTags}>
          {categories.map((c) => (
            <View key={c} style={styles.tagPill}>
              <Text style={styles.tagText}>{c}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg
  },
  scrollContent: {
    padding: 18
  },
  header: {
    marginBottom: 16
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
  metricsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  cardHeaderTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: theme.colors.primary,
    letterSpacing: 1,
    marginBottom: 2
  },
  cardHeaderDesc: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 14
  },
  metricsGrid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8
  },
  metricItem: {
    flex: 1,
    alignItems: "center"
  },
  metricVal: {
    fontSize: 22,
    fontWeight: "900",
    color: theme.colors.textPrimary
  },
  metricLbl: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    marginTop: 2
  },
  metricDivider: {
    width: 1,
    height: 32,
    backgroundColor: theme.colors.border
  },
  infraList: {
    gap: 12
  },
  infraRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.bg,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#15803D",
    marginRight: 10
  },
  infraInfo: {
    flex: 1
  },
  infraTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: theme.colors.textPrimary
  },
  infraDetail: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 1
  },
  infraBadge: {
    fontSize: 9,
    fontWeight: "900",
    color: "#15803D",
    backgroundColor: "#DCFCE7",
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 6,
    letterSpacing: 0.5
  },
  categoryTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  tagPill: {
    backgroundColor: theme.colors.primaryLight,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.primary
  }
});
