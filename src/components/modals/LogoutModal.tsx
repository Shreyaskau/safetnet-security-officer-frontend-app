import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Button } from '../common/Button';
import { colors, typography, spacing } from '../../utils';

interface LogoutModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  visible,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🚪</Text>
          </View>

          <Text style={styles.title}>Logout</Text>
          <Text style={styles.message}>
            Are you sure you want to logout? You will need to sign in again to
            access the app.
          </Text>

          <View style={styles.actions}>
            <Button
              title="LOGOUT"
              onPress={onConfirm}
              variant="danger"
              style={styles.logoutButton}
            />
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.base,
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.lg,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    ...typography.screenHeader,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  message: {
    ...typography.body,
    textAlign: 'center',
    color: colors.lightText,
    marginBottom: spacing.lg,
  },
  actions: {
    gap: spacing.md,
  },
  logoutButton: {
    width: '100%',
  },
  cancelButton: {
    width: '100%',
    height: 48,
    borderWidth: 2,
    borderColor: colors.borderGray,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    ...typography.buttonLarge,
    color: colors.lightText,
  },
});

