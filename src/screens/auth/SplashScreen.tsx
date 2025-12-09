import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { useAppSelector } from '../../redux/hooks';
import { colors, typography, spacing } from '../../utils';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const SplashScreen = ({ navigation }: any) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigation.replace('Main');
      } else {
        navigation.replace('Login');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🛡️</Text>
        </View>
        <Text style={styles.appName}>SafeTNet</Text>
        <Text style={styles.subtitle}>Security Officer Portal</Text>
        <LoadingSpinner size="small" color={colors.white} text="Loading..." />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBackground,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    fontSize: 64,
  },
  appName: {
    ...typography.appTitle,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.7,
    marginBottom: spacing.xl,
  },
});












