// Mock for react-native-reanimated to avoid build issues
// This allows @react-navigation/drawer to import reanimated without errors
// Note: Animations will be disabled, but navigation will work

import { View, Text, ScrollView, FlatList, Image } from 'react-native';

export const useSharedValue = (init) => ({ value: init });
export const useAnimatedStyle = (fn) => ({});
export const withTiming = (toValue, config) => toValue;
export const withSpring = (toValue, config) => toValue;
export const withRepeat = (animation, numberOfReps, reverse) => animation;
export const withSequence = (...animations) => animations[0];
export const withDelay = (delay, animation) => animation;
export const cancelAnimation = () => {};
export const runOnJS = (fn) => fn;
export const runOnUI = (fn) => fn;
export const Easing = {
  linear: 'linear',
  ease: 'ease',
  quad: 'quad',
  cubic: 'cubic',
  poly: 'poly',
  sin: 'sin',
  circle: 'circle',
  exp: 'exp',
  elastic: 'elastic',
  back: 'back',
  bounce: 'bounce',
  bezier: 'bezier',
  in: (easing) => easing,
  out: (easing) => easing,
  inOut: (easing) => easing,
};
export const Extrapolate = {
  EXTEND: 'extend',
  CLAMP: 'clamp',
  IDENTITY: 'identity',
};
export const interpolate = (value, inputRange, outputRange, extrapolate) => outputRange[0];
export const useAnimatedGestureHandler = (handlers) => handlers;
export const useAnimatedReaction = (prepare, react) => {};
export const useDerivedValue = (processor) => ({ value: processor() });
export const useAnimatedScrollHandler = (handlers) => handlers;
export const useAnimatedRef = () => ({ current: null });
export const measure = async () => ({ x: 0, y: 0, width: 0, height: 0, pageX: 0, pageY: 0 });
export const scrollTo = () => {};
export const setGestureState = () => {};

// Additional exports that drawer might need
export const useAnimatedProps = (props) => props;
export const useFrameCallback = (callback) => {};
export const enableScreens = () => {};
export const enableFreeze = () => {};

// Critical: isConfigured tells drawer that Reanimated is available
// This prevents drawer from trying to use legacy implementation
export const isConfigured = () => true;

const Reanimated = {
  View,
  Text,
  ScrollView,
  FlatList,
  Image,
  createAnimatedComponent: (component) => component,
  isConfigured: () => true, // Tell drawer that Reanimated is configured
};

// Export as default and named export for compatibility
export default Reanimated;

