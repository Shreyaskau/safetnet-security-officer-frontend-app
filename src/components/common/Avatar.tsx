import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { colors } from '../../utils';

interface AvatarProps {
  source?: { uri: string } | number;
  size?: number;
  name?: string;
  borderColor?: string;
  borderWidth?: number;
  showStatus?: boolean;
  statusColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  size = 56,
  name,
  borderColor,
  borderWidth = 0,
  showStatus = false,
  statusColor = colors.online,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {source ? (
        <Image
          source={source}
          style={[
            styles.image,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth,
              borderColor: borderColor || 'transparent',
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth,
              borderColor: borderColor || 'transparent',
            },
          ]}
        >
          <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
            {name ? getInitials(name) : 'U'}
          </Text>
        </View>
      )}
      {showStatus && (
        <View
          style={[
            styles.statusIndicator,
            {
              backgroundColor: statusColor,
              width: size * 0.25,
              height: size * 0.25,
              borderRadius: (size * 0.25) / 2,
              borderWidth: 2,
              borderColor: colors.white,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: colors.mediumGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: colors.white,
    fontWeight: '600',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
});













