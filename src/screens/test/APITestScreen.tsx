/**
 * API Test Screen
 * Visual interface for testing all APIs
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import APITestSuite, { TestResult } from '../../utils/apiTestSuite';
import { colors, typography, spacing } from '../../utils';

export const APITestScreen = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [username, setUsername] = useState('test_officer');
  const [password, setPassword] = useState('TestOfficer123!');

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    setSummary(null);

    try {
      const testSuite = new APITestSuite();
      const testResults = await testSuite.runAllTests(username, password);
      const testSummary = testSuite.getSummary();

      setResults(testResults);
      setSummary(testSummary);

      // Show summary alert
      Alert.alert(
        'Test Complete',
        `✅ Success: ${testSummary.success}\n❌ Errors: ${testSummary.errors}\n⏭️ Skipped: ${testSummary.skipped}\n📝 Total: ${testSummary.total}\n\nSuccess Rate: ${testSummary.successRate}%`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('Test Error', error.message || 'Failed to run tests');
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return colors.success || '#4CAF50';
      case 'error':
        return colors.error || '#F44336';
      case 'skipped':
        return colors.warning || '#FF9800';
      default:
        return colors.gray;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'skipped':
        return '⏭️';
      default:
        return '⚪';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>API Test Suite</Text>
        <Text style={styles.subtitle}>Test all connected APIs</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Summary Card */}
        {summary && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Test Summary</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{summary.success}</Text>
                <Text style={styles.summaryLabel}>Success</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: colors.error }]}>
                  {summary.errors}
                </Text>
                <Text style={styles.summaryLabel}>Errors</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: colors.warning }]}>
                  {summary.skipped}
                </Text>
                <Text style={styles.summaryLabel}>Skipped</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{summary.total}</Text>
                <Text style={styles.summaryLabel}>Total</Text>
              </View>
            </View>
            <View style={styles.successRate}>
              <Text style={styles.successRateText}>
                Success Rate: {summary.successRate}%
              </Text>
            </View>
          </View>
        )}

        {/* Test Results */}
        {results.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Test Results</Text>
            {results.map((result, index) => (
              <View key={index} style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultIcon}>{getStatusIcon(result.status)}</Text>
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName}>{result.name}</Text>
                    <Text
                      style={[styles.resultStatus, { color: getStatusColor(result.status) }]}
                    >
                      {result.status.toUpperCase()}
                    </Text>
                  </View>
                  {result.duration && (
                    <Text style={styles.resultDuration}>{result.duration}ms</Text>
                  )}
                </View>
                <Text style={styles.resultMessage}>{result.message}</Text>
                {result.error && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>
                      {typeof result.error === 'string'
                        ? result.error
                        : JSON.stringify(result.error, null, 2)}
                    </Text>
                  </View>
                )}
                {result.data && (
                  <View style={styles.dataContainer}>
                    <Text style={styles.dataLabel}>Response:</Text>
                    <Text style={styles.dataText} numberOfLines={3}>
                      {typeof result.data === 'string'
                        ? result.data
                        : JSON.stringify(result.data, null, 2)}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {results.length === 0 && !isRunning && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tests run yet</Text>
            <Text style={styles.emptySubtext}>Tap "Run All Tests" to start</Text>
          </View>
        )}
      </ScrollView>

      {/* Run Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.runButton, isRunning && styles.runButtonDisabled]}
          onPress={runTests}
          disabled={isRunning}
        >
          {isRunning ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.runButtonText}>Run All Tests</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGrayBg,
  },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    paddingTop: spacing.xl + 20,
  },
  title: {
    ...typography.h1,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.white,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...typography.shadow,
  },
  summaryTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.gray,
  },
  successRate: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    alignItems: 'center',
  },
  successRateText: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.primary,
  },
  resultsContainer: {
    marginBottom: spacing.xl,
  },
  resultsTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  resultCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...typography.shadow,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  resultIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  resultStatus: {
    ...typography.caption,
    fontWeight: '600',
  },
  resultDuration: {
    ...typography.caption,
    color: colors.gray,
  },
  resultMessage: {
    ...typography.body,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  errorContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.error + '10',
    borderRadius: 8,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    fontFamily: 'monospace',
  },
  dataContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.lightGrayBg,
    borderRadius: 8,
  },
  dataLabel: {
    ...typography.caption,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  dataText: {
    ...typography.caption,
    color: colors.gray,
    fontFamily: 'monospace',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    ...typography.h3,
    color: colors.gray,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.gray,
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  runButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  runButtonDisabled: {
    opacity: 0.6,
  },
  runButtonText: {
    ...typography.button,
    color: colors.white,
  },
});

