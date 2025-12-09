import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, spacing } from '../../utils';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const AlertCardSkeleton = () => {
  return (
    <View style={styles.cardSkeleton}>
      <View style={styles.leftAccent} />
      <SkeletonLoader width={56} height={56} borderRadius={28} />
      <View style={styles.contentSkeleton}>
        <SkeletonLoader width="60%" height={16} style={styles.marginBottom} />
        <SkeletonLoader width="80%" height={14} style={styles.marginBottom} />
        <SkeletonLoader width="40%" height={12} />
      </View>
      <SkeletonLoader width={90} height={36} borderRadius={18} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.mediumGray,
  },
  cardSkeleton: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.base,
    marginBottom: spacing.md,
    marginHorizontal: spacing.base,
    alignItems: 'center',
  },
  leftAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.borderGray,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  contentSkeleton: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  marginBottom: {
    marginBottom: spacing.xs,
  },
});












