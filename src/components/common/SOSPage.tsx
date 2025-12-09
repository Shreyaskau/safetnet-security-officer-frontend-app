import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView } from "react-native";
import { listSOS } from "../../api/SecurityAPI";
import { colors, spacing, typography, shadows } from "../../utils";

const SOSPage = () => {
  const [sosList, setSosList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ensure sosList is always an array
  const safeSosList = Array.isArray(sosList) ? sosList : [];

  useEffect(() => {
    const fetchSOS = async () => {
      try {
        setError(null);
        setLoading(true);
        const res = await listSOS();
        
        // Handle different response structures
        // Response could be: { data: [...] } or directly an array
        let sosData = [];
        if (Array.isArray(res.data)) {
          sosData = res.data;
        } else if (res.data && Array.isArray(res.data.results)) {
          sosData = res.data.results;
        } else if (res.data && Array.isArray(res.data.data)) {
          sosData = res.data.data;
        } else if (Array.isArray(res)) {
          sosData = res;
        } else {
          console.warn("Unexpected SOS response format:", res);
          sosData = [];
        }
        
        setSosList(sosData);
      } catch (error: any) {
        console.error("Failed to load SOS alerts:", error);
        // Handle different error types gracefully
        const status = error.response && error.response.status ? error.response.status : undefined;
        
        if (status === 401) {
          setError("Authentication required. Please login again.");
        } else if (status === 503) {
          setError("Service temporarily unavailable. The server is down or overloaded. Please try again later.");
        } else if (status >= 500) {
          setError("Server error. Please try again later.");
        } else if (!error.response) {
          setError("Network error. Please check your internet connection.");
        } else {
          setError("Failed to load SOS alerts. Please try again later.");
        }
        setSosList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSOS();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading SOS Alerts...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>SOS Alerts</Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {!error && safeSosList.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No SOS alerts found.</Text>
          </View>
        )}
        
        {!error && safeSosList.length > 0 && (
          <>
            {safeSosList.map((item, index) => (
              <View key={item.id || item.pk || index} style={styles.card}>
                <View style={styles.cardRow}>
                  <Text style={styles.label}>ID:</Text>
                  <Text style={styles.value}>{String(item.id || item.pk || index)}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.label}>Description:</Text>
                  <Text style={styles.value}>{item.description || item.message || "N/A"}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.label}>Status:</Text>
                  <Text style={[styles.value, item.is_resolved || item.status === 'resolved' ? styles.resolved : styles.active]}>
                    {item.is_resolved || item.status === 'resolved' ? "Resolved" : "Active"}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGrayBg,
  },
  contentContainer: {
    padding: spacing.base,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.lightGrayBg,
  },
  loadingText: {
    ...typography.body,
    color: colors.lightText,
    marginTop: spacing.md,
  },
  title: {
    ...typography.screenHeader,
    color: colors.darkText,
    marginBottom: spacing.lg,
  },
  emptyContainer: {
    padding: spacing.lg,
    alignItems: "center",
  },
  emptyText: {
    ...typography.body,
    color: colors.lightText,
  },
  errorContainer: {
    padding: spacing.lg,
    backgroundColor: colors.badgeRedBg,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.emergencyRed,
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.white,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    ...shadows.sm,
  },
  cardRow: {
    flexDirection: "row",
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.body,
    fontWeight: "600",
    color: colors.darkText,
    marginRight: spacing.xs,
  },
  value: {
    ...typography.body,
    color: colors.lightText,
    flex: 1,
  },
  active: {
    color: colors.emergencyRed,
    fontWeight: "600",
  },
  resolved: {
    color: colors.successGreen,
    fontWeight: "600",
  },
});

export default SOSPage;
