import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { colors, typography, spacing } from '../../utils';

interface BroadcastProgressModalProps {
  visible: boolean;
  progress: number; // 0-100
  totalUsers: number;
  onCancel: () => void;
}

export const BroadcastProgressModal: React.FC<BroadcastProgressModalProps> = ({
  visible,
  progress,
  totalUsers,
  onCancel,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [progress, visible]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Broadcasting Alert</Text>
          <Text style={styles.message}>Sending to {totalUsers} users...</Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressWidth,
                  },
                ]}
              />
            </View>
          </View>

          <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  title: {
    ...typography.screenHeader,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  message: {
    ...typography.body,
    color: colors.lightText,
    marginBottom: spacing.lg,
    textAlign: 'left',
  },
  progressContainer: {
    marginBottom: spacing.lg,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.lightGrayBg,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  cancelText: {
    ...typography.secondary,
    color: colors.lightText,
  },
});












