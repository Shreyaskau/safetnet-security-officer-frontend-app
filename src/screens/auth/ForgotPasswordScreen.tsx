import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { colors, typography, spacing } from '../../utils';
import { authService } from '../../api/services/authService';
import Toast from 'react-native-toast-message';

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');

  const handleSubmit = async () => {
    if (!email) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your email',
      });
      return;
    }

    try {
      await authService.forgotPassword(email);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Password reset link sent to your email',
      });
      navigation.goBack();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to send reset link',
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Forgot Password</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          Enter your email address and we'll send you a link to reset your password.
        </Text>

        <Input
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon={<Text style={styles.icon}>📧</Text>}
        />

        <Button
          title="SEND RESET LINK"
          onPress={handleSubmit}
          style={styles.submitButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  backIcon: {
    fontSize: 24,
    color: colors.darkText,
  },
  title: {
    ...typography.sectionHeader,
  },
  placeholder: {
    width: 24,
  },
  content: {
    padding: spacing.lg,
  },
  description: {
    ...typography.body,
    color: colors.lightText,
    marginBottom: spacing.xl,
  },
  icon: {
    fontSize: 20,
    color: colors.mediumGray,
  },
  submitButton: {
    marginTop: spacing.base,
  },
});












