import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors, shadows } from '../../utils';

interface ScoreData {
  label: string;
  value: number;
  color: string;
  gradientColors: string[];
  icon: string;
  position: 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft';
}

interface PerformanceChartProps {
  scores: {
    overall: number;
    performance: number;
    efficiency: number;
    reliability: number;
    response: number;
  };
}

const { width } = Dimensions.get('window');
const CONTAINER_SIZE = Math.min(width - 80, 320); // Reduced to accommodate labels
const CENTER_CIRCLE_SIZE = CONTAINER_SIZE * 0.45; // 45% of container - larger center
const OUTER_CIRCLE_SIZE = CONTAINER_SIZE * 0.22; // 22% of container - slightly larger outer circles
const RING_WIDTH = 10; // Thicker ring for better visibility
const CENTER_PADDING = 20;
const LABEL_OFFSET = 50; // Increased offset to move labels further from circles

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ scores }) => {
  const scoreData: ScoreData[] = [
    {
      label: 'Performance',
      value: scores.performance,
      color: '#F97316', // Orange
      gradientColors: ['#F97316', '#EF4444'], // Orange to Red
      icon: '📊',
      position: 'topLeft',
    },
    {
      label: 'Efficiency',
      value: scores.efficiency,
      color: '#8B5CF6', // Purple
      gradientColors: ['#8B5CF6', '#6366F1'], // Purple to Blue
      icon: '⚡',
      position: 'topRight',
    },
    {
      label: 'Reliability',
      value: scores.reliability,
      color: '#3B82F6', // Blue
      gradientColors: ['#3B82F6', '#EC4899'], // Blue to Pink
      icon: '🛡️',
      position: 'bottomRight',
    },
    {
      label: 'Response',
      value: scores.response,
      color: '#EC4899', // Pink
      gradientColors: ['#EC4899', '#F43F5E'], // Pink to Red
      icon: '🚀',
      position: 'bottomLeft',
    },
  ];

  // Calculate positions for outer circles - increased spacing from center
  const getPosition = (position: string) => {
    const centerX = CONTAINER_SIZE / 2;
    const centerY = CONTAINER_SIZE / 2;
    // Significantly increased radius to push outer circles further from center
    // Using 60% of available space instead of 50% for more freedom
    const availableSpace = (CONTAINER_SIZE - CENTER_CIRCLE_SIZE) / 2;
    const radius = availableSpace * 0.75; // Use 75% of available space for better distribution
    
    switch (position) {
      case 'topLeft':
        return {
          top: centerY - radius - OUTER_CIRCLE_SIZE / 2,
          left: centerX - radius - OUTER_CIRCLE_SIZE / 2,
        };
      case 'topRight':
        return {
          top: centerY - radius - OUTER_CIRCLE_SIZE / 2,
          right: centerX - radius - OUTER_CIRCLE_SIZE / 2,
        };
      case 'bottomRight':
        return {
          bottom: centerY - radius - OUTER_CIRCLE_SIZE / 2,
          right: centerX - radius - OUTER_CIRCLE_SIZE / 2,
        };
      case 'bottomLeft':
        return {
          bottom: centerY - radius - OUTER_CIRCLE_SIZE / 2,
          left: centerX - radius - OUTER_CIRCLE_SIZE / 2,
        };
      default:
        return { top: 0, left: 0 };
    }
  };

  // Calculate progress angle for circular progress
  const getProgressAngle = (value: number) => {
    return (value / 100) * 360;
  };

  return (
    <View style={styles.container}>
      {/* Main Circular Chart Container */}
      <View style={[styles.chartContainer, { width: CONTAINER_SIZE, height: CONTAINER_SIZE }]}>
        {/* Outer Gradient Ring - Using multiple colored segments */}
        <View style={[styles.outerRing, { width: CONTAINER_SIZE, height: CONTAINER_SIZE, borderRadius: CONTAINER_SIZE / 2 }]}>
          {/* Top Left Segment - Orange */}
          <View style={[styles.ringSegment, {
            top: 0,
            left: 0,
            width: CONTAINER_SIZE / 2,
            height: CONTAINER_SIZE / 2,
            borderTopLeftRadius: CONTAINER_SIZE / 2,
            backgroundColor: '#F97316' + '30',
          }]} />
          {/* Top Right Segment - Purple */}
          <View style={[styles.ringSegment, {
            top: 0,
            right: 0,
            width: CONTAINER_SIZE / 2,
            height: CONTAINER_SIZE / 2,
            borderTopRightRadius: CONTAINER_SIZE / 2,
            backgroundColor: '#8B5CF6' + '30',
          }]} />
          {/* Bottom Right Segment - Blue */}
          <View style={[styles.ringSegment, {
            bottom: 0,
            right: 0,
            width: CONTAINER_SIZE / 2,
            height: CONTAINER_SIZE / 2,
            borderBottomRightRadius: CONTAINER_SIZE / 2,
            backgroundColor: '#3B82F6' + '30',
          }]} />
          {/* Bottom Left Segment - Pink */}
          <View style={[styles.ringSegment, {
            bottom: 0,
            left: 0,
            width: CONTAINER_SIZE / 2,
            height: CONTAINER_SIZE / 2,
            borderBottomLeftRadius: CONTAINER_SIZE / 2,
            backgroundColor: '#EC4899' + '30',
          }]} />
        </View>

        {/* Center Circle - Overall Score */}
        <View style={[styles.centerCircle, {
          width: CENTER_CIRCLE_SIZE,
          height: CENTER_CIRCLE_SIZE,
          borderRadius: CENTER_CIRCLE_SIZE / 2,
        }]}>
          <View style={[styles.centerCircleInner, {
            width: CENTER_CIRCLE_SIZE - 4,
            height: CENTER_CIRCLE_SIZE - 4,
            borderRadius: (CENTER_CIRCLE_SIZE - 4) / 2,
          }]}>
            <Text style={styles.centerTitle}>Overall</Text>
            <Text style={styles.centerValue}>{scores.overall}%</Text>
            <View style={styles.centerDots}>
              <View style={[styles.dot, { backgroundColor: '#DC2626' }]} />
              <View style={[styles.dot, { backgroundColor: '#2563EB' }]} />
              <View style={[styles.dot, { backgroundColor: '#8B5CF6' }]} />
              <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
              <View style={[styles.dot, { backgroundColor: '#EC4899' }]} />
            </View>
          </View>
        </View>

        {/* Outer Circles - Four Metrics */}
        {scoreData.map((item, index) => {
          const position = getPosition(item.position);
          const progressAngle = getProgressAngle(item.value);
          
          return (
            <View
              key={index}
              style={[
                styles.outerCircleContainer,
                {
                  width: OUTER_CIRCLE_SIZE,
                  height: OUTER_CIRCLE_SIZE,
                  ...position,
                },
              ]}
            >
              {/* Circular Progress Ring */}
              <View style={[styles.outerCircleRing, {
                width: OUTER_CIRCLE_SIZE,
                height: OUTER_CIRCLE_SIZE,
                borderRadius: OUTER_CIRCLE_SIZE / 2,
                borderWidth: RING_WIDTH,
              }]}>
                {/* Progress Arc */}
                {progressAngle > 0 && (
                  <View
                    style={[
                      styles.progressArc,
                      {
                        width: OUTER_CIRCLE_SIZE,
                        height: OUTER_CIRCLE_SIZE,
                        borderRadius: OUTER_CIRCLE_SIZE / 2,
                        borderTopWidth: RING_WIDTH,
                        borderRightWidth: RING_WIDTH,
                        borderTopColor: item.color,
                        borderRightColor: item.color,
                        borderLeftColor: 'transparent',
                        borderBottomColor: 'transparent',
                        transform: [{ rotate: progressAngle <= 180 ? `${progressAngle - 90}deg` : '90deg' }],
                      },
                    ]}
                  />
                )}
                {progressAngle > 180 && (
                  <View
                    style={[
                      styles.progressArc,
                      {
                        width: OUTER_CIRCLE_SIZE,
                        height: OUTER_CIRCLE_SIZE,
                        borderRadius: OUTER_CIRCLE_SIZE / 2,
                        borderBottomWidth: RING_WIDTH,
                        borderLeftWidth: RING_WIDTH,
                        borderBottomColor: item.color,
                        borderLeftColor: item.color,
                        borderTopColor: 'transparent',
                        borderRightColor: 'transparent',
                        transform: [{ rotate: `${progressAngle - 270}deg` }],
                      },
                    ]}
                  />
                )}
              </View>

              {/* Inner Circle with Solid Color */}
              <View
                style={[styles.outerCircleInner, {
                  width: OUTER_CIRCLE_SIZE - RING_WIDTH * 2,
                  height: OUTER_CIRCLE_SIZE - RING_WIDTH * 2,
                  borderRadius: (OUTER_CIRCLE_SIZE - RING_WIDTH * 2) / 2,
                  backgroundColor: item.gradientColors[0] + 'CC', // Use first gradient color with opacity
                }]}
              >
                <Text style={styles.outerIcon}>{item.icon}</Text>
              </View>

            </View>
          );
        })}

        {/* Labels - Positioned at their respective corners */}
        {scoreData.map((item) => {
          const labelPosition = getLabelPositionForCorner(item.position);
          const isLeft = item.position.includes('Left');
          
          return (
            <View key={item.label} style={[styles.metricLabelContainer, labelPosition, {
              alignItems: isLeft ? 'flex-start' : 'flex-end',
            }]}>
              {/* Label text first */}
              <Text style={[styles.outerLabelText, { 
                color: item.color,
                textAlign: isLeft ? 'left' : 'right',
                marginBottom: 8, // Spacing between label and percentage
              }]} numberOfLines={1}>
                {item.label}
              </Text>
              {/* Percentage below label */}
              <View style={[styles.valueBadge, { backgroundColor: item.color + '10' }]}>
                <Text style={[styles.outerLabelValue, { color: item.color }]}>{item.value}%</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// Helper to position labels at their respective corners
const getLabelPositionForCorner = (position: string) => {
  const cornerOffset = 0; // Extreme corner positioning
  
  switch (position) {
    case 'topLeft':
      return { 
        top: cornerOffset, // Top-left corner
        left: cornerOffset,
      };
    case 'topRight':
      return { 
        top: cornerOffset, // Top-right corner
        right: cornerOffset,
      };
    case 'bottomRight':
      return { 
        bottom: cornerOffset, // Bottom-right corner
        right: cornerOffset,
      };
    case 'bottomLeft':
      return { 
        bottom: cornerOffset, // Bottom-left corner
        left: cornerOffset,
      };
    default:
      return {};
  }
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20, // Add horizontal padding for labels
    overflow: 'visible', // Allow labels to be visible
  },
  chartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    overflow: 'visible', // Allow labels to be visible
  },
  outerRing: {
    position: 'absolute',
    ...shadows.lg,
  },
  ringSegment: {
    position: 'absolute',
  },
  centerCircle: {
    position: 'absolute',
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    zIndex: 10, // Ensure center circle is above outer circles
  },
  centerCircleInner: {
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    zIndex: 10, // Ensure center content is above outer circles
  },
  centerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.darkText,
    marginBottom: 6,
    letterSpacing: 0.2,
    zIndex: 11, // Ensure title is visible
  },
  centerValue: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 8,
    letterSpacing: -0.8,
    zIndex: 11, // Ensure value is visible
  },
  centerDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 11, // Ensure dots are visible
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2.5,
  },
  outerCircleContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5, // Lower than center circle
  },
  outerCircleRing: {
    position: 'absolute',
    borderColor: '#E5E7EB',
  },
  progressArc: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  outerCircleInner: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  outerIcon: {
    fontSize: 24,
  },
  outerLabelContainer: {
    position: 'absolute',
    minWidth: 90,
    maxWidth: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabelContainer: {
    position: 'absolute',
    minWidth: 90,
    maxWidth: 110,
    justifyContent: 'flex-end',
    zIndex: 15,
  },
  outerLabelText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8, // Spacing between percentage and label
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  valueBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  outerLabelValue: {
    fontSize: 14,
    fontWeight: '800',
  },
});
